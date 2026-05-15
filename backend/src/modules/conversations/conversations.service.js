import prisma from "../../config/prisma.js"
import ApiError from "../../utils/apiError.js"

const generatePairKey = (id1, id2) => {
    return [id1, id2].sort().join("_");
};

export const createOrGetConversations = async (userId, targetUserId) => {
    if (userId === targetUserId) {
        throw new ApiError(400, "Cannot create conversation with self")
    }

    return await prisma.$transaction(async (tx) => {
        const connection = await tx.connection.findFirst({
            where: {
                status: 'accepted',
                OR: [
                    { userAId: userId, userBId: targetUserId },
                    { userAId: targetUserId, userBId: userId }
                ]
            }
        })

        if (!connection) {
            throw new ApiError(403, "Users are not connected")
        }

        const existingConversations = await tx.conversation.findMany({
            where: {
                type: "direct",
                AND: [
                    {
                        participants: {
                            some: { userId: userId },
                        },
                    },
                    {
                        participants: {
                            some: { userId: targetUserId },
                        },
                    },
                ],
            },
            include: {
                participants: true
            }
        })

        for (const convo of existingConversations) {
            const participantIds = convo.participants.map(p => p.userId)
            if (participantIds.includes(userId) && participantIds.includes(targetUserId) && participantIds.length === 2) return convo;

        }
        const pairKey = generatePairKey(userId, targetUserId)

        const conversation = await tx.conversation.create({
            data: {
                type: 'direct',
                pairKey,
                participants: {
                    create: [
                        { userId },
                        { userId: targetUserId }
                    ]
                }
            },
            include: {
                participants: true
            }
        })

        return conversation;
    })
}

export const getConversations = async (userId) => {

    // console.log("\n========== GET CONVERSATIONS ==========");
    // console.log("USER ID:", userId);

    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId: userId,
                    leftAt: null // 🔥 CRITICAL FIX
                }
            }
        },
        include: {
            participants: {
                include: {
                    user: true
                }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    // console.log("RAW CONVERSATIONS COUNT:", conversations.length);

    // conversations.forEach(c => {
    //     console.log("CONVO:", c.id);
    //     console.log(
    //         "Participants:",
    //         c.participants.map(p => ({
    //             userId: p.userId,
    //             username: p.user?.username,
    //             leftAt: p.leftAt
    //         }))
    //     );
    // });

    // 🔥 SAFETY FILTER (VERY IMPORTANT)
    const filtered = conversations.filter(convo =>
        convo.participants.some(p => p.userId === userId && p.leftAt === null)
    );

    // console.log("AFTER FILTER COUNT:", filtered.length);

    const result = filtered.map(convo => {
        const lastMessage = convo.messages[0];


        let otherUser = null;

        if (convo.type === 'direct') {
            const participant = convo.participants.find(
                p => p.userId !== userId && p.user
            );

            if (!participant) {
                console.log("⚠️ INVALID DIRECT CONVO:", convo.id);
            }

            otherUser = participant
                ? {
                    id: participant.user.id,
                    username: participant.user.username
                }
                : null;
        }

        // GROUP (future safe)
        let otherUsers = [];

        if (convo.type === 'group') {
            otherUsers = convo.participants
                .filter(p => p.userId !== userId)
                .map(p => ({
                    id: p.user.id,
                    username: p.user.username
                }));
        }

        const selfParticipant = convo.participants.find(
            p => p.userId === userId
        );

        return {
            id: convo.id,
            type: convo.type,
            otherUser,
            otherUsers,
            lastMessage: lastMessage
                ? {
                    text: lastMessage.visibleText,
                    createdAt: lastMessage.createdAt,

                    senderId: lastMessage.senderId,
                    deliveredAt: lastMessage.deliveredAt,
                    seenAt: lastMessage.seenAt
                }
                : null,
            unreadCount: selfParticipant?.unreadCount || 0
        };
    });

    // console.log("FINAL RESULT:", result);
    // console.log("======================================\n");

    return result;
};