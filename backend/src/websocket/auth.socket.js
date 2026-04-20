import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";
import cookie from "cookie";

export const socketAuth = async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie || "";

    if (!cookies) {
      return next(new Error("No cookies"));
    }

    const parsed = cookie.parse(cookies)
    const token = parsed.token;

    if(!token) {
      return next(new Error("No token provided"));
    }
    const decoded = verifyToken(token);

    const device = await prisma.device.findUnique({
      where: { id: decoded.deviceId }
    });

    if (!device || device.status !== "active") {
      return next(new Error("Invalid device"));
    }

  
    socket.user = {
      userId: decoded.userId,
      deviceId: decoded.deviceId
    };

    next();

  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Unauthorized"));
  }
};