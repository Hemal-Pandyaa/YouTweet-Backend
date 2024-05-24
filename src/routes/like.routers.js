import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedTweet,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/likeVideo/:videoId").post(toggleVideoLike);
router.route("/likeComment/:commentId").post(toggleCommentLike);
router.route("/likeTweet/:tweetId").post(toggleTweetLike);
router.route("/likedVideos").get(getLikedVideos);
router.route("/likedTweets").get(getLikedTweet);

export default router;
