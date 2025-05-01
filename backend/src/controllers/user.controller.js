import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Generate tokens
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};
// Validate user inputs
const validateUserInput = (fullName, username, email, password) => {
  if ([fullName, username, email, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "Please fill in the required fields");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }
};

// Handle file upload for registering User eg avatar and cover photo
const handleFileUpload = async (files) => {
  let avatar = null;
  let coverImage = null;

  // Handle avatar upload if provided
  if (files?.avatar?.[0]?.path) {
    const avatarLocalPath = files.avatar[0].path;
    // Instead of using Cloudinary, we'll use the local path
    avatar = {
      url: `/${avatarLocalPath.replace(/\\/g, '/').replace('public/', '')}`
    };
  }

  // Handle cover image upload if provided
  if (files?.coverImage?.[0]?.path) {
    const coverImageLocalPath = files.coverImage[0].path;
    // Instead of using Cloudinary, we'll use the local path
    coverImage = {
      url: `/${coverImageLocalPath.replace(/\\/g, '/').replace('public/', '')}`
    };
  }

  return { avatar, coverImage };
};

const registerUser = asyncHandler(async (req, res) => {
  console.log("Registration request received:", req.body);
  console.log("Files received:", req.files);

  const { fullName, username, email, password } = req.body;

  try {
    // Validate user input
    validateUserInput(fullName, username, email, password);

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      throw new ApiError(
        409,
        `User with ${existingUser.email === email ? "email" : "username"} already exists`
      );
    }

    // Default avatar URL
    const defaultAvatarUrl = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

    let avatarUrl = defaultAvatarUrl;
    let coverImageUrl = "";

    // Handle file uploads if files are provided
    if (req.files && Object.keys(req.files).length > 0) {
      try {
        const { avatar, coverImage } = await handleFileUpload(req.files);
        if (avatar) {
          avatarUrl = avatar.url;
        }
        if (coverImage) {
          coverImageUrl = coverImage.url;
        }
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        // Continue with default avatar if upload fails
      }
    }

    // Create user with password (will be hashed by pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      fullName,
      avatar: avatarUrl,
      coverImage: coverImageUrl,
      password, // Let the pre-save hook handle hashing
      username: username.toLowerCase(),
      role: "learner",
      tutorStatus: "none"
    });

    console.log("User created with password");

    // Fetch user without sensitive fields
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Error creating user account");
    }

    console.log("User registered successfully:", createdUser);

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    // Log the error for debugging
    console.error("Registration error:", error);

    // If it's already an ApiError, return it directly
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }

    // Otherwise, create a new ApiError response
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during registration"
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password, username } = req.body;

    console.log("Login attempt:", { email, username });

    // Check if email/username and password are provided
    if ((!email && !username) || !password) {
      throw new ApiError(400, "Email/username and password are required");
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { username: username?.toLowerCase() }
      ],
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    console.log("User found:", { id: user._id, email: user.email });

    // Check if password exists in the user document
    if (!user.password) {
      console.error("User has no password hash stored");

      // Set a password for the user
      try {
        // Don't hash the password here, let the pre-save hook handle it
        user.password = password;
        await user.save();
        console.log("Password set for existing user");
      } catch (updateError) {
        console.error("Failed to update user password:", updateError);
        throw new ApiError(500, "Account setup is incomplete. Please try registering again.");
      }
    }

    try {
      // Verify password
      const isPasswordValid = await user.isPasswordCorrect(password);
      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
      }
    } catch (passwordError) {
      console.error("Password verification error:", passwordError);
      throw new ApiError(500, "Error verifying credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // Get user data without sensitive fields
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Send response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, {
          user: loggedInUser,
          accessToken,
          refreshToken,
        }, "Logged in successfully")
      );
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during login"
    });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Update user to remove refresh token
    await User.findByIdAndUpdate(
      req?.user?._id,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true }
    );

    // Cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Clear cookies and send response
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "Logged out successfully"));
  } catch (error) {
    console.error("Logout error:", error);
    throw new ApiError(500, "Something went wrong during logout");
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    // Get refresh token from cookies, headers, or body
    const incomingRefreshToken =
      req.cookies?.refreshToken ||
      (req.headers.authorization && req.headers.authorization.replace("Bearer ", "")) ||
      req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    // Verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user
    const user = await User.findById(decodedToken.id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Check if the token matches the one stored in the database
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Send response with new tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, {
          accessToken,
          refreshToken,
        }, "Access token refreshed successfully")
      );
  } catch (error) {
    console.error("Token refresh error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      401,
      error.message || "Invalid or expired refresh token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.status(200).json(new ApiResponse(200, user));
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.name = name || user.name;
  user.email = email || user.email;
  user.password = password || user.password;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully"));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password ");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Error uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error uploading cover image");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriptions",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        avatar: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel, "Channel profile fetched successfully")
    );
});
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "Videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});
// Google OAuth login handler
const googleLogin = asyncHandler(async (req, res) => {
  try {
    const { googleId, email, fullName, avatar, picture, name, sub } = req.body;

    // Support both formats: googleId or sub (from Google's JWT)
    const userGoogleId = googleId || sub;
    const userName = fullName || name;
    const userAvatar = avatar || picture;

    if (!userGoogleId || !email) {
      throw new ApiError(400, "Google ID and email are required");
    }

    console.log("Google login attempt:", { googleId: userGoogleId, email });

    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: userGoogleId });

    // If user doesn't exist with Google ID, check if email exists
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });

      // If user exists with email but no Google ID, update the user with Google info
      if (user) {
        console.log("Existing user found with email, updating with Google ID");
        user.googleId = userGoogleId;
        user.authProvider = "google";

        // Update avatar if not already set
        if (!user.avatar || user.avatar.includes("ui-avatars.com")) {
          user.avatar = userAvatar;
        }

        await user.save({ validateBeforeSave: false });
      } else {
        // Create new user with Google info
        console.log("Creating new user with Google account");

        // Generate a unique username based on email
        const baseUsername = email.split('@')[0].toLowerCase();
        let username = baseUsername;
        let counter = 1;

        // Check if username exists, if so, append a number
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        user = await User.create({
          email: email.toLowerCase(),
          fullName: userName || email.split('@')[0],
          username,
          googleId: userGoogleId,
          avatar: userAvatar || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff",
          authProvider: "google",
          role: "learner",
          tutorStatus: "none"
        });
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Get user data without sensitive fields
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Set cookie options
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Send response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, {
          user: loggedInUser,
          accessToken,
          refreshToken,
        }, "Google login successful")
      );
  } catch (error) {
    console.error("Google login error:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong during Google login"
    });
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateUser,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  googleLogin,
};
