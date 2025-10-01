# Seat Booking Feature Documentation

## Overview

The Seat Booking feature allows users to book seats at offline centers for study or work sessions. This feature includes comprehensive seat management, time slot configuration, booking validation, and administrative controls.

## Features

### For Users
- **Browse Centers**: View available centers with seat booking capabilities
- **Select Time Slots**: Choose from configured time slots for each center
- **Visual Seat Selection**: Interactive seat layout with availability status
- **Book Seats**: Reserve seats for specific dates and times
- **Manage Bookings**: View, modify, and cancel existing bookings
- **Booking Notifications**: Receive confirmation and reminder emails

### For Administrators
- **Seat Management**: Create and configure seat layouts for centers
- **Time Slot Configuration**: Set up available time slots with pricing
- **Booking Oversight**: View and manage all bookings across centers
- **Check-in/Check-out**: Track user attendance and seat usage
- **Analytics**: Monitor booking patterns and center utilization

## Database Models

### Seat Model
```javascript
{
  seatNumber: String,      // e.g., "A1", "B2"
  center: ObjectId,        // Reference to Center
  row: String,             // e.g., "A", "B", "C"
  column: Number,          // e.g., 1, 2, 3
  seatType: String,        // "regular", "premium", "vip"
  isActive: Boolean,       // Seat availability status
  facilities: [String],    // e.g., ["power_outlet", "wifi"]
  notes: String           // Additional information
}
```

### TimeSlot Model
```javascript
{
  center: ObjectId,           // Reference to Center
  name: String,               // e.g., "Morning Session"
  startTime: String,          // e.g., "09:00"
  endTime: String,            // e.g., "17:00"
  daysOfWeek: [String],       // ["monday", "tuesday", ...]
  maxBookingDuration: Number, // Maximum booking duration in minutes
  isActive: Boolean,          // Time slot availability
  price: Number              // Price per hour (₹)
}
```

### SeatBooking Model
```javascript
{
  seat: ObjectId,           // Reference to Seat
  user: ObjectId,           // Reference to User
  timeSlot: ObjectId,       // Reference to TimeSlot
  bookingDate: Date,        // Date of booking
  startTime: String,        // Start time (e.g., "10:00")
  endTime: String,          // End time (e.g., "12:00")
  duration: Number,         // Duration in minutes
  status: String,           // "confirmed", "cancelled", "completed", "no_show"
  totalAmount: Number,      // Total cost
  paymentStatus: String,    // "pending", "paid", "refunded"
  bookingNotes: String,     // User notes
  checkedIn: Boolean,       // Check-in status
  checkedInAt: Date,        // Check-in timestamp
  checkedOut: Boolean,      // Check-out status
  checkedOutAt: Date,       // Check-out timestamp
  cancelledAt: Date,        // Cancellation timestamp
  cancellationReason: String // Reason for cancellation
}
```

## API Endpoints

### Seat Management
- `POST /api/v1/seats/centers/:centerId/seats` - Create seats (Admin)
- `GET /api/v1/seats/centers/:centerId/seats` - Get center seats
- `POST /api/v1/seats/centers/:centerId/time-slots` - Create time slot (Admin)
- `GET /api/v1/seats/centers/:centerId/time-slots` - Get center time slots
- `GET /api/v1/seats/centers/:centerId/time-slots/:timeSlotId/available-seats` - Get available seats

### Booking Management
- `POST /api/v1/seats/bookings` - Create booking
- `GET /api/v1/seats/bookings` - Get user bookings
- `GET /api/v1/seats/bookings/:bookingId` - Get booking details
- `PATCH /api/v1/seats/bookings/:bookingId` - Cancel booking
- `GET /api/v1/seats/centers/:centerId/bookings` - Get center bookings (Admin)
- `PATCH /api/v1/seats/bookings/:bookingId/check-in` - Check-in user (Admin)
- `PATCH /api/v1/seats/bookings/:bookingId/check-out` - Check-out user (Admin)

## Frontend Components

### User Components
- `SeatLayout.jsx` - Interactive seat selection interface
- `SeatBookingForm.jsx` - Booking form with validation
- `UserBookings.jsx` - User booking management
- `SeatBookingPage.jsx` - Main booking page
- `MyBookingsPage.jsx` - User bookings page

### Admin Components
- `SeatManagement.jsx` - Comprehensive admin interface
- `SeatManagementPage.jsx` - Admin page wrapper

## Business Rules & Validation

### Booking Validation
1. **Date Validation**: Cannot book seats for past dates
2. **Advance Booking**: Maximum 30 days in advance
3. **Time Validation**: End time must be after start time
4. **Duration Limits**: Cannot exceed time slot's maximum duration
5. **Time Slot Compliance**: Booking must be within time slot hours
6. **Day Validation**: Time slot must be available on selected day
7. **Conflict Prevention**: No overlapping bookings for same seat
8. **User Limits**: Maximum 3 bookings per day, 10 active bookings total

### Cancellation Rules
1. **Ownership**: Users can only cancel their own bookings (except admins)
2. **Status Check**: Cannot cancel already cancelled or completed bookings
3. **Time Limit**: Cannot cancel less than 30 minutes before start time
4. **Grace Period**: Admins can cancel anytime

### Check-in/Check-out Rules
1. **Admin Only**: Only administrators can perform check-in/check-out
2. **Time Window**: Check-in allowed within 15 minutes of start time
3. **Sequential Process**: Must check-in before check-out
4. **Status Updates**: Completed bookings marked automatically on check-out

## Services

### SeatBookingValidationService
Handles all booking validation logic including:
- Booking request validation
- Conflict detection
- User limit enforcement
- Cancellation validation
- Check-in/check-out validation

### SeatBookingNotificationService
Manages notifications for:
- Booking confirmations
- Cancellation notifications
- Booking reminders
- Email templates

## Usage Examples

### Creating Seats (Admin)
```javascript
const seats = [
  { row: "A", column: 1, seatType: "regular" },
  { row: "A", column: 2, seatType: "regular" },
  { row: "B", column: 1, seatType: "premium" }
];

await seatAPI.createSeats(centerId, seats);
```

### Creating Time Slot (Admin)
```javascript
const timeSlot = {
  name: "Morning Session",
  startTime: "09:00",
  endTime: "13:00",
  daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  maxBookingDuration: 240,
  price: 50
};

await seatAPI.createTimeSlot(centerId, timeSlot);
```

### Booking a Seat
```javascript
const booking = {
  seatId: "seat_id_here",
  timeSlotId: "timeslot_id_here",
  bookingDate: "2024-01-15",
  startTime: "10:00",
  endTime: "12:00",
  bookingNotes: "Need power outlet"
};

await seatAPI.createBooking(booking);
```

## Navigation

The feature adds the following navigation items:
- **Book Seat** (`/seat-booking`) - Main booking interface
- **My Bookings** (`/my-bookings`) - User booking management
- **Seat Bookings** (Admin) - Administrative booking management

## Testing

Run the seat booking tests:
```bash
cd backend
node src/tests/seatBooking.test.js
```

The test suite covers:
- Model creation and validation
- Booking validation logic
- Conflict detection
- Business rule enforcement

## Future Enhancements

1. **Payment Integration**: Add payment processing for paid bookings
2. **QR Code Check-in**: Allow users to check-in using QR codes
3. **Recurring Bookings**: Support for weekly/monthly recurring bookings
4. **Waitlist System**: Queue system for fully booked time slots
5. **Mobile App**: Dedicated mobile application
6. **Analytics Dashboard**: Detailed usage analytics and reporting
7. **Integration with Calendar**: Sync with Google Calendar/Outlook
8. **SMS Notifications**: Add SMS alerts in addition to email

## Configuration

### Environment Variables
- `MONGODB_URI` - Database connection string
- `ACCESS_TOKEN_SECRET` - JWT secret for authentication
- `EMAIL_SERVICE_*` - Email service configuration (when implemented)

### Default Settings
- Maximum advance booking: 30 days
- Maximum bookings per day: 3
- Maximum active bookings: 10
- Check-in window: ±15 minutes
- Cancellation grace period: 30 minutes

## Support

For issues or questions regarding the seat booking feature:
1. Check the validation error messages for specific requirements
2. Ensure proper authentication and authorization
3. Verify center and time slot configuration
4. Review booking limits and restrictions
5. Contact system administrators for advanced troubleshooting
