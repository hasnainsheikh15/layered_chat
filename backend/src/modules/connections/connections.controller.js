import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { acceptRequest, getConnections, sendConnectionRequest } from "./connections.service.js";

export const requestConnection = asyncHandler(async (req, res) => {
    const { targetId } = req.body;

    if (!targetId) {
        throw new ApiError(401, "TargetId is required")
    }

    const connection = await sendConnectionRequest(req.user.id, targetId)

    return res.status(201).json(
        new ApiResponse(201, connection, "Connection request sent")
    )
})

export const acceptConnection = asyncHandler(async (req, res) => {
    const { connectionId } = req.body

    if (!connectionId) {
        throw new ApiError(401, "Valid ConnectionId required")
    }

    const updated = await acceptRequest(connectionId, req.user.id)

    return res.status(201).json(
        new ApiResponse(201, { connection: updated }, "Connection accepted")
    )
})

export const listConnections = asyncHandler(async (req, res) => {
    const connections = await getConnections(req.user.id)

    return res.status(201).json(
        new ApiResponse(201, connections, "Fetched all connections")
    )
})