import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";
import { Badge, Challenge } from "../models/gamification.model.js";
import { User } from "../models/user.model.js";
import { UserChallenge } from "../models/gamification.model.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
    console.log(`MongoDB Connected, DB Host: ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.error("MongoDB Connection Failed", error);
    process.exit(1);
  }
};

// Additional badges data
const additionalBadges = [
  // Course-specific badges
  {
    name: "Course Explorer",
    description: "Enrolled in 5 different courses. Your thirst for knowledge is impressive!",
    icon: "https://cdn-icons-png.flaticon.com/512/2436/2436855.png",
    category: "course",
    level: 2,
    pointsAwarded: 200,
    criteria: "course:enroll:5",
    isHidden: false
  },
  {
    name: "Course Master",
    description: "Completed 5 courses. Your dedication to learning is remarkable!",
    icon: "https://cdn-icons-png.flaticon.com/512/2436/2436637.png",
    category: "course",
    level: 3,
    pointsAwarded: 500,
    criteria: "course:complete:5",
    isHidden: false
  },
  {
    name: "Course Champion",
    description: "Completed 10 courses. You're a true champion of education!",
    icon: "https://cdn-icons-png.flaticon.com/512/2436/2436823.png",
    category: "course",
    level: 4,
    pointsAwarded: 1000,
    criteria: "course:complete:10",
    isHidden: false
  },
  
  // Video-specific badges
  {
    name: "Video Enthusiast",
    description: "Watched 10 videos. You're building a solid foundation of knowledge!",
    icon: "https://cdn-icons-png.flaticon.com/512/1179/1179120.png",
    category: "video",
    level: 2,
    pointsAwarded: 150,
    criteria: "video:watch:10",
    isHidden: false
  },
  {
    name: "Video Addict",
    description: "Watched 50 videos. Your commitment to visual learning is impressive!",
    icon: "https://cdn-icons-png.flaticon.com/512/1179/1179069.png",
    category: "video",
    level: 3,
    pointsAwarded: 300,
    criteria: "video:watch:50",
    isHidden: false
  },
  {
    name: "Video Master",
    description: "Watched 100 videos. You've mastered the art of video learning!",
    icon: "https://cdn-icons-png.flaticon.com/512/1179/1179240.png",
    category: "video",
    level: 4,
    pointsAwarded: 500,
    criteria: "video:watch:100",
    isHidden: false
  },
  
  // Quiz-specific badges
  {
    name: "Quiz Whiz",
    description: "Completed 5 quizzes with a score of 80% or higher. Your knowledge is growing!",
    icon: "https://cdn-icons-png.flaticon.com/512/5288/5288957.png",
    category: "quiz",
    level: 2,
    pointsAwarded: 200,
    criteria: "quiz:score80:5",
    isHidden: false
  },
  {
    name: "Quiz Genius",
    description: "Completed 10 quizzes with a perfect score. Your knowledge is exceptional!",
    icon: "https://cdn-icons-png.flaticon.com/512/5288/5288985.png",
    category: "quiz",
    level: 4,
    pointsAwarded: 500,
    criteria: "quiz:perfect:10",
    isHidden: false
  },
  
  // Attendance-specific badges
  {
    name: "Regular Attendee",
    description: "Attended 5 classes. Your consistency is commendable!",
    icon: "https://cdn-icons-png.flaticon.com/512/3094/3094919.png",
    category: "attendance",
    level: 2,
    pointsAwarded: 150,
    criteria: "attendance:mark:5",
    isHidden: false
  },
  {
    name: "Attendance Champion",
    description: "Attended 20 classes. Your dedication to showing up is remarkable!",
    icon: "https://cdn-icons-png.flaticon.com/512/3094/3094996.png",
    category: "attendance",
    level: 3,
    pointsAwarded: 300,
    criteria: "attendance:mark:20",
    isHidden: false
  },
  
  // Blog-specific badges
  {
    name: "Prolific Blogger",
    description: "Published 5 blogs. Your contributions to the community are valuable!",
    icon: "https://cdn-icons-png.flaticon.com/512/3959/3959542.png",
    category: "blog",
    level: 3,
    pointsAwarded: 300,
    criteria: "blog:publish:5",
    isHidden: false
  },
  {
    name: "Blog Virtuoso",
    description: "Published 10 blogs. Your writing skills are exceptional!",
    icon: "https://cdn-icons-png.flaticon.com/512/3959/3959425.png",
    category: "blog",
    level: 4,
    pointsAwarded: 500,
    criteria: "blog:publish:10",
    isHidden: false
  },
  
  // Comment-specific badges
  {
    name: "Active Commenter",
    description: "Posted 10 comments. Your engagement with the community is appreciated!",
    icon: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
    category: "social",
    level: 2,
    pointsAwarded: 150,
    criteria: "comment:post:10",
    isHidden: false
  },
  {
    name: "Community Pillar",
    description: "Posted 50 comments. You're a vital part of our learning community!",
    icon: "https://cdn-icons-png.flaticon.com/512/1946/1946482.png",
    category: "social",
    level: 3,
    pointsAwarded: 300,
    criteria: "comment:post:50",
    isHidden: false
  },
  
  // Streak-specific badges
  {
    name: "100-Day Streak",
    description: "Maintained a 100-day learning streak. Your consistency is legendary!",
    icon: "https://cdn-icons-png.flaticon.com/512/1021/1021036.png",
    category: "special",
    level: 4,
    pointsAwarded: 1000,
    criteria: "streak:100",
    isHidden: false
  },
  {
    name: "365-Day Streak",
    description: "Maintained a 365-day learning streak. You're unstoppable!",
    icon: "https://cdn-icons-png.flaticon.com/512/1021/1021093.png",
    category: "special",
    level: 5,
    pointsAwarded: 5000,
    criteria: "streak:365",
    isHidden: false
  },
  
  // Special badges
  {
    name: "All-Rounder",
    description: "Earned at least one badge in each category. You're a well-rounded learner!",
    icon: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png",
    category: "special",
    level: 3,
    pointsAwarded: 500,
    criteria: "badge:categories:all",
    isHidden: false
  },
  {
    name: "Badge Collector",
    description: "Earned 10 different badges. Your achievements are impressive!",
    icon: "https://cdn-icons-png.flaticon.com/512/2583/2583319.png",
    category: "special",
    level: 3,
    pointsAwarded: 300,
    criteria: "badge:count:10",
    isHidden: false
  },
  {
    name: "Badge Master",
    description: "Earned 25 different badges. Your collection is extraordinary!",
    icon: "https://cdn-icons-png.flaticon.com/512/2583/2583434.png",
    category: "special",
    level: 4,
    pointsAwarded: 1000,
    criteria: "badge:count:25",
    isHidden: false
  }
];

// Additional challenges data
const additionalChallenges = [
  // Daily challenges
  {
    title: "Daily Login",
    description: "Log in to the platform today to maintain your streak and earn points!",
    type: "daily",
    criteria: {
      activityType: "login",
      targetCount: 1,
      specificItems: []
    },
    reward: {
      points: 20,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    isActive: true
  },
  {
    title: "Watch a Video Today",
    description: "Watch at least one educational video today to earn bonus points!",
    type: "daily",
    criteria: {
      activityType: "video_watch",
      targetCount: 1,
      specificItems: []
    },
    reward: {
      points: 30,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  
  // Weekly challenges
  {
    title: "Comment on 5 Different Videos",
    description: "Engage with the community by commenting on 5 different videos this week.",
    type: "weekly",
    criteria: {
      activityType: "comment",
      targetCount: 5,
      specificItems: []
    },
    reward: {
      points: 200,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "Perfect Quiz Score",
    description: "Complete a quiz with a perfect score this week to earn bonus points!",
    type: "weekly",
    criteria: {
      activityType: "quiz",
      targetCount: 1,
      specificItems: []
    },
    reward: {
      points: 250,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "7-Day Streak",
    description: "Maintain a 7-day activity streak this week to earn a special reward!",
    type: "weekly",
    criteria: {
      activityType: "login",
      targetCount: 7,
      specificItems: []
    },
    reward: {
      points: 300,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  
  // Monthly challenges
  {
    title: "Complete a Course",
    description: "Finish all videos and quizzes in a course this month to earn a major point bonus!",
    type: "monthly",
    criteria: {
      activityType: "course_completion",
      targetCount: 1,
      specificItems: []
    },
    reward: {
      points: 500,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "Publish a Blog",
    description: "Share your knowledge by publishing a blog post this month!",
    type: "monthly",
    criteria: {
      activityType: "blog",
      targetCount: 1,
      specificItems: []
    },
    reward: {
      points: 400,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "Watch 30 Videos",
    description: "Watch 30 educational videos this month to earn a massive point bonus!",
    type: "monthly",
    criteria: {
      activityType: "video_watch",
      targetCount: 30,
      specificItems: []
    },
    reward: {
      points: 600,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  
  // Special challenges
  {
    title: "Perfect Attendance",
    description: "Attend all scheduled classes for a course to earn a special reward!",
    type: "special",
    criteria: {
      activityType: "attendance",
      targetCount: 10,
      specificItems: []
    },
    reward: {
      points: 500,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "Community Champion",
    description: "Post 20 comments across different courses and videos to become a community champion!",
    type: "special",
    criteria: {
      activityType: "comment",
      targetCount: 20,
      specificItems: []
    },
    reward: {
      points: 400,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true
  }
];

// Seed additional badges
const seedAdditionalBadges = async () => {
  try {
    console.log("Seeding additional badges...");
    
    // Check for existing badges to avoid duplicates
    for (const badgeData of additionalBadges) {
      const existingBadge = await Badge.findOne({ name: badgeData.name });
      
      if (!existingBadge) {
        await Badge.create(badgeData);
        console.log(`Created badge: ${badgeData.name}`);
      } else {
        console.log(`Badge already exists: ${badgeData.name}`);
      }
    }
    
    console.log("Additional badges seeded successfully!");
    return await Badge.find();
  } catch (error) {
    console.error("Error seeding additional badges:", error);
    throw error;
  }
};

// Seed additional challenges
const seedAdditionalChallenges = async (badges) => {
  try {
    console.log("Seeding additional challenges...");
    
    // Find badge IDs for challenges
    const streakBadge = badges.find(badge => badge.name === "7-Day Streak");
    const quizBadge = badges.find(badge => badge.name === "Quiz Whiz");
    const courseBadge = badges.find(badge => badge.name === "Course Master");
    const blogBadge = badges.find(badge => badge.name === "Prolific Blogger");
    const videoBadge = badges.find(badge => badge.name === "Video Enthusiast");
    const commentBadge = badges.find(badge => badge.name === "Active Commenter");
    const attendanceBadge = badges.find(badge => badge.name === "Regular Attendee");
    
    // Assign badges to challenges where appropriate
    if (streakBadge) additionalChallenges[4].reward.badge = streakBadge._id;
    if (quizBadge) additionalChallenges[3].reward.badge = quizBadge._id;
    if (courseBadge) additionalChallenges[5].reward.badge = courseBadge._id;
    if (blogBadge) additionalChallenges[6].reward.badge = blogBadge._id;
    if (videoBadge) additionalChallenges[7].reward.badge = videoBadge._id;
    if (attendanceBadge) additionalChallenges[8].reward.badge = attendanceBadge._id;
    if (commentBadge) additionalChallenges[9].reward.badge = commentBadge._id;
    
    // Check for existing challenges to avoid duplicates
    for (const challengeData of additionalChallenges) {
      const existingChallenge = await Challenge.findOne({ 
        title: challengeData.title,
        type: challengeData.type
      });
      
      if (!existingChallenge) {
        const challenge = await Challenge.create(challengeData);
        console.log(`Created challenge: ${challengeData.title}`);
        
        // Assign challenge to all users
        if (challenge.isActive) {
          const users = await User.find({}, '_id');
          
          const userChallenges = users.map(user => ({
            user: user._id,
            challenge: challenge._id,
            progress: 0,
            isCompleted: false
          }));
          
          await UserChallenge.insertMany(userChallenges);
          console.log(`Assigned challenge to ${users.length} users`);
        }
      } else {
        console.log(`Challenge already exists: ${challengeData.title}`);
      }
    }
    
    console.log("Additional challenges seeded successfully!");
  } catch (error) {
    console.error("Error seeding additional challenges:", error);
    throw error;
  }
};

// Main function
const seedAdditionalGamification = async () => {
  try {
    await connectDB();
    const badges = await seedAdditionalBadges();
    await seedAdditionalChallenges(badges);
    console.log("Additional gamification seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding additional gamification:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedAdditionalGamification();
