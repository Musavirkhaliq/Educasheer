import { Reward, Redemption } from "../models/reward.model.js";
import { UserPoints } from "../models/gamification.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import crypto from "crypto";

/**
 * Generate a unique redemption code
 * @returns {string} - Unique redemption code
 */
const generateRedemptionCode = () => {
    // Generate a random code (8 characters)
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Add a timestamp component for uniqueness
    const timestamp = Date.now().toString().slice(-4);
    
    return `${code}-${timestamp}`;
};

/**
 * Create a new reward
 * @param {Object} rewardData - Reward data
 * @param {string} userId - ID of the user creating the reward (admin)
 * @returns {Promise<Object>} - Created reward
 */
export const createReward = async (rewardData, userId) => {
    try {
        const reward = await Reward.create({
            ...rewardData,
            createdBy: userId
        });
        
        return reward;
    } catch (error) {
        console.error("Error creating reward:", error);
        throw error;
    }
};

/**
 * Get all active rewards
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - List of rewards
 */
export const getActiveRewards = async (filters = {}) => {
    try {
        const defaultFilters = {
            isActive: true,
            $or: [
                { validUntil: { $exists: false } },
                { validUntil: null },
                { validUntil: { $gt: new Date() } }
            ]
        };
        
        // Combine default filters with any additional filters
        const combinedFilters = { ...defaultFilters, ...filters };
        
        // If quantity filter is needed
        if (combinedFilters.hasQuantityAvailable) {
            combinedFilters.$or = [
                { quantity: -1 }, // Unlimited
                { quantity: { $gt: 0 } } // Has quantity available
            ];
            delete combinedFilters.hasQuantityAvailable;
        }
        
        const rewards = await Reward.find(combinedFilters).sort({ pointsCost: 1 });
        return rewards;
    } catch (error) {
        console.error("Error getting active rewards:", error);
        throw error;
    }
};

/**
 * Get all rewards (for admin)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - List of rewards
 */
export const getAllRewards = async (filters = {}) => {
    try {
        const rewards = await Reward.find(filters).sort({ createdAt: -1 });
        return rewards;
    } catch (error) {
        console.error("Error getting all rewards:", error);
        throw error;
    }
};

/**
 * Redeem a reward
 * @param {string} rewardId - ID of the reward to redeem
 * @param {string} userId - ID of the user redeeming the reward
 * @returns {Promise<Object>} - Redemption details
 */
export const redeemReward = async (rewardId, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Get the reward
        const reward = await Reward.findById(rewardId).session(session);
        
        if (!reward) {
            throw new ApiError(404, "Reward not found");
        }
        
        // Check if reward is active
        if (!reward.isActive) {
            throw new ApiError(400, "This reward is no longer active");
        }
        
        // Check if reward is expired
        if (reward.validUntil && new Date(reward.validUntil) < new Date()) {
            throw new ApiError(400, "This reward has expired");
        }
        
        // Check if reward has quantity available
        if (reward.quantity !== -1 && reward.quantity <= 0) {
            throw new ApiError(400, "This reward is out of stock");
        }
        
        // Get user points
        const userPoints = await UserPoints.findOne({ user: userId }).session(session);
        
        if (!userPoints) {
            throw new ApiError(404, "User points record not found");
        }
        
        // Check if user has enough points
        if (userPoints.totalPoints < reward.pointsCost) {
            throw new ApiError(400, `You don't have enough points. Required: ${reward.pointsCost}, Available: ${userPoints.totalPoints}`);
        }
        
        // Generate redemption code
        const redemptionCode = generateRedemptionCode();
        
        // Calculate expiry date (default: 30 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Create redemption record
        const redemption = await Redemption.create([{
            user: userId,
            reward: rewardId,
            pointsSpent: reward.pointsCost,
            redemptionCode,
            expiresAt,
            status: "completed"
        }], { session });
        
        // Deduct points from user
        userPoints.totalPoints -= reward.pointsCost;
        await userPoints.save({ session });
        
        // Record point transaction
        const PointTransaction = mongoose.model("PointTransaction");
        await PointTransaction.create([{
            user: userId,
            amount: -reward.pointsCost,
            type: "spent",
            category: "reward",
            description: `Redeemed reward: ${reward.name}`,
            relatedItem: {
                itemId: reward._id,
                itemType: "Reward"
            }
        }], { session });
        
        // Update reward quantity if needed
        if (reward.quantity !== -1) {
            reward.quantity -= 1;
            await reward.save({ session });
        }
        
        await session.commitTransaction();
        
        return {
            redemption: redemption[0],
            reward,
            redemptionCode,
            expiresAt
        };
    } catch (error) {
        await session.abortTransaction();
        console.error("Error redeeming reward:", error);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Get user's redemption history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of redemptions
 */
export const getUserRedemptions = async (userId) => {
    try {
        const redemptions = await Redemption.find({ user: userId })
            .populate("reward")
            .sort({ redeemedAt: -1 });
            
        return redemptions;
    } catch (error) {
        console.error("Error getting user redemptions:", error);
        throw error;
    }
};

/**
 * Get redemption by code
 * @param {string} code - Redemption code
 * @returns {Promise<Object>} - Redemption details
 */
export const getRedemptionByCode = async (code) => {
    try {
        const redemption = await Redemption.findOne({ redemptionCode: code })
            .populate("reward")
            .populate("user", "fullName username email");
            
        if (!redemption) {
            throw new ApiError(404, "Redemption not found");
        }
        
        return redemption;
    } catch (error) {
        console.error("Error getting redemption by code:", error);
        throw error;
    }
};

/**
 * Mark a redemption as used
 * @param {string} redemptionId - Redemption ID
 * @returns {Promise<Object>} - Updated redemption
 */
export const markRedemptionAsUsed = async (redemptionId) => {
    try {
        const redemption = await Redemption.findByIdAndUpdate(
            redemptionId,
            {
                isUsed: true,
                usedAt: new Date()
            },
            { new: true }
        ).populate("reward");
        
        if (!redemption) {
            throw new ApiError(404, "Redemption not found");
        }
        
        return redemption;
    } catch (error) {
        console.error("Error marking redemption as used:", error);
        throw error;
    }
};
