import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";
import { Badge, Challenge } from "../models/gamification.model.js";
import { User } from "../models/user.model.js";
import { initializeUserGamification } from "../services/gamification.service.js";

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

// Initial badges data
const initialBadges = [
  {
    name: "Welcome",
    description: "Welcome to Educasheer! You've taken the first step on your learning journey.",
    icon: "https://cdn-icons-png.flaticon.com/512/6941/6941697.png",
    category: "special",
    level: 1,
    pointsAwarded: 50,
    criteria: "join:platform",
    isHidden: false
  },
  {
    name: "First Course",
    description: "You've enrolled in your first course. Keep going!",
    icon: "https://cdn-icons-png.flaticon.com/512/2436/2436874.png",
    category: "course",
    level: 1,
    pointsAwarded: 100,
    criteria: "course:enroll:1",
    isHidden: false
  },
  {
    name: "Video Watcher",
    description: "You've watched your first video. Knowledge is power!",
    icon: "https://cdn-icons-png.flaticon.com/512/1179/1179069.png",
    category: "video",
    level: 1,
    pointsAwarded: 50,
    criteria: "video:watch:1",
    isHidden: false
  },
  {
    name: "Perfect Attendance",
    description: "You've attended your first class. Showing up is half the battle!",
    icon: "https://cdn-icons-png.flaticon.com/512/3094/3094919.png",
    category: "attendance",
    level: 1,
    pointsAwarded: 75,
    criteria: "attendance:mark:1",
    isHidden: false
  },
  {
    name: "Social Butterfly",
    description: "You've made your first comment. Engaging with others enhances learning!",
    icon: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
    category: "social",
    level: 1,
    pointsAwarded: 25,
    criteria: "comment:post:1",
    isHidden: false
  },
  {
    name: "Blogger",
    description: "You've published your first blog post. Sharing knowledge is powerful!",
    icon: "https://cdn-icons-png.flaticon.com/512/3959/3959542.png",
    category: "blog",
    level: 1,
    pointsAwarded: 150,
    criteria: "blog:publish:1",
    isHidden: false
  },
  {
    name: "Course Completer",
    description: "You've completed your first course. Congratulations on your achievement!",
    icon: "https://cdn-icons-png.flaticon.com/512/2490/2490396.png",
    category: "course",
    level: 2,
    pointsAwarded: 200,
    criteria: "course:complete:1",
    isHidden: false
  },
  {
    name: "3-Day Streak",
    description: "You've maintained a 3-day learning streak. Consistency is key!",
    icon: "https://cdn-icons-png.flaticon.com/512/1021/1021026.png",
    category: "special",
    level: 1,
    pointsAwarded: 75,
    criteria: "streak:3",
    isHidden: false
  },
  {
    name: "7-Day Streak",
    description: "You've maintained a 7-day learning streak. You're building great habits!",
    icon: "https://cdn-icons-png.flaticon.com/512/1021/1021026.png",
    category: "special",
    level: 2,
    pointsAwarded: 150,
    criteria: "streak:7",
    isHidden: false
  },
  {
    name: "30-Day Streak",
    description: "You've maintained a 30-day learning streak. You're unstoppable!",
    icon: "https://cdn-icons-png.flaticon.com/512/1021/1021098.png",
    category: "special",
    level: 3,
    pointsAwarded: 500,
    criteria: "streak:30",
    isHidden: false
  },
  {
    name: "Level 5 Achiever",
    description: "You've reached Level 5! Your dedication to learning is impressive.",
    icon: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png",
    category: "special",
    level: 3,
    pointsAwarded: 250,
    criteria: "level:5",
    isHidden: false
  },
  {
    name: "Level 10 Master",
    description: "You've reached Level 10! You're becoming a master learner.",
    icon: "https://cdn-icons-png.flaticon.com/512/2583/2583319.png",
    category: "special",
    level: 4,
    pointsAwarded: 500,
    criteria: "level:10",
    isHidden: false
  },
  {
    name: "Level 25 Guru",
    description: "You've reached Level 25! Your commitment to education is extraordinary.",
    icon: "https://cdn-icons-png.flaticon.com/512/2583/2583434.png",
    category: "special",
    level: 5,
    pointsAwarded: 1000,
    criteria: "level:25",
    isHidden: false
  },
  {
    name: "Quiz Master",
    description: "You've aced your first quiz with a perfect score!",
    icon: "https://cdn-icons-png.flaticon.com/512/5288/5288985.png",
    category: "quiz",
    level: 2,
    pointsAwarded: 150,
    criteria: "quiz:perfect:1",
    isHidden: false
  },
  {
    name: "Feedback Provider",
    description: "You've submitted your first testimonial. Your feedback helps us improve!",
    icon: "https://cdn-icons-png.flaticon.com/512/2117/2117711.png",
    category: "social",
    level: 1,
    pointsAwarded: 100,
    criteria: "testimonial:submit:1",
    isHidden: false
  }
];

// Initial challenges data
const initialChallenges = [
  {
    title: "Watch 5 Videos This Week",
    description: "Watch 5 different videos before the end of the week to earn points and a special badge!",
    type: "weekly",
    criteria: {
      activityType: "video_watch",
      targetCount: 5,
      specificItems: []
    },
    reward: {
      points: 200,
      badge: null // Will be set after badges are created
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true
  },
  {
    title: "Comment on 3 Different Courses",
    description: "Engage with the community by commenting on 3 different courses this week.",
    type: "weekly",
    criteria: {
      activityType: "comment",
      targetCount: 3,
      specificItems: []
    },
    reward: {
      points: 150,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "Daily Login Streak",
    description: "Log in for 5 consecutive days to earn points and keep your streak going!",
    type: "daily",
    criteria: {
      activityType: "login",
      targetCount: 5,
      specificItems: []
    },
    reward: {
      points: 100,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true
  },
  {
    title: "Complete Your First Course",
    description: "Finish all videos in a course to earn this special achievement!",
    type: "special",
    criteria: {
      activityType: "course_completion",
      targetCount: 1,
      specificItems: []
    },
    reward: {
      points: 300,
      badge: null
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    isActive: true
  }
];

// Seed badges
const seedBadges = async () => {
  try {
    // Check if badges already exist
    const existingBadgesCount = await Badge.countDocuments();
    if (existingBadgesCount > 0) {
      console.log(`Badges already exist (${existingBadgesCount} found). Skipping badge seeding.`);
      return await Badge.find();
    }

    console.log("Seeding badges...");
    const badges = await Badge.insertMany(initialBadges);
    console.log(`${badges.length} badges seeded successfully!`);
    return badges;
  } catch (error) {
    console.error("Error seeding badges:", error);
    throw error;
  }
};

// Seed challenges
const seedChallenges = async (badges) => {
  try {
    // Check if challenges already exist
    const existingChallengesCount = await Challenge.countDocuments();
    if (existingChallengesCount > 0) {
      console.log(`Challenges already exist (${existingChallengesCount} found). Skipping challenge seeding.`);
      return;
    }

    console.log("Seeding challenges...");

    // Find badge IDs for challenges
    const welcomeBadge = badges.find(badge => badge.name === "Welcome");
    const streakBadge = badges.find(badge => badge.name === "3-Day Streak");
    const courseBadge = badges.find(badge => badge.name === "Course Completer");
    const socialBadge = badges.find(badge => badge.name === "Social Butterfly");

    // Assign badges to challenges
    initialChallenges[0].reward.badge = streakBadge?._id;
    initialChallenges[1].reward.badge = socialBadge?._id;
    initialChallenges[2].reward.badge = welcomeBadge?._id;
    initialChallenges[3].reward.badge = courseBadge?._id;

    const challenges = await Challenge.insertMany(initialChallenges);
    console.log(`${challenges.length} challenges seeded successfully!`);
  } catch (error) {
    console.error("Error seeding challenges:", error);
    throw error;
  }
};

// Initialize gamification for existing users
const initializeExistingUsers = async () => {
  try {
    const users = await User.find({}, '_id');
    console.log(`Found ${users.length} users to initialize gamification for...`);

    let initializedCount = 0;
    for (const user of users) {
      try {
        await initializeUserGamification(user._id);
        initializedCount++;
      } catch (error) {
        console.error(`Error initializing gamification for user ${user._id}:`, error);
      }
    }

    console.log(`Gamification initialized for ${initializedCount} users!`);
  } catch (error) {
    console.error("Error initializing gamification for existing users:", error);
    throw error;
  }
};

// Main function
const seedGamification = async () => {
  try {
    await connectDB();
    const badges = await seedBadges();
    await seedChallenges(badges);
    await initializeExistingUsers();
    console.log("Gamification seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding gamification:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedGamification();
