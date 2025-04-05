// api/index.js
import app from "../app.js";
import connectDB from "../db/index.js";
import serverless from "serverless-http";

await connectDB(); // Make sure DB is connected once

export const handler = serverless(app); // Convert express app to serverless
