import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    UserPoints,
    PointTransaction,
    Badge,
    UserBadge,
    Streak,
    Challenge,
    UserChallenge
} from "../models/gamification.model.js";
import { User } from "../models/user.model.js";
import {
    initializeUserGamification,
    awardPoints,
    awardBadge,
    updateUserStreak,
    getUserGamificationProfile,
    getLeaderboard
} from "../services/gamification.service.js";

// Get user gamification profile
const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user gamification profile
        const profile = await getUserGamificationProfile(userId);

        return res.status(200).json(
            new ApiResponse(200, profile, "User gamification profile fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching user gamification profile:", error);
        throw new ApiError(500, "Failed to fetch gamification profile");
    }
});

// Get user badges
const getUserBadges = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user badges
        const userBadges = await UserBadge.find({ user: userId })
            .populate('badge')
            .sort({ earnedAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, userBadges, "User badges fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching user badges:", error);
        throw new ApiError(500, "Failed to fetch user badges");
    }
});

// Get user points history
const getUserPointsHistory = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get user points history
        const pointsHistory = await PointTransaction.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PointTransaction.countDocuments({ user: userId });

        return res.status(200).json(
            new ApiResponse(200, {
                history: pointsHistory,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }, "User points history fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching user points history:", error);
        throw new ApiError(500, "Failed to fetch user points history");
    }
});

// Get user streak
const getUserStreak = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user streak
        const streak = await Streak.findOne({ user: userId });

        if (!streak) {
            // Initialize streak if not exists
            const newStreak = await Streak.create({
                user: userId,
                currentStreak: 1, // Start with 1 since they're actively using the app
                longestStreak: 1,
                lastActivityDate: new Date(),
                streakHistory: [{
                    date: new Date(),
                    activities: ["login"]
                }]
            });

            return res.status(200).json(
                new ApiResponse(200, newStreak, "User streak initialized successfully")
            );
        }

        // Always ensure streak is at least 1 for active users
        // This is a more aggressive fix to ensure streaks are never 0 for active users
        if (streak.currentStreak === 0 || streak.currentStreak < 1) {
            console.log("Fixing zero streak for user:", userId);
            streak.currentStreak = 1;
            streak.longestStreak = Math.max(1, streak.longestStreak);
            streak.lastActivityDate = new Date();

            // Add today to history if not already there
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const hasTodayActivity = streak.streakHistory.some(entry => {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            });

            if (!hasTodayActivity) {
                streak.streakHistory.push({
                    date: today,
                    activities: ["login"]
                });
            }

            await streak.save();
            console.log("Updated streak to 1 for user:", userId);
        }

        return res.status(200).json(
            new ApiResponse(200, streak, "User streak fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching user streak:", error);
        throw new ApiError(500, "Failed to fetch user streak");
    }
});

// Get user challenges
const getUserChallenges = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { status = "active" } = req.query;

        let query = { user: userId };

        if (status === "active") {
            query.isCompleted = false;
        } else if (status === "completed") {
            query.isCompleted = true;
        }

        // Get user challenges
        const userChallenges = await UserChallenge.find(query)
            .populate('challenge')
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, userChallenges, "User challenges fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching user challenges:", error);
        throw new ApiError(500, "Failed to fetch user challenges");
    }
});

// Get leaderboard
const getGamificationLeaderboard = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Get leaderboard
        const result = await getLeaderboard(parseInt(limit), parseInt(page));

        return res.status(200).json(
            new ApiResponse(200, result, "Leaderboard fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        throw new ApiError(500, "Failed to fetch leaderboard");
    }
});

// Get streak data for multiple users (for leaderboard)
const getLeaderboardStreaks = asyncHandler(async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            throw new ApiError(400, "User IDs must be provided as a non-empty array");
        }

        // Get streak data for the specified users
        const streaks = await Streak.find({ user: { $in: userIds } })
            .select('user currentStreak longestStreak lastActivityDate');

        return res.status(200).json(
            new ApiResponse(200, { streaks }, "Streak data fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching streak data:", error);
        throw new ApiError(500, "Failed to fetch streak data");
    }
});

// Update displayed badges
const updateDisplayedBadges = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { badgeIds } = req.body;

        if (!badgeIds || !Array.isArray(badgeIds)) {
            throw new ApiError(400, "Badge IDs must be provided as an array");
        }

        if (badgeIds.length > 5) {
            throw new ApiError(400, "You can display a maximum of 5 badges");
        }

        // Verify user has these badges
        const userBadges = await UserBadge.find({
            user: userId,
            badge: { $in: badgeIds }
        });

        if (userBadges.length !== badgeIds.length) {
            throw new ApiError(400, "You can only display badges that you have earned");
        }

        // Update user's displayed badges
        const user = await User.findByIdAndUpdate(
            userId,
            { displayedBadges: badgeIds },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, user.displayedBadges, "Displayed badges updated successfully")
        );
    } catch (error) {
        console.error("Error updating displayed badges:", error);
        throw new ApiError(500, "Failed to update displayed badges");
    }
});

// Admin: Create a new badge
const createBadge = asyncHandler(async (req, res) => {
    try {
        const { name, description, icon, category, level, pointsAwarded, criteria, isHidden } = req.body;

        // Check if badge with same name already exists
        const existingBadge = await Badge.findOne({ name });
        if (existingBadge) {
            throw new ApiError(400, `Badge with name "${name}" already exists`);
        }

        // Create badge
        const badge = await Badge.create({
            name,
            description,
            icon,
            category,
            level: level || 1,
            pointsAwarded: pointsAwarded || 0,
            criteria,
            isHidden: isHidden || false
        });

        return res.status(201).json(
            new ApiResponse(201, badge, "Badge created successfully")
        );
    } catch (error) {
        console.error("Error creating badge:", error);
        throw new ApiError(500, "Failed to create badge");
    }
});

// Admin: Create a new challenge
const createChallenge = asyncHandler(async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            criteria,
            reward,
            startDate,
            endDate,
            isActive
        } = req.body;

        // Create challenge
        const challenge = await Challenge.create({
            title,
            description,
            type,
            criteria,
            reward,
            startDate,
            endDate,
            isActive: isActive !== undefined ? isActive : true
        });

        // Assign challenge to all users
        if (challenge.isActive) {
            const users = await User.find({}, '_id');

            const userChallenges = users.map(user => ({
                user: user._id,
                challenge: challenge._id,
                progress: 0,
                isCompleted: false
            }));

            await UserChallenge.insertMany(userChallenges);
        }

        return res.status(201).json(
            new ApiResponse(201, challenge, "Challenge created successfully")
        );
    } catch (error) {
        console.error("Error creating challenge:", error);
        throw new ApiError(500, "Failed to create challenge");
    }
});

// Admin: Award badge to user
const adminAwardBadge = asyncHandler(async (req, res) => {
    try {
        const { userId, badgeId } = req.body;

        if (!userId || !badgeId) {
            throw new ApiError(400, "User ID and Badge ID are required");
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Check if badge exists
        const badge = await Badge.findById(badgeId);
        if (!badge) {
            throw new ApiError(404, "Badge not found");
        }

        // Award badge
        const result = await awardBadge(userId, badgeId);

        return res.status(200).json(
            new ApiResponse(200, result, "Badge awarded successfully")
        );
    } catch (error) {
        console.error("Error awarding badge:", error);
        throw new ApiError(500, "Failed to award badge");
    }
});

// Admin: Award points to user
const adminAwardPoints = asyncHandler(async (req, res) => {
    try {
        const { userId, points, category, description } = req.body;

        if (!userId || !points || !category || !description) {
            throw new ApiError(400, "User ID, points, category, and description are required");
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Award points
        const result = await awardPoints(userId, points, category, description);

        return res.status(200).json(
            new ApiResponse(200, result, "Points awarded successfully")
        );
    } catch (error) {
        console.error("Error awarding points:", error);
        throw new ApiError(500, "Failed to award points");
    }
});

// Admin: Get all badges
const getAllBadges = asyncHandler(async (req, res) => {
    try {
        const badges = await Badge.find().sort({ category: 1, level: 1, name: 1 });

        return res.status(200).json(
            new ApiResponse(200, badges, "Badges fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching badges:", error);
        throw new ApiError(500, "Failed to fetch badges");
    }
});

// Admin: Get all challenges
const getAllChallenges = asyncHandler(async (req, res) => {
    try {
        const { status } = req.query;

        let query = {};
        if (status === "active") {
            query.isActive = true;
        } else if (status === "inactive") {
            query.isActive = false;
        }

        const challenges = await Challenge.find(query).sort({ startDate: -1 });

        return res.status(200).json(
            new ApiResponse(200, challenges, "Challenges fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching challenges:", error);
        throw new ApiError(500, "Failed to fetch challenges");
    }
});

// Admin: Update a badge
const updateBadge = asyncHandler(async (req, res) => {
    try {
        const { badgeId } = req.params;
        const { name, description, icon, category, level, pointsAwarded, criteria, isHidden } = req.body;

        // Check if badge exists
        const badge = await Badge.findById(badgeId);
        if (!badge) {
            throw new ApiError(404, "Badge not found");
        }

        // Check if name is being changed and if it already exists
        if (name && name !== badge.name) {
            const existingBadge = await Badge.findOne({ name, _id: { $ne: badgeId } });
            if (existingBadge) {
                throw new ApiError(400, `Badge with name "${name}" already exists`);
            }
        }

        // Update badge
        const updatedBadge = await Badge.findByIdAndUpdate(
            badgeId,
            {
                name: name || badge.name,
                description: description || badge.description,
                icon: icon || badge.icon,
                category: category || badge.category,
                level: level || badge.level,
                pointsAwarded: pointsAwarded !== undefined ? pointsAwarded : badge.pointsAwarded,
                criteria: criteria || badge.criteria,
                isHidden: isHidden !== undefined ? isHidden : badge.isHidden
            },
            { new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, updatedBadge, "Badge updated successfully")
        );
    } catch (error) {
        console.error("Error updating badge:", error);
        throw new ApiError(500, "Failed to update badge");
    }
});

// Admin: Delete a badge
const deleteBadge = asyncHandler(async (req, res) => {
    try {
        const { badgeId } = req.params;

        // Check if badge exists
        const badge = await Badge.findById(badgeId);
        if (!badge) {
            throw new ApiError(404, "Badge not found");
        }

        // Check if badge is used in any challenges
        const challengesUsingBadge = await Challenge.countDocuments({ 'reward.badge': badgeId });
        if (challengesUsingBadge > 0) {
            throw new ApiError(400, "Cannot delete badge as it is used in challenges");
        }

        // Delete badge
        await Badge.findByIdAndDelete(badgeId);

        // Remove badge from users who have it
        await UserBadge.deleteMany({ badge: badgeId });

        // Remove badge from displayed badges
        await User.updateMany(
            { displayedBadges: badgeId },
            { $pull: { displayedBadges: badgeId } }
        );

        return res.status(200).json(
            new ApiResponse(200, {}, "Badge deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting badge:", error);
        throw new ApiError(500, "Failed to delete badge");
    }
});

// Admin: Update a challenge
const updateChallenge = asyncHandler(async (req, res) => {
    try {
        const { challengeId } = req.params;
        const {
            title,
            description,
            type,
            criteria,
            reward,
            startDate,
            endDate,
            isActive
        } = req.body;

        // Check if challenge exists
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            throw new ApiError(404, "Challenge not found");
        }

        // Update challenge
        const updatedChallenge = await Challenge.findByIdAndUpdate(
            challengeId,
            {
                title: title || challenge.title,
                description: description || challenge.description,
                type: type || challenge.type,
                criteria: criteria || challenge.criteria,
                reward: reward || challenge.reward,
                startDate: startDate || challenge.startDate,
                endDate: endDate || challenge.endDate,
                isActive: isActive !== undefined ? isActive : challenge.isActive
            },
            { new: true }
        );

        // If challenge was inactive and is now active, assign to users who don't have it
        if (!challenge.isActive && updatedChallenge.isActive) {
            // Find users who don't have this challenge
            const usersWithChallenge = await UserChallenge.distinct('user', { challenge: challengeId });
            const allUsers = await User.find({}, '_id');

            const usersToAssign = allUsers.filter(user =>
                !usersWithChallenge.some(id => id.toString() === user._id.toString())
            );

            if (usersToAssign.length > 0) {
                const userChallenges = usersToAssign.map(user => ({
                    user: user._id,
                    challenge: challengeId,
                    progress: 0,
                    isCompleted: false
                }));

                await UserChallenge.insertMany(userChallenges);
            }
        }

        return res.status(200).json(
            new ApiResponse(200, updatedChallenge, "Challenge updated successfully")
        );
    } catch (error) {
        console.error("Error updating challenge:", error);
        throw new ApiError(500, "Failed to update challenge");
    }
});

// Admin: Delete a challenge
const deleteChallenge = asyncHandler(async (req, res) => {
    try {
        const { challengeId } = req.params;

        // Check if challenge exists
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            throw new ApiError(404, "Challenge not found");
        }

        // Delete challenge
        await Challenge.findByIdAndDelete(challengeId);

        // Delete user challenges
        await UserChallenge.deleteMany({ challenge: challengeId });

        return res.status(200).json(
            new ApiResponse(200, {}, "Challenge deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting challenge:", error);
        throw new ApiError(500, "Failed to delete challenge");
    }
});

// Admin: Get gamification statistics
const getGamificationStats = asyncHandler(async (req, res) => {
    try {
        // Get total users
        const totalUsers = await User.countDocuments();

        // Get total badges
        const totalBadges = await Badge.countDocuments();

        // Get total challenges
        const totalChallenges = await Challenge.countDocuments();

        // Get total points awarded
        const totalPointsAwarded = await PointTransaction.aggregate([
            {
                $match: { type: 'earned' }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Get top badges awarded
        const topBadges = await UserBadge.aggregate([
            {
                $group: {
                    _id: '$badge',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'badges',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'badge'
                }
            },
            {
                $unwind: '$badge'
            },
            {
                $project: {
                    _id: 0,
                    badge: '$badge',
                    count: 1
                }
            }
        ]);

        // Get top challenges completed
        const topChallenges = await UserChallenge.aggregate([
            {
                $match: { isCompleted: true }
            },
            {
                $group: {
                    _id: '$challenge',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'challenges',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'challenge'
                }
            },
            {
                $unwind: '$challenge'
            },
            {
                $project: {
                    _id: 0,
                    challenge: '$challenge',
                    count: 1
                }
            }
        ]);

        // Get points by category
        const pointsByCategory = await PointTransaction.aggregate([
            {
                $match: { type: 'earned' }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        return res.status(200).json(
            new ApiResponse(200, {
                totalUsers,
                totalBadges,
                totalChallenges,
                totalPointsAwarded: totalPointsAwarded.length > 0 ? totalPointsAwarded[0].total : 0,
                topBadges,
                topChallenges,
                pointsByCategory
            }, "Gamification statistics fetched successfully")
        );
    } catch (error) {
        console.error("Error fetching gamification statistics:", error);
        throw new ApiError(500, "Failed to fetch gamification statistics");
    }
});

// Force update user streak (for debugging/fixing)
const forceUpdateStreak = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Get current streak
        let streak = await Streak.findOne({ user: userId });

        if (!streak) {
            // Create new streak if not exists
            streak = await Streak.create({
                user: userId,
                currentStreak: 1,
                longestStreak: 1,
                lastActivityDate: new Date(),
                streakHistory: [{
                    date: new Date(),
                    activities: ["login"]
                }]
            });

            return res.status(200).json(
                new ApiResponse(200, streak, "New streak created successfully")
            );
        }

        // Force update streak to at least 1
        if (streak.currentStreak < 1) {
            streak.currentStreak = 1;
        }

        // Update longest streak if needed
        if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;
        }

        // Add today to history if not already there
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const hasTodayActivity = streak.streakHistory.some(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });

        if (!hasTodayActivity) {
            streak.streakHistory.push({
                date: today,
                activities: ["login"]
            });
        }

        streak.lastActivityDate = new Date();
        await streak.save();

        return res.status(200).json(
            new ApiResponse(200, streak, "Streak force updated successfully")
        );
    } catch (error) {
        console.error("Error force updating streak:", error);
        throw new ApiError(500, "Failed to force update streak");
    }
});

export {
    getUserProfile,
    getUserBadges,
    getUserPointsHistory,
    getUserStreak,
    getUserChallenges,
    getGamificationLeaderboard,
    getLeaderboardStreaks,
    updateDisplayedBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    adminAwardBadge,
    adminAwardPoints,
    getAllBadges,
    getAllChallenges,
    getGamificationStats,
    forceUpdateStreak
};
