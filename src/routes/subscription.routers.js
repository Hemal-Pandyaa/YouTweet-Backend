import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getUserSubscription,
    toggleSubscribed,
    getSubscription
} from "../controllers/subscription.controller.js";

const router = Router();


router.route("/subscribe").post(verifyJWT, toggleSubscribed);
router.route("/subscription/:userId").get(getUserSubscription);
router.route("/subscription").get(verifyJWT, getSubscription);

export default router;
