import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { fetchMessage, sendMessage } from "./message.service.js";

export const send = asyncHandler(async(req,res) => {
    const {conversationId , content , hidden} = req.body;

    if(!conversationId) {
        throw new ApiError(400,"conversationId required")
    }

    const message = await sendMessage(req.user.id,conversationId,content,hidden)

    return res.status(200).json(
        new ApiResponse(201,message,"Message sent")
    )
})

export const getMessages = asyncHandler(async(req,res) => {
    const {conversationId,cursor,limit} = req.query;
    
    if(!conversationId) {
        throw new ApiError(400,"Conversation Id is required")
    }

    const message = await fetchMessage(req.user.id , req.device.id, conversationId , cursor || null , limit ? parseInt(limit) : 20  )

    return res.status(200).json(
        new ApiResponse(201,message,"Message fetched succefully")
    )
})

export const unlockHiddenMessage = asyncHandler(async(req,res) => {
    const data = await  fetchHiddenPayload(req.user.id , req.device.id , req.params.messageId)

    res.status(200).json(
        new ApiResponse(200,data,"Message unlocked")
    )
})