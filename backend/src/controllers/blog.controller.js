import { Blog } from "../models/blog.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { awardPoints, awardBadge, updateChallengeProgress } from "../services/gamification.service.js";
import mongoose from "mongoose";

// Helper function to generate a unique slug from title
const generateUniqueSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') +
        '-' +
        Date.now().toString().slice(-4);
};

// Helper function to calculate read time
const calculateReadTime = (content) => {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

// Create a new blog
const createBlog = asyncHandler(async (req, res) => {
    try {
        const { title, content, category, tags, excerpt, isPublished } = req.body;
        const thumbnailLocalPath = req.file?.path;

        // Validate input
        if (!title || !content) {
            throw new ApiError(400, "Title and content are required");
        }

        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Thumbnail image is required");
        }

        // Upload thumbnail to cloudinary
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        // If Cloudinary upload fails, use a placeholder URL for development
        let thumbnailUrl;
        if (!thumbnail || !thumbnail.url) {
            console.warn("Cloudinary upload failed, using placeholder image");
            thumbnailUrl = "https://via.placeholder.com/800x400?text=Blog+Thumbnail";
        } else {
            thumbnailUrl = thumbnail.url;
        }

        // Process tags
        let processedTags = [];
        if (tags) {
            if (typeof tags === 'string') {
                processedTags = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else if (Array.isArray(tags)) {
                processedTags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
        }

        // Generate slug from title
        const slug = generateUniqueSlug(title);

        // Calculate read time
        const readTime = calculateReadTime(content);

        // Create blog
        const blog = await Blog.create({
            title,
            slug,
            content,
            thumbnail: thumbnailUrl,
            excerpt: excerpt || title,
            author: req.user._id,
            category: category || "Uncategorized",
            tags: processedTags,
            isPublished: isPublished === "true" || isPublished === true,
            readTime
        });

        // Award points if blog is published
        if (blog.isPublished) {
            try {
                // Award points for publishing a blog
                await awardPoints(
                    req.user._id,
                    150,
                    "blog",
                    `Published a blog: ${blog.title}`,
                    {
                        itemId: blog._id,
                        itemType: "Blog"
                    }
                );

                // Check for blogger badge (first blog)
                const blogCount = await Blog.countDocuments({
                    author: req.user._id,
                    isPublished: true
                });

                if (blogCount === 1) {
                    const bloggerBadge = await mongoose.model("Badge").findOne({
                        criteria: "blog:publish:1"
                    });

                    if (bloggerBadge) {
                        await awardBadge(req.user._id, bloggerBadge._id);
                    }
                }
            } catch (gamificationError) {
                console.error("Error awarding points for blog publication:", gamificationError);
                // Continue even if gamification fails
            }
        }

        return res.status(201).json(
            new ApiResponse(201, blog, "Blog created successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while creating blog");
    }
});

// Get all blogs (with filters and pagination)
const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            tag,
            search,
            sort = "createdAt",
            order = "desc"
        } = req.query;

        // Build filter object
        const filters = { isPublished: true };

        if (category) {
            filters.category = category;
        }

        if (tag) {
            filters.tags = { $in: [tag] };
        }

        if (search) {
            filters.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
                { excerpt: { $regex: search, $options: "i" } }
            ];
        }

        // Build sort object
        const sortOptions = {};
        sortOptions[sort] = order === "asc" ? 1 : -1;

        // Execute query with pagination
        const blogs = await Blog.find(filters)
            .populate("author", "fullName username avatar")
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalBlogs = await Blog.countDocuments(filters);

        return res.status(200).json(
            new ApiResponse(200, {
                blogs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalBlogs,
                    totalPages: Math.ceil(totalBlogs / limit)
                }
            }, "Blogs fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching blogs");
    }
});

// Get blog by slug
const getBlogBySlug = asyncHandler(async (req, res) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            throw new ApiError(400, "Blog slug is required");
        }

        const blog = await Blog.findOne({ slug })
            .populate("author", "fullName username avatar")
            .populate({
                path: "comments",
                match: { isReply: false },
                populate: [
                    { path: "owner", select: "fullName username avatar" },
                    {
                        path: "replies",
                        populate: { path: "owner", select: "fullName username avatar" }
                    }
                ]
            });

        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        return res.status(200).json(
            new ApiResponse(200, blog, "Blog fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching blog");
    }
});

// Get blog by ID
const getBlogById = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!blogId) {
            throw new ApiError(400, "Blog ID is required");
        }

        const blog = await Blog.findById(blogId)
            .populate("author", "fullName username avatar");

        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        // If blog is not published, only allow author or admin to view it
        if (!blog.isPublished &&
            blog.author._id.toString() !== req.user?._id?.toString() &&
            req.user?.role !== "admin") {
            throw new ApiError(403, "This blog is not published yet");
        }

        return res.status(200).json(
            new ApiResponse(200, blog, "Blog fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching blog");
    }
});

// Update blog
const updateBlog = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.params;
        const {
            title,
            content,
            category,
            tags,
            excerpt,
            isPublished
        } = req.body;
        const thumbnailLocalPath = req.file?.path;

        if (!blogId) {
            throw new ApiError(400, "Blog ID is required");
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        // Check if user is author or admin
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            throw new ApiError(403, "You are not authorized to update this blog");
        }

        // Update thumbnail if provided
        let thumbnailUrl = blog.thumbnail;
        if (thumbnailLocalPath) {
            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
            if (!thumbnail || !thumbnail.url) {
                console.warn("Cloudinary upload failed during update, using placeholder image");
                thumbnailUrl = "https://via.placeholder.com/800x400?text=Blog+Thumbnail";
            } else {
                thumbnailUrl = thumbnail.url;
            }
        }

        // Process tags
        let processedTags = blog.tags;
        if (tags) {
            if (typeof tags === 'string') {
                processedTags = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else if (Array.isArray(tags)) {
                processedTags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
        }

        // Update slug if title is changed
        let slug = blog.slug;
        if (title && title !== blog.title) {
            slug = generateUniqueSlug(title);
        }

        // Calculate read time if content is changed
        let readTime = blog.readTime;
        if (content && content !== blog.content) {
            readTime = calculateReadTime(content);
        }

        // Check if blog is being published for the first time
        const wasPublished = blog.isPublished;
        const willBePublished = isPublished === "true" || isPublished === true || blog.isPublished;
        const isNewlyPublished = !wasPublished && willBePublished;

        // Update blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $set: {
                    title: title || blog.title,
                    slug,
                    content: content || blog.content,
                    thumbnail: thumbnailUrl,
                    excerpt: excerpt || blog.excerpt,
                    category: category || blog.category,
                    tags: processedTags,
                    isPublished: willBePublished,
                    readTime
                }
            },
            { new: true }
        ).populate("author", "fullName username avatar");

        // Award points if blog is being published for the first time
        if (isNewlyPublished) {
            try {
                // Award points for publishing a blog
                await awardPoints(
                    req.user._id,
                    150,
                    "blog",
                    `Published a blog: ${updatedBlog.title}`,
                    {
                        itemId: updatedBlog._id,
                        itemType: "Blog"
                    }
                );

                // Check for blogger badge (first blog)
                const blogCount = await Blog.countDocuments({
                    author: req.user._id,
                    isPublished: true
                });

                if (blogCount === 1) {
                    const bloggerBadge = await mongoose.model("Badge").findOne({
                        criteria: "blog:publish:1"
                    });

                    if (bloggerBadge) {
                        await awardBadge(req.user._id, bloggerBadge._id);
                    }
                }
            } catch (gamificationError) {
                console.error("Error awarding points for blog publication:", gamificationError);
                // Continue even if gamification fails
            }
        }

        return res.status(200).json(
            new ApiResponse(200, updatedBlog, "Blog updated successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while updating blog");
    }
});

// Delete blog
const deleteBlog = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!blogId) {
            throw new ApiError(400, "Blog ID is required");
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        // Check if user is author or admin
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            throw new ApiError(403, "You are not authorized to delete this blog");
        }

        // Delete blog
        await Blog.findByIdAndDelete(blogId);

        // Delete associated comments
        await Comment.deleteMany({ blog: blogId });

        return res.status(200).json(
            new ApiResponse(200, {}, "Blog deleted successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while deleting blog");
    }
});

// Get blogs by author
const getBlogsByAuthor = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        // Build filter object
        const filters = {
            author: userId,
            isPublished: true
        };

        // If user is viewing their own blogs or is admin, show unpublished blogs too
        if (userId === req.user?._id?.toString() || req.user?.role === "admin") {
            delete filters.isPublished;
        }

        // Execute query with pagination
        const blogs = await Blog.find(filters)
            .populate("author", "fullName username avatar")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalBlogs = await Blog.countDocuments(filters);

        return res.status(200).json(
            new ApiResponse(200, {
                blogs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalBlogs,
                    totalPages: Math.ceil(totalBlogs / limit)
                }
            }, "Author blogs fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching author blogs");
    }
});

// Get my blogs (for logged in user)
const getMyBlogs = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // Execute query with pagination
        const blogs = await Blog.find({ author: req.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalBlogs = await Blog.countDocuments({ author: req.user._id });

        return res.status(200).json(
            new ApiResponse(200, {
                blogs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalBlogs,
                    totalPages: Math.ceil(totalBlogs / limit)
                }
            }, "Your blogs fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching your blogs");
    }
});

// Add a comment to a blog
const addBlogComment = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            throw new ApiError(400, "Comment content is required");
        }

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        // Create comment
        const comment = await Comment.create({
            content,
            blog: blogId,
            owner: req.user._id
        });

        // Populate owner details
        const populatedComment = await Comment.findById(comment._id).populate("owner", "fullName username avatar");

        return res.status(201).json(
            new ApiResponse(201, populatedComment, "Comment added successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while adding comment");
    }
});

// Get blog comments
const getBlogComments = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!blogId) {
            throw new ApiError(400, "Blog ID is required");
        }

        // Check if blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            throw new ApiError(404, "Blog not found");
        }

        // Get comments that are not replies
        const comments = await Comment.find({
            blog: blogId,
            isReply: false
        })
        .populate("owner", "fullName username avatar")
        .populate({
            path: "replies",
            populate: { path: "owner", select: "fullName username avatar" }
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        // Get total count for pagination
        const totalComments = await Comment.countDocuments({
            blog: blogId,
            isReply: false
        });

        return res.status(200).json(
            new ApiResponse(200, {
                comments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalComments,
                    totalPages: Math.ceil(totalComments / limit)
                }
            }, "Blog comments fetched successfully")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Something went wrong while fetching blog comments");
    }
});

export {
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
};
