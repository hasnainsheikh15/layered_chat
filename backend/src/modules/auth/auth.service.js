import prisma from "../../config/prisma.js"
import ApiError from "../../utils/apiError.js"
import ApiResponse from "../../utils/apiResponse.js";
import { comparePassword, hashPasswword } from "../../utils/hash.js";
import { generateToken } from "../../utils/jwt.js";


export const registerUser = async ({username,password,avatarStyle}) => {
    const existingUser = await prisma.user.findUnique({
        where : {username}
    })

    if(existingUser) {
        throw new ApiError(400,"Username already exists");
    }

    const passwordHash = await hashPasswword(password)

    const user = await prisma.user.create({
        data : {
            username,
            passwordHash,
            avatarStyle
        }
    })

    return user;

}


export const loginUser = async ({username,password,publicKey}) => {
    const user = await prisma.user.findUnique({
        where : {username}
    }) 

    if(!user) {
        throw new ApiError(400,"Invalid username or password");

    }

    const isValid  = await comparePassword(password,user.passwordHash)

    if(!isValid) {
        throw new ApiError(400,"Invalid Password")
    }

    const device = await prisma.device.create({
        data : {
            userId : user.id,
            publicKey
        }
    })

    const token =  generateToken({
        userId : user.id,
        deviceId : device.id
    })

    return {token , user , device}
}