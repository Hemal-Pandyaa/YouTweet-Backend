import { Router } from "express";

import {
    getUserTweet,
    updateTweet,
    deleteTweet,
    createTweet,
    getAllTweets,
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/tweet/all").get(getAllTweets);
router.route("/tweet/:userId").get(getUserTweet);
router.route("/tweet/update/:tweetId").post(verifyJWT, updateTweet);
router.route("/tweet/delete/:tweetId").post(verifyJWT, deleteTweet);
router.route("/tweet/create").post(verifyJWT, createTweet);

export default router;
