  import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));

    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user
    const user = await User.findById(decodedToken.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid user request");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Unauthorized user request");
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    // Check if user exists (should be set by verifyJWT middleware)
    if (!req.user) {
      throw new ApiError(401, "Unauthorized: User not authenticated");
    }

    // Check if user is admin
    if (req.user.role !== "admin") {
      throw new ApiError(403, "Forbidden: Admin access required");
    }

    next();
  } catch (error) {
    throw new ApiError(403, error.message || "Admin access required");
  }
});

// Optional JWT verification - doesn't throw error if no token provided
export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization && req.headers.authorization.replace("Bearer ", ""));

    if (!token) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user
    const user = await User.findById(decodedToken.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // Invalid token, continue without user
      req.user = null;
      return next();
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Token verification failed, continue without user
    req.user = null;
    next();
  }
});

// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   console.log("Headers received:", req.headers); // Log headers
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     console.log("No token provided");
//     return res.status(401).json({ message: "" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Decoded Token:", decoded); // Log decoded token data
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.log("Token verification failed:", error.message);
//     return res
//       .status(403)
//       .json({ message: "Invalid token", error: error.message });
//   }
// };

// module.exports = authMiddleware;
