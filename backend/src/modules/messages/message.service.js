import prisma from "../../config/prisma.js"
import ApiError from "../../utils/apiError.js"

export const sendMessage = async (userId , conversationId , content , hidden) => {
    if(!content || content.trim().length === 0) {
        throw new ApiError(400,"Message cannot be empty")
    }

    const conversation = await prisma.conversation.findUnique({
        where : {id : conversationId }
    })

    if(!conversation) {
        throw new ApiError(400,"No conversation exist")
    }

    const membership = await prisma.conversationParticipants.findFirst({
        where : {
            conversationId,
            userId,
            leftAt : null
        }
    })

    if(!membership) {
        throw new ApiError(400,"User is not an Active member")
    }

    if(conversation.type === 'direct') {
        const otherUser = await prisma.conversationParticipants.findFirst({
            where : {
                conversationId,
                userId : {not : userId},
                leftAt : null
            }
        })

        if(!otherUser) {
            throw new ApiError(400,"Other participant not active")
        }

        const connection = await prisma.connection.findFirst({
            where : {
                status : 'accepted',
                OR : [
                    {userAId : userId , userBId : otherUser.userId},
                    {userAId : otherUser.userId , userBId : userId}
                ]
            }
        })

        if(!connection) {
            throw new ApiError(400,"Connection no longer active")
        }
    }

    const message = await prisma.message.create({
        data : {
            conversationId,
            senderId : userId,
            visibleText : content
        }
    })

    if(hidden && hidden.EncryptedPayload && hidden.recipientUserIds?.length ) {
        const recipients = [... new Set([
            userId,
            ...hidden.recipientUserIds
        ])]

        const devices = await prisma.device.findMany({
            where: {
                userId : {in : recipients},
                status : "active"
            }
        })

        const payload = devices.map(device => (
            {
                messageId : message.id,
                deviceId : device.id,
                recipientUserId : device.userId,
                encrypted : hidden.EncryptedPayload
            }
        ))

        await prisma.hiddenPayload.createMany({
            data : payload
        })
    }
    
    return message;
}

export const fetchMessage = async(userId,conversationId) => {
    // console.log(userId)
    // console.log(conversationId)
    const membership = await prisma.conversationParticipants.findFirst({
        where : {
            conversationId,
            userId
        }
        ,
        orderBy : {
            joinedAt : 'desc'
        }
    })

    if(!membership) {
        throw new ApiError(400,"Not an participant of this conversation")
    }

    const leftAt = membership.leftAt;
    const joinedAt = membership.joinedAt;

    const messages = await prisma.message.findMany({
        where : {
            conversationId,
            createdAt : {
                gte : joinedAt,
                ...(leftAt && {lt : leftAt})
            }

        },
        include : {
            hiddenPayloads : {
                where : {
                    recipientUserId : userId
                },
                select : {
                    encrypted : true
                }
            } 
        },
        orderBy : {
            createdAt  : 'asc'
        }
    })
    console.log("hideen")
    console.log(messages[0].hiddenPayloads);

    const reformed = messages.map(message => {
        const hidden = message.hiddenPayloads[0]

        return {
            id : message.id,
            conversationId : message.conversationId,
            senderId : message.senderId,
            visibleText : message.visibleText,
            createdAt : message.createdAt,
            hiddenEncrypted : hidden ? hidden.encrypted : null
        }

    })

    return reformed
}