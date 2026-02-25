import prisma from "../../config/prisma.js"
import ApiError from "../../utils/apiError.js"

const generatePairKey = (id1, id2) => {
  return [id1, id2].sort().join("_");
};

export const createOrGetConversations = async (userId , targetUserId) => {
    if(userId === targetUserId) {
        throw new ApiError(400,"Cannot create conversation with self")
    }

    return await prisma.$transaction(async (tx) => {
        const connection = await tx.connection.findFirst({
        where : {
            status : 'accepted',
            OR : [
                {userAId : userId , userBId : targetUserId},
                {userAId : targetUserId , userBId : userId}
            ]
        }
    })

    if(!connection) {
        throw new ApiError(403,"Users are not connected")
    }

    const existingConversations = await tx.conversation.findMany({
        where : {
            type : 'direct',
            participants : {
                every : {
                    OR : [
                        {userId},
                        {userId : targetUserId}
                    ]
                }
            }

        },
        include : {
            participants : true
        }
    })

    for(const convo of existingConversations) {
        const participantIds = convo.participants.map(p => p.userId)
        if(participantIds.includes(userId) && participantIds.includes(targetUserId) && participantIds.length === 2) return convo; 
        
    }
    const pairKey = generatePairKey(userId,targetUserId)

    const conversation = await tx.conversation.create({
        data : {
            type : 'direct',
            pairKey,
            participants : {
                create : [
                    {userId},
                    {userId : targetUserId}
                ]
            }
        },
        include : {
            participants : true
        }
    }) 

    return conversation;
    })
}