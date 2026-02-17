import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { loginUser, registerUser } from "./auth.service.js";

export const register = asyncHandler (async(req,res) => {
    const {username , password , avatarStyle} = req.body;

    if(!username || !password) {
        throw new ApiError(400,"Username and password required")
    }

    const user = await registerUser({username,password,avatarStyle});

    return res.status(201).json(
        new ApiResponse(201,{
            id : user.id,
            username : user.username,
            avatarStyle : user.avatarStyle
        },"User registered Successfully")
    )
})

export const login = asyncHandler(async(req,res) => {
    const {username,password,publicKey} = req.body;

    if(!username || !password || !publicKey) {
        throw new ApiError(400,"Missing credentials or publicKey")
    }

    const result = await loginUser({username,password,publicKey});

    return res.status(200).json(
        new ApiResponse(200,{
            token : result.token,
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