import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { 
    createReward, 
    getActiveRewards, 
    getAllRewards, 
    redeemReward, 
    getUserRedemptions,
    getRedemptionByCode,
    markRedemptionAsUsed
} from "../services/reward.service.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * Create a new reward (admin only)
 */
const createNewReward = asyncHandler(async (req, res) => {
    try {
        const { 
            name, 
            description, 
            pointsCost, 
            category, 
            code, 
            validFrom, 
            validUntil, 
            quantity, 
            isActive 
        } = req.body;
        
        // Validate required fields
        if (!name || !description || !pointsCost) {
            throw new ApiError(400, "Name, description, and points cost are required");
        }
        
        // Upload image if provided
        let imageUrl;
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            imageUrl = uploadResult?.url;
        }
        
        // Create reward
        const reward = await createReward({
            name,
            description,
            pointsCost: parseInt(pointsCost),
            category: category || "other",
            image: imageUrl,
            code,
            validFrom: validFrom ? new Date(validFrom) : new Date(),
            validUntil: validUntil ? new Date(validUntil) : null,
            quantity: quantity ? parseInt(quantity) : -1,
            isActive: isActive === "true" || isActive === true
        }, req.user._id);
        
        return res.status(201).json(
            new ApiResponse(201, reward, "Reward created successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while creating reward");
    }
});

/**
 * Get all active rewards
 */
const getAvailableRewards = asyncHandler(async (req, res) => {
    try {
        const { category } = req.query;
        
        const filters = {};
        if (category) {
            filters.category = category;
        }
        
        // Add filter for quantity
        filters.hasQuantityAvailable = true;
        
        const rewards = await getActiveRewards(filters);
        
        return res.status(200).json(
            new ApiResponse(200, rewards, "Rewards fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching rewards");
    }
});

/**
 * Get all rewards (admin only)
 */
const getAllRewardsAdmin = asyncHandler(async (req, res) => {
    try {
        const { isActive, category } = req.query;
        
        const filters = {};
        if (isActive !== undefined) {
            filters.isActive = isActive === "true";
        }
        if (category) {
            filters.category = category;
        }
        
        const rewards = await getAllRewards(filters);
        
        return res.status(200).json(
            new ApiResponse(200, rewards, "All rewards fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching rewards");
    }
});

/**
 * Redeem a reward
 */
const redeemUserReward = asyncHandler(async (req, res) => {
    try {
        const { rewardId } = req.params;
        
        if (!rewardId) {
            throw new ApiError(400, "Reward ID is required");
        }
        
        const result = await redeemReward(rewardId, req.user._id);
        
        return res.status(200).json(
            new ApiResponse(200, result, "Reward redeemed successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while redeeming reward");
    }
});

/**
 * Get user's redemption history
 */
const getRedemptionHistory = asyncHandler(async (req, res) => {
    try {
        const redemptions = await getUserRedemptions(req.user._id);
        
        return res.status(200).json(
            new ApiResponse(200, redemptions, "Redemption history fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching redemption history");
    }
});

/**
 * Verify a redemption code (admin only)
 */
const verifyRedemptionCode = asyncHandler(async (req, res) => {
    try {
        const { code } = req.params;
        
        if (!code) {
            throw new ApiError(400, "Redemption code is required");
        }
        
        const redemption = await getRedemptionByCode(code);
        
        // Check if redemption is already used
        if (redemption.isUsed) {
            throw new ApiError(400, "This redemption code has already been used");
        }
        
        // Check if redemption is expired
        if (redemption.expiresAt && new Date(redemption.expiresAt) < new Date()) {
            throw new ApiError(400, "This redemption code has expired");
        }
        
        return res.status(200).json(
            new ApiResponse(200, redemption, "Redemption code verified successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while verifying redemption code");
    }
});

/**
 * Mark a redemption as used (admin only)
 */
const markRedemptionUsed = asyncHandler(async (req, res) => {
    try {
        const { redemptionId } = req.params;
        
        if (!redemptionId) {
            throw new ApiError(400, "Redemption ID is required");
        }
        
        const redemption = await markRedemptionAsUsed(redemptionId);
        
        return res.status(200).json(
            new ApiResponse(200, redemption, "Redemption marked as used successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while marking redemption as used");
    }
});

/**
 * Update a reward (admin only)
 */
const updateReward = asyncHandler(async (req, res) => {
    try {
        const { rewardId } = req.params;
        const { 
            name, 
            description, 
            pointsCost, 
            category, 
            code, 
            validFrom, 
            validUntil, 
            quantity, 
            isActive 
        } = req.body;
        
        if (!rewardId) {
            throw new ApiError(400, "Reward ID is required");
        }
        
        // Find the reward
        const reward = await Reward.findById(rewardId);
        
        if (!reward) {
            throw new ApiError(404, "Reward not found");
        }
        
        // Upload image if provided
        let imageUrl = reward.image;
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            imageUrl = uploadResult?.url || imageUrl;
        }
        
        // Update reward
        const updatedReward = await Reward.findByIdAndUpdate(
            rewardId,
            {
                name: name || reward.name,
                description: description || reward.description,
                pointsCost: pointsCost ? parseInt(pointsCost) : reward.pointsCost,
                category: category || reward.category,
                image: imageUrl,
                code: code !== undefined ? code : reward.code,
                validFrom: validFrom ? new Date(validFrom) : reward.validFrom,
                validUntil: validUntil ? new Date(validUntil) : reward.validUntil,
                quantity: quantity !== undefined ? parseInt(quantity) : reward.quantity,
                isActive: isActive !== undefined ? (isActive === "true" || isActive === true) : reward.isActive
            },
            { new: true }
        );
        
        return res.status(200).json(
            new ApiResponse(200, updatedReward, "Reward updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating reward");
    }
});

export {
    createNewReward,
    getAvailableRewards,
    getAllRewardsAdmin,
    redeemUserReward,
    getRedemptionHistory,
    verifyRedemptionCode,
    markRedemptionUsed,
    updateReward
};
