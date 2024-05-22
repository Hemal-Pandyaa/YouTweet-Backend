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
import UserRouter from "./routes/user.routes.js"
import SubscriptionRouter from "./routes/subscription.routers.js"

// Router usage
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/subscriptions", SubscriptionRouter);

export default app;
