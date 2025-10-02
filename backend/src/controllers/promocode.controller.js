import { PromoCode } from "../models/promocode.model.js";

// Create promo code (Admin only)
export const createPromoCode = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            maxDiscount,
            minOrderAmount,
            applicableItems,
            specificItems,
            usageLimit,
            userLimit,
            validFrom,
            validUntil
        } = req.body;

        // Check if code already exists
        const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            return res.status(400).json({
                success: false,
                message: "Promo code already exists"
            });
        }

        const promoCode = new PromoCode({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            maxDiscount: discountType === 'percentage' ? maxDiscount : null,
            minOrderAmount: minOrderAmount || 0,
            applicableItems: applicableItems || 'all',
            specificItems: specificItems || [],
            usageLimit,
            userLimit: userLimit || 1,
            validFrom: validFrom || new Date(),
            validUntil,
            creator: req.user._id
        });

        await promoCode.save();

        res.status(201).json({
            success: true,
            message: "Promo code created successfully",
            data: promoCode
        });
    } catch (error) {
        console.error("Create promo code error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create promo code"
        });
    }
};

// Get all promo codes (Admin only)
export const getAllPromoCodes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        const query = {};
        if (search) {
            query.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const promoCodes = await PromoCode.find(query)
            .populate('creator', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await PromoCode.countDocuments(query);

        res.json({
            success: true,
            data: {
                promoCodes,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            }
        });
    } catch (error) {
        console.error("Get promo codes error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get promo codes"
        });
    }
};

// Validate promo code
export const validatePromoCode = async (req, res) => {
    try {
        const { code, cartItems } = req.body;
        const userId = req.user._id;

        if (!code || !cartItems || !Array.isArray(cartItems)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request data"
            });
        }

        const promoCode = await PromoCode.findOne({ 
            code: code.toUpperCase(),
            isActive: true
        });

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: "Invalid promo code"
            });
        }

        // Check if code is expired
        const now = new Date();
        if (now < promoCode.validFrom || now > promoCode.validUntil) {
            return res.status(400).json({
                success: false,
                message: "Promo code has expired"
            });
        }

        // Check usage limit
        if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
            return res.status(400).json({
                success: false,
                message: "Promo code usage limit exceeded"
            });
        }

        // Check user usage limit
        const userUsage = promoCode.usedBy.find(usage => usage.user.toString() === userId.toString());
        if (userUsage && userUsage.usedCount >= promoCode.userLimit) {
            return res.status(400).json({
                success: false,
                message: "You have already used this promo code"
            });
        }

        // Calculate subtotal
        const subtotal = cartItems.reduce((total, item) => total + item.price, 0);

        // Check minimum order amount
        if (subtotal < promoCode.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of ₹${promoCode.minOrderAmount} required`
            });
        }

        // Check applicable items
        let applicableAmount = 0;
        
        if (promoCode.applicableItems === 'all') {
            applicableAmount = subtotal;
        } else {
            // Filter items based on applicable type
            const applicableItems = cartItems.filter(item => {
                if (promoCode.applicableItems === 'courses' && item.itemType === 'course') return true;
                if (promoCode.applicableItems === 'testSeries' && item.itemType === 'testSeries') return true;
                if (promoCode.applicableItems === 'programs' && item.itemType === 'program') return true;
                return false;
            });
            
            applicableAmount = applicableItems.reduce((total, item) => total + item.price, 0);
        }

        // Check specific items if defined
        if (promoCode.specificItems && promoCode.specificItems.length > 0) {
            const specificItemIds = promoCode.specificItems.map(item => item.itemId.toString());
            const matchingItems = cartItems.filter(item => 
                specificItemIds.includes(item.itemId.toString())
            );
            applicableAmount = matchingItems.reduce((total, item) => total + item.price, 0);
        }

        if (applicableAmount === 0) {
            return res.status(400).json({
                success: false,
                message: "This promo code is not applicable to items in your cart"
            });
        }

        // Calculate discount
        let discountAmount = 0;
        
        if (promoCode.discountType === 'percentage') {
            discountAmount = (applicableAmount * promoCode.discountValue) / 100;
            if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
                discountAmount = promoCode.maxDiscount;
            }
        } else {
            discountAmount = Math.min(promoCode.discountValue, applicableAmount);
        }

        const finalAmount = subtotal - discountAmount;

        res.json({
            success: true,
            message: "Promo code applied successfully",
            data: {
                code: promoCode.code,
                description: promoCode.description,
                discountAmount,
                subtotal,
                finalAmount,
                savings: discountAmount
            }
        });
    } catch (error) {
        console.error("Validate promo code error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to validate promo code"
        });
    }
};

// Update promo code (Admin only)
export const updatePromoCode = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Don't allow updating the code itself
        delete updateData.code;
        delete updateData.creator;

        const promoCode = await PromoCode.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: "Promo code not found"
            });
        }

        res.json({
            success: true,
            message: "Promo code updated successfully",
            data: promoCode
        });
    } catch (error) {
        console.error("Update promo code error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update promo code"
        });
    }
};

// Delete promo code (Admin only)
export const deletePromoCode = async (req, res) => {
    try {
        const { id } = req.params;

        const promoCode = await PromoCode.findByIdAndDelete(id);

        if (!promoCode) {
            return res.status(404).json({
                success: false,
                message: "Promo code not found"
            });
        }

        res.json({
            success: true,
            message: "Promo code deleted successfully"
        });
    } catch (error) {
        console.error("Delete promo code error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete promo code"
        });
    }
};