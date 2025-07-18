import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";

// Create a new category (admin only)
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, color, icon, order } = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
        throw new ApiError(400, "Category with this name already exists");
    }

    // Generate slug from name
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const category = await Category.create({
        name,
        slug,
        description: description || '',
        color: color || '#00bcd4',
        icon: icon || 'FaBook',
        order: order || 0,
        creator: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
    const { includeInactive = false } = req.query;
    
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    
    const categories = await Category.find(filter)
        .sort({ order: 1, name: 1 })
        .populate('creator', 'fullName email');

    return res.status(200).json(
        new ApiResponse(200, categories, "Categories retrieved successfully")
    );
});

// Get category by ID
const getCategoryById = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId)
        .populate('creator', 'fullName email');

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json(
        new ApiResponse(200, category, "Category retrieved successfully")
    );
});

// Get category by slug
const getCategoryBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true })
        .populate('creator', 'fullName email');

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res.status(200).json(
        new ApiResponse(200, category, "Category retrieved successfully")
    );
});

// Update category (admin only)
const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name, description, color, icon, order, isActive } = req.body;

    const category = await Category.findById(categoryId);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== category.name) {
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: categoryId }
        });

        if (existingCategory) {
            throw new ApiError(400, "Category with this name already exists");
        }

        category.name = name;
        category.slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    return res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
});

// Delete category (admin only)
const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Category deleted successfully")
    );
});

// Toggle category active status (admin only)
const toggleCategoryStatus = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.status(200).json(
        new ApiResponse(200, category, `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`)
    );
});

export {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
};
