import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    if (!(req.user || req.user._id)) {
        throw new ApiError(401, "Unauthorized");
    }

    const { content } = req.body;

    const tweet = await Tweet.create({
        content,
        owner: req.user._id,
    });

    res.status(200).json(
        new ApiResponse(200, tweet, "Tweet created successfully")
    );
});

const getUserTweet = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const tweets = await Tweet.find({
        owner: mongoose.Types.ObjectId.createFromHexString(userId),
    });

    res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    );
});

const getAllTweets = asyncHandler(async (req, res) => {
    const { limit = 20, page = 1 } = req.query;

    const tweets = await Tweet.aggregate([
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
            },
        },
        {
            $addFields: {
                isEdited: {
                    $not: {
                        $eq: ["$createdAt", "$updatedAt"],
                    },
                },
            },
        },
    ]);

    console.log(tweets);

    res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    if (!tweetId) {
        throw new ApiError(404, "Tweet not found");
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet deleted successfully")
    );
   
});

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    if (!tweetId) {
        throw new ApiError(404, "Tweet not found");
    }

    const { content } = req.body;

    const tweet = await Tweet.findById(tweetId);
    tweet.content = content;

    tweet.save();

    res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    )
});

export { createTweet, getUserTweet, getAllTweets, deleteTweet, updateTweet };
