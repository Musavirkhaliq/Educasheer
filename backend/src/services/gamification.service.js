import { UserPoints, PointTransaction, Badge, UserBadge, Streak, Challenge, UserChallenge } from "../models/gamification.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

/**
 * Initialize gamification for a new user
 * @param {string} userId - The user ID
 */
export const initializeUserGamification = async (userId) => {
    try {
        // Create user points record
        await UserPoints.create({
            user: userId,
            totalPoints: 0,
            level: 1,
            currentLevelPoints: 0,
            pointsToNextLevel: 100
        });

        // Initialize streak
        await Streak.create({
            user: userId,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
            streakHistory: []
        });

        // Assign any welcome/starter badges
        const welcomeBadge = await Badge.findOne({ name: "Welcome" });
        if (welcomeBadge) {
            await awardBadge(userId, welcomeBadge._id);
        }

        // Assign active challenges to the user
        const activeGlobalChallenges = await Challenge.find({
            isActive: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        for (const challenge of activeGlobalChallenges) {
            await UserChallenge.create({
                user: userId,
                challenge: challenge._id,
                progress: 0,
                isCompleted: false
            });
        }

        return true;
    } catch (error) {
        console.error("Error initializing user gamification:", error);
        throw error;
    }
};

/**
 * Award points to a user
 * @param {string} userId - The user ID
 * @param {number} points - Number of points to award
 * @param {string} category - Category of points (course_completion, video_watch, etc.)
 * @param {string} description - Description of the points transaction
 * @param {Object} relatedItem - Related item (course, video, etc.)
 */
export const awardPoints = async (userId, points, category, description, relatedItem = null) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get user points record or create if not exists
        let userPoints = await UserPoints.findOne({ user: userId }).session(session);

        if (!userPoints) {
            userPoints = await UserPoints.create([{
                user: userId,
                totalPoints: 0,
                level: 1,
                currentLevelPoints: 0,
                pointsToNextLevel: 100
            }], { session });
            userPoints = userPoints[0];
        }

        // Update total points and category-specific points
        userPoints.totalPoints += points;
        userPoints.currentLevelPoints += points;

        // Update category-specific points
        switch (category) {
            case "course_completion":
                userPoints.courseCompletionPoints += points;
                break;
            case "video_watch":
                userPoints.videoWatchPoints += points;
                break;
            case "quiz":
                userPoints.quizPoints += points;
                break;
            case "attendance":
                userPoints.attendancePoints += points;
                break;
            case "blog":
                userPoints.blogPoints += points;
                break;
            case "comment":
                userPoints.commentPoints += points;
                break;
            case "social":
                userPoints.socialPoints += points;
                break;
        }

        // Check if user should level up
        let leveledUp = false;
        while (userPoints.currentLevelPoints >= userPoints.pointsToNextLevel) {
            userPoints.level += 1;
            userPoints.currentLevelPoints -= userPoints.pointsToNextLevel;
            userPoints.pointsToNextLevel = calculatePointsForNextLevel(userPoints.level);
            leveledUp = true;
        }

        await userPoints.save({ session });

        // Create point transaction record
        const transaction = {
            user: userId,
            amount: points,
            type: "earned",
            category,
            description
        };

        if (relatedItem) {
            transaction.relatedItem = relatedItem;
        }

        await PointTransaction.create([transaction], { session });

        // If user leveled up, update user record
        if (leveledUp) {
            await User.findByIdAndUpdate(userId, {
                currentLevel: userPoints.level
            }, { session });

            // Check for level-based badges
            await checkAndAwardLevelBadges(userId, userPoints.level, session);
        }

        // Update user's last activity date
        await User.findByIdAndUpdate(userId, {
            lastActivityDate: new Date()
        }, { session });

        // Update streak
        await updateUserStreak(userId, ["other"], session);

        // Check and update challenges
        await updateChallengeProgress(userId, category, 1, relatedItem, session);

        await session.commitTransaction();
        return { points: userPoints, leveledUp };
    } catch (error) {
        await session.abortTransaction();
        console.error("Error awarding points:", error);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Award a badge to a user
 * @param {string} userId - The user ID
 * @param {string} badgeId - The badge ID
 * @param {mongoose.ClientSession} session - Mongoose session for transactions
 */
export const awardBadge = async (userId, badgeId, session = null) => {
    const useSession = session !== null;

    try {
        // Check if user already has this badge
        const existingBadge = await UserBadge.findOne({
            user: userId,
            badge: badgeId
        }).session(useSession ? session : null);

        if (existingBadge) {
            return { alreadyAwarded: true, badge: existingBadge };
        }

        // Get badge details
        const badge = await Badge.findById(badgeId).session(useSession ? session : null);
        if (!badge) {
            throw new Error(`Badge with ID ${badgeId} not found`);
        }

        // Award badge to user
        const userBadge = await UserBadge.create([{
            user: userId,
            badge: badgeId,
            earnedAt: new Date(),
            displayed: !badge.isHidden
        }], { session: useSession ? session : null });

        // If badge awards points, give them to the user
        if (badge.pointsAwarded > 0) {
            await awardPoints(
                userId,
                badge.pointsAwarded,
                "other",
                `Earned ${badge.pointsAwarded} points for "${badge.name}" badge`,
                null
            );
        }

        // Add badge to user's displayed badges if not hidden
        if (!badge.isHidden) {
            const user = await User.findById(userId).session(useSession ? session : null);
            if (!user.displayedBadges) {
                user.displayedBadges = [];
            }

            // Only display up to 5 badges
            if (user.displayedBadges.length < 5) {
                user.displayedBadges.push(badgeId);
                await user.save({ session: useSession ? session : null });
            }
        }

        return {
            awarded: true,
            badge: userBadge[0],
            pointsAwarded: badge.pointsAwarded
        };
    } catch (error) {
        console.error("Error awarding badge:", error);
        throw error;
    }
};

/**
 * Check and award level-based badges
 * @param {string} userId - The user ID
 * @param {number} level - The user's current level
 * @param {mongoose.ClientSession} session - Mongoose session for transactions
 */
export const checkAndAwardLevelBadges = async (userId, level, session = null) => {
    try {
        // Find badges that are awarded based on level
        const levelBadges = await Badge.find({
            criteria: { $regex: `level:${level}` }
        }).session(session || null);

        const awardedBadges = [];
        for (const badge of levelBadges) {
            const result = await awardBadge(userId, badge._id, session);
            if (result.awarded) {
                awardedBadges.push(result);
            }
        }

        return awardedBadges;
    } catch (error) {
        console.error("Error checking level badges:", error);
        throw error;
    }
};

/**
 * Update user streak
 * @param {string} userId - The user ID
 * @param {Array} activities - Array of activity types
 * @param {mongoose.ClientSession} session - Mongoose session for transactions
 */
export const updateUserStreak = async (userId, activities = [], session = null) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = await Streak.findOne({ user: userId }).session(session || null);

        if (!streak) {
            streak = await Streak.create([{
                user: userId,
                currentStreak: 1,
                longestStreak: 1,
                lastActivityDate: new Date(),
                streakHistory: [{
                    date: today,
                    activities
                }]
            }], { session: session || null });

            return streak[0];
        }

        // Check if user already has activity today
        const lastActivityDate = new Date(streak.lastActivityDate);
        lastActivityDate.setHours(0, 0, 0, 0);

        if (lastActivityDate.getTime() === today.getTime()) {
            // Already has activity today, just update the activities
            const todayHistoryIndex = streak.streakHistory.findIndex(
                h => new Date(h.date).setHours(0, 0, 0, 0) === today.getTime()
            );

            if (todayHistoryIndex >= 0) {
                // Add any new activity types
                activities.forEach(activity => {
                    if (!streak.streakHistory[todayHistoryIndex].activities.includes(activity)) {
                        streak.streakHistory[todayHistoryIndex].activities.push(activity);
                    }
                });
            } else {
                // Add today to history
                streak.streakHistory.push({
                    date: today,
                    activities
                });
            }
        } else {
            // Check if this is consecutive day
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            if (lastActivityDate.getTime() === yesterday.getTime()) {
                // Consecutive day, increment streak
                streak.currentStreak += 1;
                if (streak.currentStreak > streak.longestStreak) {
                    streak.longestStreak = streak.currentStreak;
                }
            } else if (lastActivityDate < yesterday || streak.currentStreak === 0) {
                // Streak broken or first activity, set to 1
                streak.currentStreak = 1;

                // If this is the first activity ever, also update longest streak
                if (streak.longestStreak === 0) {
                    streak.longestStreak = 1;
                }
            }

            // Add today to history
            streak.streakHistory.push({
                date: today,
                activities
            });

            // Trim history to keep only last 30 days
            if (streak.streakHistory.length > 30) {
                streak.streakHistory = streak.streakHistory.slice(-30);
            }
        }

        // Ensure streak is never 0 for active users
        if (streak.currentStreak === 0 || streak.currentStreak < 1) {
            streak.currentStreak = 1;
            streak.longestStreak = Math.max(1, streak.longestStreak);
            console.log("Fixed zero streak in updateUserStreak for user:", userId);
        }

        streak.lastActivityDate = new Date();
        await streak.save({ session: session || null });

        // Check for streak-based badges
        if (streak.currentStreak === 3 ||
            streak.currentStreak === 7 ||
            streak.currentStreak === 30 ||
            streak.currentStreak === 100) {

            const streakBadges = await Badge.find({
                criteria: { $regex: `streak:${streak.currentStreak}` }
            }).session(session || null);

            for (const badge of streakBadges) {
                await awardBadge(userId, badge._id, session);
            }
        }

        return streak;
    } catch (error) {
        console.error("Error updating streak:", error);
        throw error;
    }
};

/**
 * Update challenge progress
 * @param {string} userId - The user ID
 * @param {string} activityType - Type of activity
 * @param {number} incrementAmount - Amount to increment progress
 * @param {Object} relatedItem - Related item (course, video, etc.)
 * @param {mongoose.ClientSession} session - Mongoose session for transactions
 */
export const updateChallengeProgress = async (userId, activityType, incrementAmount = 1, relatedItem = null, session = null) => {
    try {
        // Find active challenges for this user and activity type
        const userChallenges = await UserChallenge.find({
            user: userId,
            isCompleted: false
        })
        .populate('challenge')
        .session(session || null);

        const updatedChallenges = [];

        for (const userChallenge of userChallenges) {
            const challenge = userChallenge.challenge;

            // Skip if challenge is not active or not matching activity type
            if (!challenge.isActive || challenge.criteria.activityType !== activityType) {
                continue;
            }

            // Check if challenge has specific items and if current item matches
            if (challenge.criteria.specificItems && challenge.criteria.specificItems.length > 0) {
                if (!relatedItem) continue;

                const matchingItem = challenge.criteria.specificItems.find(item =>
                    item.itemId.toString() === relatedItem.itemId.toString() &&
                    item.itemType === relatedItem.itemType
                );

                if (!matchingItem) continue;
            }

            // Update progress
            userChallenge.progress += incrementAmount;

            // Check if challenge is completed
            if (userChallenge.progress >= challenge.criteria.targetCount && !userChallenge.isCompleted) {
                userChallenge.isCompleted = true;
                userChallenge.completedAt = new Date();

                // Award points for completing challenge
                if (challenge.reward.points > 0) {
                    await awardPoints(
                        userId,
                        challenge.reward.points,
                        "other",
                        `Completed challenge: ${challenge.title}`,
                        null
                    );
                }

                // Award badge if applicable
                if (challenge.reward.badge) {
                    await awardBadge(userId, challenge.reward.badge, session);
                }
            }

            await userChallenge.save({ session: session || null });
            updatedChallenges.push(userChallenge);
        }

        return updatedChallenges;
    } catch (error) {
        console.error("Error updating challenge progress:", error);
        throw error;
    }
};

/**
 * Calculate points needed for next level
 * @param {number} currentLevel - The current level
 * @returns {number} - Points needed for next level
 */
export const calculatePointsForNextLevel = (currentLevel) => {
    // Formula: 100 * (level ^ 1.5)
    return Math.round(100 * Math.pow(currentLevel, 1.5));
};

/**
 * Get user gamification profile
 * @param {string} userId - The user ID
 */
export const getUserGamificationProfile = async (userId) => {
    try {
        const user = await User.findById(userId)
            .populate('points')
            .populate({
                path: 'badges',
                populate: {
                    path: 'badge',
                    model: 'Badge'
                }
            })
            .populate('streak')
            .populate({
                path: 'challenges',
                match: { isCompleted: false },
                populate: {
                    path: 'challenge',
                    model: 'Challenge'
                }
            })
            .populate('displayedBadges');

        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Get recent point transactions
        const recentTransactions = await PointTransaction.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get leaderboard position
        const userPoints = await UserPoints.findOne({ user: userId });
        let leaderboardPosition = null;

        if (userPoints) {
            const higherPointsUsers = await UserPoints.countDocuments({
                totalPoints: { $gt: userPoints.totalPoints }
            });
            leaderboardPosition = higherPointsUsers + 1;
        }

        return {
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                avatar: user.avatar,
                currentLevel: user.currentLevel || 1,
                displayedBadges: user.displayedBadges || []
            },
            points: user.points || { totalPoints: 0, level: 1, currentLevelPoints: 0, pointsToNextLevel: 100 },
            badges: user.badges || [],
            streak: user.streak || { currentStreak: 0, longestStreak: 0 },
            challenges: user.challenges || [],
            recentTransactions,
            leaderboardPosition
        };
    } catch (error) {
        console.error("Error getting user gamification profile:", error);
        throw error;
    }
};

/**
 * Get leaderboard
 * @param {number} limit - Number of users to return
 * @param {number} page - Page number
 */
export const getLeaderboard = async (limit = 10, page = 1) => {
    try {
        const skip = (page - 1) * limit;

        const leaderboard = await UserPoints.find()
            .sort({ totalPoints: -1, level: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username fullName avatar currentLevel displayedBadges');

        const total = await UserPoints.countDocuments();

        return {
            leaderboard,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error("Error getting leaderboard:", error);
        throw error;
    }
};
