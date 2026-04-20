import {Server} from 'socket.io';
import ApiError from '../utils/apiError.js';
import { socketAuth } from './auth.socket.js';
import prisma from '../config/prisma.js';

let io;
const onlineUsers  = new Map()

export const initSocket = (server) => {
    io = new Server(server,{
        cors : {
            origin : "http://localhost:5173",
            methods : ["GET","POST"],
            credentials : true
        }
    })

    io.use(socketAuth)

    io.on('connection',async (socket)=>{

        if (!socket.user) {
        console.log("Unauthorized socket blocked");
        socket.disconnect(); 
        return;
    }
        const userId = socket.user.userId
        socket.join(userId)

        const count = onlineUsers.get(userId) || 0
        onlineUsers.set(userId,count + 1)

        if(count === 0) {
            io.emit('userOnline',{userId})
        }

        const conversations = await prisma.conversationParticipants.findMany({
            where : {
                userId,
                leftAt : null
            },
            select : {
                conversationId : true
            }
        })

        // room join karwao
        conversations.forEach(c => {
            socket.join(c.conversationId)
        });

        socket.on('typing',({conversationId}) => {
            if (!socket.user) return;
            const userId = socket.user.userId

            // typing karne wale user ko nahi dikhna chahiye ye typing so socket not io
            socket.to(conversationId).emit('typing',{
                conversationId,
                userId
            })
        })

        socket.on('stopTyping',({conversationId}) => {
            if (!socket.user) return;
            const userId = socket.user.userId

            socket.to(conversationId).emit('stopTyping',{
                userId,
                conversationId
            })
        })

        socket.on('disconnect',() => {
            if (!socket.user) return;
            const userId = socket.user.userId
            const count = onlineUsers.get(userId) || 0

            if(count <= 1) {
                onlineUsers.delete(userId)
                io.emit('userOffline',{userId})
            }
            else {
                onlineUsers.set(userId,count - 1)
            }

        })
    })
    

    return io;
}

export const getIO = () => {
    if(!io) {
        throw new ApiError(400,"Socket not initialized")
    }

    return io;
}