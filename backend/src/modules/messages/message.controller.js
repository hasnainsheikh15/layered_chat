import prisma from "../../config/prisma.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { getIO } from "../../websocket/socket.js";
import { deleteForMe, deleteMessage, editMessage, fetchHiddenPayload, fetchMessage, sendMessage } from "./message.service.js";

export const send = asyncHandler(async(req,res) => {
    console.log("Send message request body:", req.body);
    const {conversationId , content , hidden} = req.body;

    if(!conversationId) {
        throw new ApiError(400,"conversationId required")
    }
     console.log("2. Calling sendMessage...");
    const message = await sendMessage(req.user.id,conversationId,content,hidden)
     console.log("3. Message saved:", message);

    const io = getIO();
    console.log("4. Got IO:", !!io);

    const participants = await prisma.conversationParticipants.findMany(
        {
            where : {
                conversationId,
                leftAt : null
            }
        }
    )
    console.log("5. Participants:", participants);
    
        for(const p of participants) {
            try {
                console.log("Emitting newMessage to user", p.userId);
                const isSender = p.userId === req.user.id;

        io.to(p.userId).emit("newMessage",{
            message : {
                ...message,
                hasHidden : !!hidden && !isSender,
                sentHidden : !!hidden && isSender
            }
        })
            } catch (error) {
                console.error("Error emitting newMessage to user", error);
            }
        }

    console.log("7. Sending response...");
    return res.status(201).json(
        new ApiResponse(201,message,"Message sent")
    )
})

export const getMessages = asyncHandler(async(req,res) => {
    const {cursor,limit} = req.query;
    const { conversationId } = req.params;
    
    if(!conversationId) {
        throw new ApiError(400,"Conversation Id is required")
    }

    const message = await fetchMessage(req.user.id , req.device.id, conversationId , cursor || null , limit ? parseInt(limit) : 20  )

    return res.status(200).json(
        new ApiResponse(200,message,"Message fetched succefully")
    )
})

export const unlockHiddenMessage = asyncHandler(async(req,res) => {
    const data = await  fetchHiddenPayload(req.user.id ,req.params.messageId , req.device.id )

    res.status(200).json(
        new ApiResponse(200,data,"Message unlocked")
    )
})

export const deleteMessageController = asyncHandler(async(req,res) => {
    const {messageId} = req.params;

    const result = await deleteMessage(req.user.id,messageId);

    const message = await prisma.message.findUnique({
        where : {
            id : messageId
        },
        select : {
            conversationId : true
        }
    })

    const io = getIO()

    io.to(message.conversationId).emit("messageDeleted",{messageId})

    return res.status(200).json(
        new ApiResponse(200,result,"Message Deleted")
    )
})

export const deleteForMeController = asyncHandler(async(req,res) => {
    const {messageId} = req.params;

    const userId  = req.user.id;

    const result = await deleteForMe(userId,messageId);

    const io = getIO();

    io.to(userId).emit("messageDeletedForMe",{messageId})

    return res.status(200).json(
        new ApiResponse(200,result,"Message deleted from me")
    )
})

export const editMessageController = asyncHandler(async(req,res) => {
    const {messageId} = req.params;
    const {newText} = req.body

    const updatedMessage = await editMessage(req.user.id,messageId,newText)

    const message = await prisma.message.findUnique({
        where : {id : messageId},
        select : {
            conversationId : true
        }
    })

    const io = getIO()

    io.to(message.conversationId).emit("messageEdited",{
        messageId,
        newText
    })

    return res.status(200).json(
        new ApiResponse(200,updatedMessage,"Message updated")
    )
})