import { Router } from "express";
import {
    createBlog,
    getAllBlogs,
    getBlogBySlug,
    getBlogById,
    updateBlog,
    deleteBlog,
    getBlogsByAuthor,
    getMyBlogs,
    addBlogComment,
    getBlogComments
} from "../controllers/blog.controller.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllBlogs);
router.route("/slug/:slug").get(getBlogBySlug);

// Protected routes (require authentication)
router.route("/").post(varifyJWT, upload.single("thumbnail"), createBlog);
router.route("/my/blogs").get(varifyJWT, getMyBlogs);
router.route("/author/:userId").get(getBlogsByAuthor);

// Blog comments
router.route("/:blogId/comments").get(getBlogComments);
router.route("/:blogId/comments").post(varifyJWT, addBlogComment);

// Routes with parameters (must be after specific routes)
router.route("/:blogId").get(varifyJWT, getBlogById);
router.route("/:blogId").patch(varifyJWT, upload.single("thumbnail"), updateBlog);
router.route("/:blogId").delete(varifyJWT, deleteBlog);

export default router;
