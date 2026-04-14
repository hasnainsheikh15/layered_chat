import { Router } from "express";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { createDirect, getUserConversations } from "./conversations.controller.js";

const conversationRoute = Router();

conversationRoute.get("/", verifyJwt, getUserConversations);
conversationRoute.post('/direct',verifyJwt,createDirect)


export default conversationRoute