import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    let { limit = 10, page = 1 } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);
    const { videoId } = req.params;
    const skip = (page - 1) * limit;
    console.log(skip);

    if (page < 1) throw new ApiError(400, "Page must be greater than 0");

    if (!videoId) throw new ApiError(400, "Video Id not provided");

    const comments = await Comment.aggregate([
        {
            $match: {
                video: mongoose.Types.ObjectId.createFromHexString(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $unwind: "$owner",
        },
        {
            $group: {
                _id: "$_id",
                content: { $first: "$content" },
                username: { $first: "$owner.username" },
                avatar: { $first: "$owner.avatar" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                reqlies: { $first: "$reqly" },
            },
        },
        {
            $addFields: {
                edited: { $not: { $eq: ["$createdAt", "$updatedAt"] } },
            },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },

    ]);

    res.status(200).json(
        new ApiResponse(200, comments, "Comment fetched Successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(400, "Video Id not provided");

    const { content } = req.body;
    if (!content) throw new ApiError(400, "Content is required");

    const comment = await Comment.create({
        video: mongoose.Types.ObjectId.createFromHexString(videoId),
        owner: req.user._id,
        content,
    });

    res.status(200).json(
        new ApiResponse(200, comment, "Comment added Successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) throw new ApiError(400, "Comment Id not provided");

    const comment = await Comment.findByIdAndDelete(commentId);

    res.status(200).json(
        new ApiResponse(200, comment, "Comment deleted Successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) throw new ApiError(400, "Comment Id not provided");

    const { content } = req.body;
    if (!content) throw new ApiError(400, "Content is required");

    const comment = await Comment.findById(commentId);
    comment.content = content;

    comment.save();

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated Successfully")
    );
});

export { getVideoComments, addComment, deleteComment, updateComment };
