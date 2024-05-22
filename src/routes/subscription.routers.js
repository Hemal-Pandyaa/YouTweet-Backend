import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import { subscribeChannel } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/subscribe").post(subscribeChannel);

export default router;