import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { awardPoints, awardBadge, updateChallengeProgress } from "./gamification.service.js";
import mongoose from "mongoose";

// Create a schema for course progress if it doesn't exist
const CourseProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  completedVideos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  }],
  completedQuizzes: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only have one progress record per course
CourseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

// Create the model if it doesn't exist
const CourseProgress = mongoose.models.CourseProgress || mongoose.model("CourseProgress", CourseProgressSchema);

/**
 * Update course progress when a video is watched
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} - Updated course progress
 */
export const updateCourseProgressForVideo = async (userId, courseId, videoId) => {
  try {
    // Find the course
    const course = await Course.findById(courseId).populate('videos');
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    // Check if video belongs to this course
    const videoInCourse = course.videos.some(video => video._id.toString() === videoId);
    if (!videoInCourse) {
      throw new Error(`Video with ID ${videoId} does not belong to course with ID ${courseId}`);
    }

    // Find or create course progress
    let courseProgress = await CourseProgress.findOne({ user: userId, course: courseId });
    const isFirstProgress = !courseProgress;
    
    if (!courseProgress) {
      courseProgress = new CourseProgress({
        user: userId,
        course: courseId,
        completedVideos: [],
        completedQuizzes: [],
        progress: 0,
        completed: false
      });
    }

    // Check if video is already marked as completed
    const videoAlreadyCompleted = courseProgress.completedVideos.some(
      video => video.toString() === videoId
    );

    // If video is not already completed, add it to completed videos
    if (!videoAlreadyCompleted) {
      courseProgress.completedVideos.push(videoId);
      courseProgress.lastActivity = new Date();
      
      // Calculate new progress percentage
      const totalItems = course.videos.length + (course.quizzes ? course.quizzes.length : 0);
      const completedItems = courseProgress.completedVideos.length + courseProgress.completedQuizzes.length;
      courseProgress.progress = Math.round((completedItems / totalItems) * 100);
      
      // Check if course is now completed (90% or more)
      const wasCompleted = courseProgress.completed;
      courseProgress.completed = courseProgress.progress >= 90;
      
      if (courseProgress.completed && !wasCompleted) {
        courseProgress.completedAt = new Date();
        
        // Award points for completing the course
        await awardPoints(
          userId,
          300, // Higher points for course completion
          "course_completion",
          `Completed course: ${course.title}`,
          {
            itemId: course._id,
            itemType: "Course"
          }
        );
        
        // Update challenge progress
        await updateChallengeProgress(userId, "course_completion", 1, {
          itemId: course._id,
          itemType: "Course"
        });
        
        // Check for course completion badges
        const badges = await mongoose.model("Badge").find({
          criteria: { $regex: "course:complete:" }
        });
        
        for (const badge of badges) {
          // Extract the number from criteria like "course:complete:5"
          const criteriaMatch = badge.criteria.match(/course:complete:(\d+)/);
          if (criteriaMatch) {
            const requiredCompletions = parseInt(criteriaMatch[1]);
            
            // Count user's completed courses
            const completedCoursesCount = await CourseProgress.countDocuments({
              user: userId,
              completed: true
            });
            
            // Award badge if criteria is met
            if (completedCoursesCount >= requiredCompletions) {
              await awardBadge(userId, badge._id);
            }
          }
        }
      } else if (!courseProgress.completed && !wasCompleted) {
        // Award points for progress (only if not already completed)
        await awardPoints(
          userId,
          15, // Points for video completion within a course
          "course_progress",
          `Made progress in course: ${course.title}`,
          {
            itemId: course._id,
            itemType: "Course"
          }
        );
      }
      
      // If this is the first progress in any course, check for first course badge
      if (isFirstProgress) {
        const firstCourseBadge = await mongoose.model("Badge").findOne({
          criteria: "course:enroll:1"
        });
        
        if (firstCourseBadge) {
          await awardBadge(userId, firstCourseBadge._id);
        }
      }
    }
    
    await courseProgress.save();
    return courseProgress;
  } catch (error) {
    console.error("Error updating course progress:", error);
    throw error;
  }
};

/**
 * Update course progress when a quiz is completed
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} quizId - Quiz ID
 * @param {number} score - Quiz score (percentage)
 * @returns {Promise<Object>} - Updated course progress
 */
export const updateCourseProgressForQuiz = async (userId, courseId, quizId, score) => {
  try {
    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    // Check if quiz belongs to this course
    const quizInCourse = course.quizzes && course.quizzes.some(quiz => quiz.toString() === quizId);
    if (!quizInCourse) {
      throw new Error(`Quiz with ID ${quizId} does not belong to course with ID ${courseId}`);
    }

    // Find or create course progress
    let courseProgress = await CourseProgress.findOne({ user: userId, course: courseId });
    
    if (!courseProgress) {
      courseProgress = new CourseProgress({
        user: userId,
        course: courseId,
        completedVideos: [],
        completedQuizzes: [],
        progress: 0,
        completed: false
      });
    }

    // Check if quiz is already marked as completed
    const quizAlreadyCompleted = courseProgress.completedQuizzes.some(
      quiz => quiz.toString() === quizId
    );

    // If quiz is not already completed, add it to completed quizzes
    if (!quizAlreadyCompleted) {
      courseProgress.completedQuizzes.push(quizId);
      courseProgress.lastActivity = new Date();
      
      // Calculate new progress percentage
      const totalItems = course.videos.length + (course.quizzes ? course.quizzes.length : 0);
      const completedItems = courseProgress.completedVideos.length + courseProgress.completedQuizzes.length;
      courseProgress.progress = Math.round((completedItems / totalItems) * 100);
      
      // Check if course is now completed (90% or more)
      const wasCompleted = courseProgress.completed;
      courseProgress.completed = courseProgress.progress >= 90;
      
      if (courseProgress.completed && !wasCompleted) {
        courseProgress.completedAt = new Date();
        
        // Award points for completing the course
        await awardPoints(
          userId,
          300, // Higher points for course completion
          "course_completion",
          `Completed course: ${course.title}`,
          {
            itemId: course._id,
            itemType: "Course"
          }
        );
        
        // Update challenge progress
        await updateChallengeProgress(userId, "course_completion", 1, {
          itemId: course._id,
          itemType: "Course"
        });
      }
      
      // Award points for quiz completion
      let pointsToAward = 50; // Base points for quiz completion
      let description = `Completed quiz in course: ${course.title}`;
      
      // Bonus points for high scores
      if (score >= 90) {
        pointsToAward += 50; // Bonus for excellent score
        description = `Aced quiz with ${score}% in course: ${course.title}`;
        
        // Check for quiz master badge (perfect score)
        if (score >= 100) {
          const quizMasterBadge = await mongoose.model("Badge").findOne({
            criteria: "quiz:perfect:1"
          });
          
          if (quizMasterBadge) {
            await awardBadge(userId, quizMasterBadge._id);
          }
        }
      } else if (score >= 75) {
        pointsToAward += 25; // Bonus for good score
        description = `Completed quiz with good score (${score}%) in course: ${course.title}`;
      }
      
      await awardPoints(
        userId,
        pointsToAward,
        "quiz",
        description,
        {
          itemId: course._id,
          itemType: "Course"
        }
      );
      
      // Update challenge progress
      await updateChallengeProgress(userId, "quiz", 1, {
        itemId: course._id,
        itemType: "Course"
      });
    }
    
    await courseProgress.save();
    return courseProgress;
  } catch (error) {
    console.error("Error updating course progress for quiz:", error);
    throw error;
  }
};

/**
 * Get course progress for a user
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} - Course progress
 */
export const getCourseProgress = async (userId, courseId) => {
  try {
    const courseProgress = await CourseProgress.findOne({ user: userId, course: courseId });
    
    if (!courseProgress) {
      return {
        progress: 0,
        completed: false,
        completedVideos: [],
        completedQuizzes: []
      };
    }
    
    return courseProgress;
  } catch (error) {
    console.error("Error getting course progress:", error);
    throw error;
  }
};

/**
 * Get all course progress for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of course progress objects
 */
export const getAllCourseProgress = async (userId) => {
  try {
    const courseProgress = await CourseProgress.find({ user: userId })
      .populate('course', 'title thumbnail')
      .sort({ lastActivity: -1 });
    
    return courseProgress;
  } catch (error) {
    console.error("Error getting all course progress:", error);
    throw error;
  }
};
