import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authentication").replace("Bearer ", "");

        if(!accessToken) {
            throw new ApiError(401, "Unauthorized request", "No access token found");
        }

        const token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        if(!token) {
            throw new ApiError(401, "Unauthorized request", "Invalid access token");
        }

        const user = await User.findById(token._id).select("-password -refrestToken");

        if(!user){
            throw new ApiError(401, "Unauthorized request", "Invalid Access Token");
        }

        req.user = user;
    } catch (error) {
        throw new ApiError(500, error, "Error occurred while verifying JWT token");
    }

    next()
});