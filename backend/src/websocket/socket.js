import { Server } from 'socket.io';
import ApiError from '../utils/apiError.js';
import { socketAuth } from './auth.socket.js';
import prisma from '../config/prisma.js';
import { activeChats } from './activeChats.js';

let io;
const onlineUsers = new Map()

// activeChats

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    io.use(socketAuth)

    io.on('connection', async (socket) => {

        if (!socket.user) {
            console.log("Unauthorized socket blocked");
            socket.disconnect();
            return;
        }
        const userId = socket.user.userId
        socket.join(userId)

        const count = onlineUsers.get(userId) || 0
        onlineUsers.set(userId, count + 1)

        if (count === 0) {
            io.emit('userOnline', { userId })
        }

        const conversations = await prisma.conversationParticipants.findMany({
            where: {
                userId,
                leftAt: null
            },
            select: {
                conversationId: true
            }
        })

        // room join karwao
        conversations.forEach(c => {
            socket.join(c.conversationId)
        });

        socket.on('typing', ({ conversationId }) => {
            if (!socket.user) return;
            const userId = socket.user.userId

            // typing karne wale user ko nahi dikhna chahiye ye typing so socket not io
            socket.to(conversationId).emit('typing', {
                conversationId,
                userId
            })
        })

        socket.on('stopTyping', ({ conversationId }) => {
            if (!socket.user) return;
            const userId = socket.user.userId

            socket.to(conversationId).emit('stopTyping', {
                userId,
                conversationId
            })
        })

        socket.on('disconnect', () => {
            if (!socket.user) return;
            const userId = socket.user.userId
            const count = onlineUsers.get(userId) || 0

            if (count <= 1) {
                onlineUsers.delete(userId)
                io.emit('userOffline', { userId })
            }
            else {
                onlineUsers.set(userId, count - 1)
            }

            activeChats.delete(socket.user.userId);
        })

        socket.on("openConversation", ({
            conversationId
        }) => {

            activeChats.set(socket.user.userId, conversationId);

        });

        socket.on("closeConversation", () => {

            activeChats.delete(socket.user.userId);

        });

        socket.on("messagesSeen", async ({ conversationId }) => {

            const result = await prisma.message.updateMany({
                where: {

                    conversationId,

                    senderId: {
                        not: socket.user.userId
                    },

                    seenAt: null

                },

                data: {
                    seenAt: new Date()
                }
            });

            // Fetch the updated messages to get their IDs and new seenAt time
            const updatedMessages = await prisma.message.findMany({
                where: {
                    conversationId,
                    senderId: {
                        not: socket.user.userId
                    },
                    seenAt: {
                        not: null
                    }
                },
                select: {
                    id: true,
                    seenAt: true,
                    senderId: true
                }
            });

            // Notify all users in the conversation about seen messages
            io.to(conversationId).emit("messagesSeen", {
                conversationId,
                messages: updatedMessages,
                seenByUserId: socket.user.userId
            });

        }
        );


    })


    return io;
}

export const getIO = () => {
    if (!io) {
        throw new ApiError(400, "Socket not initialized")
    }

    return io;
}