import { Router } from "express";
import { checkUsername, getMe, login, register } from "./auth.controller.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post('/register',register);
authRouter.post('/login',login)
authRouter.get('/check-username',verifyJwt,checkUsername)
authRouter.get('/me',verifyJwt,getMe)

export default authRouter