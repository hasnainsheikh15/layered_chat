import { Router } from "express";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { getMessages, send } from "./message.controller.js";

export const messageRoute = Router();

messageRoute.post('/',verifyJwt,send)
messageRoute.get('/:conversationId',verifyJwt,getMessages)