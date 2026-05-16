import prisma from "../../config/prisma.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { loginUser, registerUser } from "./auth.service.js";

export const register = asyncHandler (async(req,res) => {
    const {username , password , publicKey} = req.body;

    if(!username || !password) {
        throw new ApiError(400,"Username and password required")
    }

    if(!publicKey) {
        throw new ApiError(400,"Public Key is required")
    }

    const result = await registerUser({username,password,publicKey});

    return res.status(201).json(
        new ApiResponse(201,result,"User registered Successfully")
    )
})

export const login = asyncHandler(async(req,res) => {
    const {username,password,publicKey} = req.body;

    if(!username || !password || !publicKey) {
        throw new ApiError(400,"Missing credentials or publicKey")
    }

    const result = await loginUser({username,password,publicKey});
    const options = {
        httpOnly: true,           
        secure: false,            
        sameSite: "Lax",          
        maxAge: 7 * 24 * 60 * 60 * 1000 
    }
    return res.status(200)
    .cookie("token",result.token,options)
    .json(
        new ApiResponse(200,{
            user : {
                id : result.user.id,
                username : result.user.username,
                avatarStyle : result.user.avatarStyle
            },
            device : {
                id : result.device.id
            }
        }, "Login Successfull")

    )
})

export const checkUsername = asyncHandler(async(req,res) => {
    const {username} = req.query;

    if(!username) {
        throw new ApiError(400,"Username is required")
    }

    const existingUser = await prisma.user.findFirst({
        where : {
            username : {
                equals : username,
                mode : "insensitive"
            }
        }
    })

    return res.status(200).json(
        new ApiResponse(200,{
            success : true,
            available : !existingUser
        })
    )
})

export const getMe = asyncHandler(async(req,res) => {
     return res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        username: req.user.username
      }
    }
  });
})

export const logout  = asyncHandler(async (req,res) => {

    const options = {
        httpOnly : true,
        secure : false,
        sameSite : "Lax",
        maxAge : 0
    }

    return res.status(200).
    clearCookie("token",options).
    json(
        new ApiResponse(200,null,"Logged out successfully")
    )
})