// Basic test file for seat booking functionality
// This is a simple test to verify the models and basic functionality

import mongoose from 'mongoose';
import { Seat, TimeSlot, SeatBooking } from '../models/seat.model.js';
import { Center } from '../models/center.model.js';
import { User } from '../models/user.model.js';
import { SeatBookingValidationService } from '../services/seatBookingValidation.service.js';

// Test data
const testData = {
    center: {
        name: "Test Center",
        location: "Test Location",
        description: "Test Description",
        image: "https://example.com/image.jpg",
        capacity: 50,
        contactEmail: "test@example.com",
        contactPhone: "1234567890"
    },
    user: {
        username: "testuser",
        email: "testuser@example.com",
        fullName: "Test User",
        avatar: "https://example.com/avatar.jpg",
        password: "testpassword123"
    },
    timeSlot: {
        name: "Morning Session",
        startTime: "09:00",
        endTime: "17:00",
        daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        maxBookingDuration: 240,
        price: 50
    },
    seat: {
        row: "A",
        column: 1,
        seatType: "regular"
    }
};

// Test functions
export const runSeatBookingTests = async () => {
    console.log("🧪 Running Seat Booking Tests...");
    
    try {
        // Test 1: Create test data
        console.log("📝 Test 1: Creating test data...");
        const testResults = await createTestData();
        console.log("✅ Test data created successfully");

        // Test 2: Test seat booking validation
        console.log("📝 Test 2: Testing booking validation...");
        await testBookingValidation(testResults);
        console.log("✅ Booking validation tests passed");

        // Test 3: Test booking creation
        console.log("📝 Test 3: Testing booking creation...");
        await testBookingCreation(testResults);
        console.log("✅ Booking creation tests passed");

        // Test 4: Test booking conflicts
        console.log("📝 Test 4: Testing booking conflicts...");
        await testBookingConflicts(testResults);
        console.log("✅ Booking conflict tests passed");

        // Cleanup
        console.log("🧹 Cleaning up test data...");
        await cleanupTestData(testResults);
        console.log("✅ Test data cleaned up");

        console.log("🎉 All seat booking tests passed!");
        return true;

    } catch (error) {
        console.error("❌ Seat booking tests failed:", error);
        return false;
    }
};

// Create test data
const createTestData = async () => {
    // Create test user
    const user = await User.create({
        ...testData.user,
        role: "learner"
    });

    // Create test center
    const center = await Center.create({
        ...testData.center,
        creator: user._id
    });

    // Create test time slot
    const timeSlot = await TimeSlot.create({
        ...testData.timeSlot,
        center: center._id
    });

    // Create test seat
    const seat = await Seat.create({
        ...testData.seat,
        center: center._id
    });

    return { user, center, timeSlot, seat };
};

// Test booking validation
const testBookingValidation = async ({ user, center, timeSlot, seat }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const validBookingData = {
        seatId: seat._id,
        timeSlotId: timeSlot._id,
        bookingDate: tomorrow.toISOString().split('T')[0],
        startTime: "10:00",
        endTime: "12:00",
        userId: user._id
    };

    // Test valid booking
    const validationResult = await SeatBookingValidationService.validateBookingRequest(validBookingData);
    if (!validationResult.isValid) {
        throw new Error("Valid booking data should pass validation");
    }

    // Test invalid booking (past date)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const invalidBookingData = {
        ...validBookingData,
        bookingDate: yesterday.toISOString().split('T')[0]
    };

    try {
        await SeatBookingValidationService.validateBookingRequest(invalidBookingData);
        throw new Error("Past date booking should fail validation");
    } catch (error) {
        if (!error.message.includes("Cannot book seats for past dates")) {
            throw error;
        }
    }

    // Test invalid time range
    const invalidTimeData = {
        ...validBookingData,
        startTime: "12:00",
        endTime: "10:00" // End before start
    };

    try {
        await SeatBookingValidationService.validateBookingRequest(invalidTimeData);
        throw new Error("Invalid time range should fail validation");
    } catch (error) {
        if (!error.message.includes("End time must be after start time")) {
            throw error;
        }
    }
};

// Test booking creation
const testBookingCreation = async ({ user, center, timeSlot, seat }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const booking = await SeatBooking.create({
        seat: seat._id,
        user: user._id,
        timeSlot: timeSlot._id,
        bookingDate: tomorrow,
        startTime: "10:00",
        endTime: "12:00",
        duration: 120,
        bookingNotes: "Test booking"
    });

    if (!booking) {
        throw new Error("Booking creation failed");
    }

    if (booking.status !== "confirmed") {
        throw new Error("Booking should have confirmed status by default");
    }

    if (booking.duration !== 120) {
        throw new Error("Booking duration should be calculated correctly");
    }

    return booking;
};

// Test booking conflicts
const testBookingConflicts = async ({ user, center, timeSlot, seat }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2); // Use day after tomorrow to avoid conflicts with previous test
    
    // Create first booking
    const firstBooking = await SeatBooking.create({
        seat: seat._id,
        user: user._id,
        timeSlot: timeSlot._id,
        bookingDate: tomorrow,
        startTime: "14:00",
        endTime: "16:00",
        duration: 120
    });

    // Try to create conflicting booking
    const conflictingBookingData = {
        seatId: seat._id,
        timeSlotId: timeSlot._id,
        bookingDate: tomorrow.toISOString().split('T')[0],
        startTime: "15:00", // Overlaps with first booking
        endTime: "17:00",
        userId: user._id
    };

    try {
        await SeatBookingValidationService.validateBookingRequest(conflictingBookingData);
        throw new Error("Conflicting booking should fail validation");
    } catch (error) {
        if (!error.message.includes("already booked")) {
            throw error;
        }
    }
};

// Cleanup test data
const cleanupTestData = async ({ user, center, timeSlot, seat }) => {
    // Delete in reverse order of creation to avoid foreign key issues
    await SeatBooking.deleteMany({ user: user._id });
    await Seat.deleteMany({ center: center._id });
    await TimeSlot.deleteMany({ center: center._id });
    await Center.deleteOne({ _id: center._id });
    await User.deleteOne({ _id: user._id });
};

// Export for use in other test files
export {
    testData,
    createTestData,
    testBookingValidation,
    testBookingCreation,
    testBookingConflicts,
    cleanupTestData
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    // Connect to test database
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educasheer_test';
    
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log("Connected to test database");
            return runSeatBookingTests();
        })
        .then((success) => {
            console.log(success ? "All tests passed!" : "Some tests failed!");
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error("Test execution failed:", error);
            process.exit(1);
        });
}
