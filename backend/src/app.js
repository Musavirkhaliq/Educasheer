import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

const app = express();

// Configure CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5174",
    credentials: true
}));

// Parse JSON request body
app.use(express.json({ limit: "16kb" }));

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from public directory
app.use(express.static("public"));

// Serve static files from client/dist directory
app.use(express.static(clientDistPath));

// Parse cookies
app.use(cookieParser());

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
    res.status(200).json(new ApiResponse(200, { status: "ok" }, "Server is running"));
});


import userRouter from "./routes/user.routes.js";
import tutorApplicationRouter from "./routes/tutorApplication.routes.js";
import adminRouter from "./routes/admin.routes.js";
import videoRouter from "./routes/video.routes.js";
import courseRouter from "./routes/course.routes.js";
import programRouter from "./routes/program.routes.js";
import commentRouter from "./routes/comment.routes.js";
import blogRouter from "./routes/blog.routes.js";
import debugRouter from "./routes/debug.routes.js";
import materialRouter from "./routes/material.routes.js";
import discussionRouter from "./routes/discussion.routes.js";
import courseMaterialRouter from "./routes/courseMaterial.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
import feeRouter from "./routes/fee.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tutor-applications", tutorApplicationRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/programs", programRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/materials", materialRouter);
app.use("/api/v1/debug", debugRouter);
app.use("/api/v1", discussionRouter);
app.use("/api/v1", courseMaterialRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/fees", feeRouter);

// Serve frontend for all non-API routes
app.get("*", (req, res, next) => {
    // If the request is for an API route, pass it to the next middleware (404 handler for API)
    if (req.originalUrl.startsWith("/api")) {
        return next();
    }

    // Otherwise serve the frontend app
    res.sendFile(path.join(clientDistPath, "index.html"));
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
    return res.status(404).json(
        new ApiResponse(404, null, `Route ${req.originalUrl} not found`)
    );
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("ERROR:", err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        });
    }

    return res.status(500).json({
        success: false,
        message: "Something went wrong",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app };