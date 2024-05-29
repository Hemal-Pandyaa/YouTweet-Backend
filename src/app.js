import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// Route Import
import UserRouter from "./routes/user.routes.js";
import SubscriptionRouter from "./routes/subscription.routers.js";
import VideoRouter from "./routes/video.routers.js";
import LikeRouter from "./routes/like.routers.js";
import TweetRouter from "./routes/tweet.routers.js";
import PlaylistRouter from "./routes/playlist.routers.js";
import CommentRouter from "./routes/comment.routers.js";
import DashboardRouter from "./routes/dashboard.routers.js";

// Router usage
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/subscriptions", SubscriptionRouter);
app.use("/api/v1/videos", VideoRouter);
app.use("/api/v1/likes", LikeRouter);
app.use("/api/v1/tweets", TweetRouter);
app.use("/api/v1/playlists", PlaylistRouter);
app.use("/api/v1/comments", CommentRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
