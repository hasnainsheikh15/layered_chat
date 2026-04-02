import { Router } from "express";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { getMessages, send, unlockHiddenMessage } from "./message.controller.js";

export const messageRoute = Router();

messageRoute.post('/',verifyJwt,send)
messageRoute.get('/:conversationId',verifyJwt,getMessages)
messageRoute.post('/:messageId/unlock',verifyJwt,unlockHiddenMessage)