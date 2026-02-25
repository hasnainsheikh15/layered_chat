import { Router } from "express";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { createDirect } from "./conversations.controller.js";

const conversationRoute = Router();

conversationRoute.post('/direct',verifyJwt,createDirect)

export default conversationRoute