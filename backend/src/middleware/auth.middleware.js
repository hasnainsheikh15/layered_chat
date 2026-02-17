import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";


    
    export const verifyJwt = async (req,res,next) => {
        try {
            const authHeader = req.headers.authorization;
            
            if(!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json(
                    {message : "Unauthorized"}
                )
            }
        
            const token = authHeader.split(' ')[1];
        
            const decoded = verifyToken(token);
            console.log(decoded)
        
            const user = await prisma.user.findUnique({
                where : {id : decoded.userId}
            })
        
            if(!user) {
                return res.status(401).json({message : "Invalid User"})
            }
        
            const device = await prisma.device.findUnique({
                where : {id : decoded.deviceId}
            })
        
            if(!device || device.status !== 'active') {
                return res.status(401).json({message : "Invalid device"})
            }
        
            req.user = user;
            req.device = device
    
            next(); // very very
        } catch (error) {
            return res.status(401).json({message : "Invalid or expired token"})
        }
    }
