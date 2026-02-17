import { Router } from "express";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { acceptConnection, listConnections, requestConnection } from "./connections.controller.js";

const connectionRoute = Router()

connectionRoute.post('/request',verifyJwt,requestConnection)
connectionRoute.post('/accept',verifyJwt,acceptConnection)
connectionRoute.get('/',verifyJwt,listConnections)

export default connectionRoute