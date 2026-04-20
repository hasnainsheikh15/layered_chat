import { Router } from "express";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { deleteForMeController, deleteMessageController, editMessageController, getMessages, send, unlockHiddenMessage } from "./message.controller.js";

export const messageRoute = Router();

messageRoute.post('/', verifyJwt, send);

messageRoute.get('/:conversationId', verifyJwt, getMessages);

messageRoute.get('/:messageId/unlock', verifyJwt, unlockHiddenMessage);

messageRoute.delete('/:messageId/delete', verifyJwt, deleteMessageController);

messageRoute.delete('/:messageId/me', verifyJwt, deleteForMeController);

messageRoute.patch('/:messageId/edit', verifyJwt, editMessageController);