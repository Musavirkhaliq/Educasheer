import { Router } from "express";
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllCategories);
router.route("/slug/:slug").get(getCategoryBySlug);

// Protected routes (require authentication)
router.use(verifyJWT);

// Admin only routes
router.route("/")
    .post(isAdmin, createCategory);

router.route("/:categoryId")
    .get(getCategoryById)
    .put(isAdmin, updateCategory)
    .delete(isAdmin, deleteCategory);

router.route("/:categoryId/toggle-status")
    .patch(isAdmin, toggleCategoryStatus);

export default router;
