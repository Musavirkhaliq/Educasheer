import BookingStatusService from "./bookingStatusService.js";
import { getCurrentISTTimeString } from "../utils/timezone.js";

/**
 * Scheduled tasks service for handling periodic operations
 */
class ScheduledTasksService {
    constructor() {
        this.intervals = new Map();
        this.isRunning = false;
    }

    /**
     * Start all scheduled tasks
     */
    start() {
        if (this.isRunning) {
            console.log('Scheduled tasks are already running');
            return;
        }

        console.log('Starting scheduled tasks...');
        this.isRunning = true;

        // Update expired bookings every 5 minutes
        this.scheduleTask('updateExpiredBookings', () => {
            this.updateExpiredBookingsTask();
        }, 5 * 60 * 1000); // 5 minutes

        // Log system status every hour
        this.scheduleTask('systemStatus', () => {
            this.logSystemStatus();
        }, 60 * 60 * 1000); // 1 hour

        console.log('Scheduled tasks started successfully');
    }

    /**
     * Stop all scheduled tasks
     */
    stop() {
        if (!this.isRunning) {
            console.log('Scheduled tasks are not running');
            return;
        }

        console.log('Stopping scheduled tasks...');
        
        for (const [taskName, intervalId] of this.intervals) {
            clearInterval(intervalId);
            console.log(`Stopped task: ${taskName}`);
        }
        
        this.intervals.clear();
        this.isRunning = false;
        console.log('All scheduled tasks stopped');
    }

    /**
     * Schedule a task to run at regular intervals
     * @param {string} taskName - Name of the task
     * @param {Function} taskFunction - Function to execute
     * @param {number} intervalMs - Interval in milliseconds
     */
    scheduleTask(taskName, taskFunction, intervalMs) {
        if (this.intervals.has(taskName)) {
            console.log(`Task ${taskName} is already scheduled`);
            return;
        }

        const intervalId = setInterval(async () => {
            try {
                await taskFunction();
            } catch (error) {
                console.error(`Error in scheduled task ${taskName}:`, error);
            }
        }, intervalMs);

        this.intervals.set(taskName, intervalId);
        console.log(`Scheduled task ${taskName} to run every ${intervalMs / 1000} seconds`);

        // Run the task immediately
        setTimeout(async () => {
            try {
                await taskFunction();
            } catch (error) {
                console.error(`Error in initial run of task ${taskName}:`, error);
            }
        }, 1000); // Run after 1 second to allow system to initialize
    }

    /**
     * Task to update expired bookings
     */
    async updateExpiredBookingsTask() {
        try {
            const updatedCount = await BookingStatusService.autoCompleteEndedBookings();
            if (updatedCount > 0) {
                console.log(`[${getCurrentISTTimeString()} IST] Auto-completed ${updatedCount} expired bookings`);
            }
        } catch (error) {
            console.error('Error in updateExpiredBookingsTask:', error);
        }
    }

    /**
     * Task to log system status
     */
    async logSystemStatus() {
        try {
            const currentTime = getCurrentISTTimeString();
            console.log(`[${currentTime} IST] System status check - Scheduled tasks running: ${this.isRunning}`);
            console.log(`[${currentTime} IST] Active scheduled tasks: ${Array.from(this.intervals.keys()).join(', ')}`);
        } catch (error) {
            console.error('Error in logSystemStatus:', error);
        }
    }

    /**
     * Get status of all scheduled tasks
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            activeTasks: Array.from(this.intervals.keys()),
            taskCount: this.intervals.size,
            currentTime: getCurrentISTTimeString()
        };
    }

    /**
     * Manually trigger a specific task
     * @param {string} taskName - Name of the task to trigger
     */
    async triggerTask(taskName) {
        try {
            switch (taskName) {
                case 'updateExpiredBookings':
                    await this.updateExpiredBookingsTask();
                    break;
                case 'systemStatus':
                    await this.logSystemStatus();
                    break;
                default:
                    throw new Error(`Unknown task: ${taskName}`);
            }
            console.log(`Manually triggered task: ${taskName}`);
        } catch (error) {
            console.error(`Error triggering task ${taskName}:`, error);
            throw error;
        }
    }
}

// Create a singleton instance
const scheduledTasksService = new ScheduledTasksService();

export default scheduledTasksService;
