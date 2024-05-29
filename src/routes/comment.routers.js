import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/get/:videoId").get(getVideoComments);
router.route("/add/:videoId").post(verifyJWT, addComment);
router.route("/delete/:commentId").delete(verifyJWT, deleteComment);
router.route("/update/:commentId").patch(verifyJWT, updateComment);

export default router;
