import prisma from "../../config/prisma.js";
import ApiError from "../../utils/apiError.js";
import { activeChats } from "../../websocket/activeChats.js";
import { getIO } from "../../websocket/socket.js";

export const sendMessage = async (
    userId,
    conversationId,
    content,
    hidden
) => {

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, "Message cannot be empty");
    }

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
    });

    if (!conversation) {
        throw new ApiError(400, "No conversation exist");
    }

    const membership = await prisma.conversationParticipants.findFirst({
        where: {
            conversationId,
            userId,
            leftAt: null
        }
    });

    if (!membership) {
        throw new ApiError(400, "User is not an Active member");
    }

    //  direct connection validation
    if (conversation.type === "direct") {

        const otherUser =
            await prisma.conversationParticipants.findFirst({
                where: {
                    conversationId,
                    userId: { not: userId },
                    leftAt: null
                }
            });

        if (!otherUser) {
            throw new ApiError(
                400,
                "Other participant not active"
            );
        }

        const connection =
            await prisma.connection.findFirst({
                where: {
                    status: "accepted",

                    OR: [
                        {
                            userAId: userId,
                            userBId: otherUser.userId
                        },
                        {
                            userAId: otherUser.userId,
                            userBId: userId
                        }
                    ]
                }
            });

        if (!connection) {
            throw new ApiError(
                400,
                "Connection no longer active"
            );
        }
    }

    //  create message
    const message = await prisma.message.create({
        data: {
            conversationId,
            senderId: userId,
            visibleText: content
        }
    });

    //  hidden payload
    if (hidden && hidden.EncryptedPayload) {

        const hiddenParticipants =
            await prisma.conversationParticipants.findMany({
                where: {
                    conversationId,
                    userId: { not: userId },
                    leftAt: null
                }
            });

        const recipientIds =
            hiddenParticipants.map(p => p.userId);

        const devices = await prisma.device.findMany({
            where: {
                userId: { in: recipientIds },
                status: "active"
            }
        });

        const payload = devices.map(device => ({
            messageId: message.id,
            deviceId: device.id,
            recipientUserId: device.userId,
            encrypted: hidden.EncryptedPayload
        }));

        await prisma.hiddenPayload.createMany({
            data: payload
        });
    }

    //  unread logic
    const participants =
        await prisma.conversationParticipants.findMany({
            where: {
                conversationId,
                leftAt: null
            }
        });

    for (const participant of participants) {

        // sender skip
        if (participant.userId === userId) {
            continue;
        }

        //  user recently active in chat?
        const activeConversation =
            activeChats.get(participant.userId);

        const isViewingCurrentChat =
            activeConversation === conversationId;

        const updatedParticipant =
            await prisma.conversationParticipants.update({
                where: {
                    id: participant.id
                },

                data: {
                    unreadCount: isViewingCurrentChat
                        ? 0
                        : {
                            increment: 1
                        },

                    lastReadAt: isViewingCurrentChat
                        ? new Date()
                        : participant.lastReadAt
                }
            });
        //  realtime unread update
        const io = getIO();

        io.to(participant.userId).emit(
            "unreadUpdate",
            {
                conversationId,

                unreadCount:
                    updatedParticipant.unreadCount
            }
        );
    }

    //  bump conversation
    await prisma.conversation.update({
        where: {
            id: conversationId
        },

        data: {
            updatedAt: new Date()
        }
    });

    return message;
};

export const fetchMessage = async (userId, deviceId, conversationId, cursor, limit = 20) => {
    // console.log(userId)
    // console.log(conversationId)
    const membership = await prisma.conversationParticipants.findFirst({
        where: {
            conversationId,
            userId
        }
        ,
        orderBy: {
            joinedAt: 'desc'
        }
    })

    if (!membership) {
        throw new ApiError(400, "Not an participant of this conversation")
    }

    const leftAt = membership.leftAt;
    const joinedAt = membership.joinedAt;

    const messages = await prisma.message.findMany({
        where: {
            conversationId,
            createdAt: {
                gte: joinedAt,
                ...(leftAt && { lt: leftAt })
            },
            deletion: {
                none: {
                    userId: userId
                }
            }

        }, take: limit,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),

        include: {
            hiddenPayloads: {
                where: {
                    recipientUserId: userId,
                    deviceId: deviceId
                },
                select: {
                    encrypted: true
                }

            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const nextCursor = messages.length ? messages[messages.length - 1].id : null
    const ordered = [...messages].reverse()

    const reformed = ordered.map(message => {

        if (message.deletedForBoth) {
            return {
                id: message.id,
                conversationId: message.conversationId,
                senderId: message.senderId,
                visibleText: "This message was deleted",
                createdAt: message.createdAt,
                hasHidden: false
            };
        }
        const hidden = message.hiddenPayloads[0]
        console.log(message.id, "HIDDEN PAYLOAD:", hidden)
        return {
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            visibleText: message.deletedForBoth ? "This message was deleted" : message.visibleText,
            createdAt: message.createdAt,
            deliveredAt: message.deliveredAt,
            seenAt: message.seenAt,
            hasHidden: !!hidden
        }

    })

    await prisma.conversationParticipants.update({
        where: {
            id: membership.id
        },

        data: {
            unreadCount: 0,
            lastReadAt: new Date()
        }
    });

    return { messages: reformed, nextCursor }
}

export const fetchHiddenPayload = async (userId, messageId, deviceId) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId }
    })

    if (!message) {
        throw new ApiError(404, "Message not found")
    }

    const membership = await prisma.conversationParticipants.findFirst({
        where: {
            conversationId: message.conversationId,
            userId,
            leftAt: null
        }
    })

    if (!membership) {
        throw new ApiError(403, "Not an active participant of this conversation")
    }

    const payload = await prisma.hiddenPayload.findFirst({
        where: {
            messageId,
            deviceId,
            recipientUserId: userId
        }
    })

    if (!payload) {
        throw new ApiError(404, "No hidden payload for this message and device")
    }

    return {
        encrypted: payload.encrypted
    }
}

export const deleteMessage = async (userId, messageId) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId }
    })

    if (!message) {
        throw new ApiError(404, "Message not found")
    }

    if (message.senderId !== userId) {
        throw new ApiError(403, "Not allowed to delete the message")
    }

    if (message.deleteWindowExpiry && message.deleteWindowExpiry < new Date()) {
        throw new ApiError(400, "Delete Window Expired")
    }

    await prisma.message.update({
        where: { id: messageId },
        data: {
            deletedForBoth: true,
            visibleText: "This message was deleted"
        }
    })

    return { success: true }
}

export const deleteForMe = async (userId, messageId) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId }
    })

    if (!message) {
        throw new ApiError(404, "Message not found")
    }

    const membership = await prisma.conversationParticipants.findFirst({
        where: {
            conversationId: message.conversationId,
            userId
        }
    })

    if (!membership) {
        throw new ApiError(403, "Not a participant")
    }

    const existing = await prisma.messageDeletion.findUnique({
        where: {
            messageId_userId: {
                messageId,
                userId
            }
        }
    })

    if (existing) {
        return { success: true }
    }

    await prisma.messageDeletion.create({
        data: {
            messageId,
            userId
        }
    })

    return { sucess: true }
}

export const editMessage = async (userId, messageId, newText) => {

    if (!newText && newText.trim().length === 0) {
        throw new ApiError(400, "Message cannot be empty");
    }
    const message = await prisma.message.findUnique({
        where: { id: messageId }
    })

    if (!message) {
        throw new ApiError(404, "Message was not found")
    }

    if (message.senderId !== userId) {
        throw new ApiError(403, "Not allowed")
    }

    if (message.deleteWindowExpiry && message.deleteWindowExpiry < new Date()) {
        throw new ApiError(400, "Window Expired")
    }

    if (message.deletedForBoth) {
        throw new ApiError(403, "Cannot edit deleted message")
    }

    const updated = await prisma.message.update({
        where: { id: messageId },
        data: {
            visibleText: newText
        }
    })

    return updated;
}

