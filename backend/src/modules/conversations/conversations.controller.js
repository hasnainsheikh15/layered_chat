import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { createOrGetConversations } from "./conversations.service.js";

export const createDirect = asyncHandler(async (req,res) => {
    const {targetUserId} = req.body;

    if(!targetUserId) {
        throw new ApiError(400,"Target User ID required")
    }

    const conversation = await createOrGetConversations(req.user.id , targetUserId);

    return res.status(200).json(
        new ApiResponse(200,{
            conversationId : conversation.id
        },"Conversation ready")
    )
})