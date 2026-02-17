import prisma from "../../config/prisma.js"
import ApiError from "../../utils/apiError.js"

export const sendConnectionRequest = async (senderId , targetId) => {
        if(senderId === targetId) {
            throw new ApiError(400,"Cannot request to self")
        }

        const existing = await prisma.connection.findFirst({
            where : {
                OR : [
                    {userAId : senderId , userBId : targetId},
                    {userAId : targetId , userBId : senderId}
                ]
            }
        })

        if(existing) {
            throw new ApiError(409,"Connection already exist")
        }

        const connection = await prisma.connection.create({
            data : {
                userAId : senderId,
                userBId : targetId,
                status : 'Pending'
            }
        })

        return connection
}


export const  acceptRequest = async (connectionId , userId) => {
    const connection = await prisma.connection.findUnique({
        where : {id : connectionId}
    })

    if(!connection) {
        throw new ApiError(404,"Connection not found")
    }

    if(connection.userBId !== userId ) {
        throw new ApiError(401,"Unauthorized to accept the request")
    }

    return prisma.connection.update({
        where : {id : connectionId},
        data : {status : 'accepted'}
    })
}

export const getConnections = async (userId) => {
        return prisma.connection.findMany({
            where : {
                status : 'accepted',
                OR : [
                    {userAId : userId},
                    {userBId : userId}
                ]
            }
        })
}