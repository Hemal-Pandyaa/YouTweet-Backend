// toogle comment, video and tweet like.
// get liked video, comment and tweet
import asyncHandler from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    if (!videoId) {
        throw new ApiError(404, "Video not found");
    }

    if (!(req.user && req.user._id)) {
        throw new ApiError(401, "Unauthorized");
    }

    let liked = false;
    let isLiked = await Like.findOneAndDelete({
        likedBy: req.user._id,
        video: mongoose.Types.ObjectId.createFromHexString(videoId),
    });

    if (!isLiked) {
        liked = true;
        isLiked = await Like.create({
            likedBy: req.user._id,
            video: videoId,
        });
    }

    res.status(200).json(
        new ApiResponse(
            200,
            { isLiked },
            liked ? "Video Liked Successfully" : "Video UnLiked Successfully"
        )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId;
    if (!commentId) {
        throw new ApiError(404, "Comment not found");
    }

    if (!(req.user && req.user._id)) {
        throw new ApiError(401, "Unauthorized");
    }

    let liked = false;
    let isLiked = await Comment.findOneAndDelete({
        likedBy: req.user._id,
        comment: mongoose.Types.ObjectId.createFromHexString(commentId),
    });

    if (!isLiked) {
        liked = true;
        isLiked = await Comment.create({
            likedBy: req.user._id,
            comment: commentId,
        });
    }

    res.status(200).json(
        new ApiResponse(
            200,
            { isLiked },
            liked
                ? "Comment Liked Successfully"
                : "Comment UnLiked Successfully"
        )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    if (!tweetId) {
        throw new ApiError(404, "Tweet not found");
    }

    if (!(req.user && req.user._id)) {
        throw new ApiError(401, "Unauthorized");
    }

    let liked = false;
    let isLiked = await Tweet.findOneAndDelete({
        likedBy: req.user._id,
        tweet: mongoose.Types.ObjectId.createFromHexString(tweetId),
    });

    if (!isLiked) {
        liked = true;
        isLiked = await Tweet.create({
            likedBy: req.user._id,
            tweet: tweetId,
        });
    }

    res.status(200).json(
        new ApiResponse(
            200,
            { isLiked },
            liked ? "Video Liked Successfully" : "Video UnLiked Successfully"
        )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    if (!(req.user && req.user._id)) {
        throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const user = User.findById({ userId });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log(userId);

    const likedVideo = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
            },
        },
        {
            $unwind: "$video",
        },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $unwind: "$owner",
        },
        {
            $group: {
                _id: "$video._id",
                title: { $first: "$video.title" },
                description: { $first: "$video.description" },
                video: { $first: "$video.video" },
                thumbnail: { $first: "$video.thumbnail" },
                duration: { $first: "$video.duration" },
                views: { $first: "$video.views" },
                username: { $first: "$owner.username" },
                avatar: { $first: "$owner.avatar" },
            },
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, likedVideo, "Liked Video fetched successfully")
    );
});

const getLikedTweet = asyncHandler(async (req, res) => {
    if (!(req.user && req.user._id)) {
        throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const user = User.findById({ userId });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const likedTweet = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
            },
        },
        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "tweet",
            },
        },
        {
            $unwind: "$tweet",
        },
        {
            $lookup: {
                from: "users",
                localField: "tweet.owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $unwind: "$owner",
        },
        {
            $group: {
                _id: "$tweet._id",
                content: { $first: "$tweet.content" },
                username: { $first: "$owner.username" },
                avatar: { $first: "$owner.avatar" },
            },
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, likedTweet, "Liked Tweet fetched successfully")
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos, getLikedTweet };
