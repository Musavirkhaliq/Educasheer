import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import { noCacheMiddleware, staticAssetCacheMiddleware, htmlNoCacheMiddleware } from "./middlewares/cache-control.middleware.js";
import { optionalVerifyJWT } from "./middlewares/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5174",
  credentials: true
}));

// Parse JSON request body with increased limit for large quizzes
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded request body with increased limit for large quizzes
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from public directory with cache control
app.use(express.static("public", {
  etag: true, // Enable ETag for conditional requests
  lastModified: true, // Enable Last-Modified for conditional requests
  maxAge: '1d', // Cache for 1 day (in milliseconds)
  setHeaders: (res, path) => {
    // For service worker, prevent caching
    if (path.endsWith('service-worker.js')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Serve static files from client/dist directory with cache control
app.use(express.static(clientDistPath, {
  etag: true, // Enable ETag for conditional requests
  lastModified: true, // Enable Last-Modified for conditional requests
  maxAge: '1d', // Cache for 1 day (in milliseconds)
  setHeaders: (res, path) => {
    // For HTML files, prevent caching
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // For service worker, prevent caching
    else if (path.endsWith('service-worker.js')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // For JS and CSS files with version parameter, cache for longer
    else if (path.match(/\.(js|css)$/) && res.req.query.v) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    }
  }
}));

// Parse cookies
app.use(cookieParser());

// Apply cache control middleware
app.use(noCacheMiddleware); // Prevent caching for API responses
app.use(staticAssetCacheMiddleware); // Configure caching for static assets
app.use(htmlNoCacheMiddleware); // Prevent caching for HTML content

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json(new ApiResponse(200, { status: "ok" }, "Server is running"));
});

// Simple test endpoint to debug routing issues
app.get("/api/v1/test-public", (req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "Public endpoint working" }, "Success"));
});

// Try a different path to avoid whatever global middleware is affecting /api/v1/*
app.get("/api/public/test", (req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "Public API test working" }, "Success"));
});

// Public quiz endpoints under /api/public/
app.get("/api/public/quizzes", getPublishedQuizzes);
app.get("/api/public/quiz-categories", getQuizCategories);
app.get("/api/public/quiz-tags", getQuizTags);
app.get("/api/public/quizzes/:quizId", optionalVerifyJWT, getQuizById);
app.get("/api/public/quizzes/:quizId/leaderboard", optionalVerifyJWT, getQuizLeaderboard);

// Public test series endpoints under /api/public/
app.get("/api/public/test-series", getPublishedTestSeries);
app.get("/api/public/test-series/:testSeriesId", optionalVerifyJWT, getTestSeriesById);



// Public testimonial endpoints under /api/public/
app.get("/api/public/testimonials", getApprovedTestimonials);


import userRouter from "./routes/user.routes.js";
import tutorApplicationRouter from "./routes/tutorApplication.routes.js";
import tutorRouter from "./routes/tutor.routes.js";
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
import testimonialRouter from "./routes/testimonial.routes.js";
import centerRouter from "./routes/center.routes.js";
import gamificationRouter from "./routes/gamification.routes.js";
import videoProgressRouter from "./routes/videoProgress.routes.js";
import courseProgressRouter from "./routes/courseProgress.routes.js";
import rewardRouter from "./routes/reward.routes.js";
import quizRouter from "./routes/quiz.routes.js";
import testSeriesRouter from "./routes/testSeries.routes.js";
import seatRouter from "./routes/seat.routes.js";
import categoryRouter from "./routes/category.routes.js";
import imageUploadRouter from "./routes/imageUpload.routes.js";
import cartRouter from "./routes/cart.routes.js";
import promocodeRouter from "./routes/promocode.routes.js";
import paymentRouter from "./routes/payment.routes.js";

// Import public quiz routes
import { getPublishedQuizzes, getEnrolledQuizzes, getQuizCategories, getQuizTags, getQuizById } from "./controllers/quiz.controller.js";
import { getQuizLeaderboard } from "./controllers/quizAttempt.controller.js";
// Import public test series routes
import { getPublishedTestSeries, getEnrolledTestSeries, getTestSeriesById } from "./controllers/testSeries.controller.js";
// Import public testimonial routes
import { getApprovedTestimonials } from "./controllers/testimonial.controller.js";

// Initialize quiz cleanup scheduler
import { initializeCleanupScheduler } from "./services/quizCleanup.service.js";

// Initialize cleanup scheduler when app starts
try {
  initializeCleanupScheduler();
} catch (error) {
  console.error("Failed to initialize quiz cleanup scheduler:", error);
}

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tutor-applications", tutorApplicationRouter);
app.use("/api/v1/tutors", tutorRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/programs", programRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/materials", materialRouter);
app.use("/api/v1/debug", debugRouter);
app.use("/api/v1/discussions", discussionRouter);
app.use("/api/v1/course-materials", courseMaterialRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/fees", feeRouter);
app.use("/api/v1/testimonials", testimonialRouter);
app.use("/api/v1/centers", centerRouter);
app.use("/api/v1/gamification", gamificationRouter);
app.use("/api/v1/video-progress", videoProgressRouter);
app.use("/api/v1/course-progress", courseProgressRouter);
app.use("/api/v1/rewards", rewardRouter);

// Add public quiz routes under a different path to avoid conflicts
app.get("/api/v1/public/quizzes", getPublishedQuizzes);
app.get("/api/v1/public/quiz-categories", getQuizCategories);
app.get("/api/v1/public/quiz-test", (req, res) => {
  res.json({ success: true, message: "Public quiz test endpoint working", data: [] });
});

app.use("/api/v1/quizzes", quizRouter);
app.use("/api/v1/test-series", testSeriesRouter);
app.use("/api/v1/seats", seatRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/images", imageUploadRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/promocodes", promocodeRouter);
app.use("/api/v1/payments", paymentRouter);

// Serve frontend for all non-API routes
app.get("*", (req, res, next) => {
  // If the request is for an API route, pass it to the next middleware (404 handler for API)
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }

  // Otherwise serve the frontend app with no-cache headers
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
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