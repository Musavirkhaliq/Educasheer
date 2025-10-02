import { Cart } from "../models/cart.model.js";
import { Course } from "../models/course.model.js";
import { TestSeries } from "../models/testSeries.model.js";
import { Program } from "../models/program.model.js";

// Get user's cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            return res.json({
                success: true,
                data: {
                    items: [],
                    totalAmount: 0,
                    totalItems: 0
                }
            });
        }

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get cart"
        });
    }
};

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const { itemType, itemId } = req.body;
        const userId = req.user._id;

        // Validate item type
        if (!["course", "testSeries", "program"].includes(itemType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid item type"
            });
        }

        // Get item details
        let item;
        let Model;
        
        switch (itemType) {
            case "course":
                Model = Course;
                break;
            case "testSeries":
                Model = TestSeries;
                break;
            case "program":
                Model = Program;
                break;
        }

        item = await Model.findById(itemId);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        if (!item.isPublished) {
            return res.status(400).json({
                success: false,
                message: "Item is not available for purchase"
            });
        }

        // Check if user already owns this item
        if (item.enrolledStudents && item.enrolledStudents.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "You already own this item"
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if item already in cart
        const existingItem = cart.items.find(
            cartItem => cartItem.itemId.toString() === itemId && cartItem.itemType === itemType
        );

        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: "Item already in cart"
            });
        }

        // Add item to cart
        cart.items.push({
            itemType,
            itemId,
            title: item.title,
            price: item.price || 0,
            originalPrice: item.originalPrice || item.price || 0,
            thumbnail: item.thumbnail || ''
        });

        await cart.save();

        res.json({
            success: true,
            message: "Item added to cart",
            data: cart
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add item to cart"
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { itemType, itemId } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Remove item from cart
        cart.items = cart.items.filter(
            item => !(item.itemId.toString() === itemId && item.itemType === itemType)
        );

        await cart.save();

        res.json({
            success: true,
            message: "Item removed from cart",
            data: cart
        });
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart"
        });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        await Cart.findOneAndUpdate(
            { user: userId },
            { items: [], totalAmount: 0, totalItems: 0 },
            { upsert: true }
        );

        res.json({
            success: true,
            message: "Cart cleared"
        });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to clear cart"
        });
    }
};