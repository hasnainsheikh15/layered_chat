import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";

export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Unauthorized : No token"))
        }

        const decoded = verifyToken(token)

        const device = await prisma.device.findUnique({
            where: { id: decoded.deviceId }
        })

        if (!device || !device.status !== 'active') {
            return next(new Error("Invalid device"))
        }

        // Attach the user to the socket 

        socket.user = {
            userId: decoded.userId,
            deviceId: decoded.deviceId
        }

        next()
    } catch (error) {
        next(new Error("Unauthorized"))
    }
}