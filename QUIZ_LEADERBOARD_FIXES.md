# Quiz Leaderboard Pagination Fixes

## Issues Fixed

### 1. **Items Per Page**: Changed from 10 to 5
- **Backend**: Updated default `limit` from 50 to 5 in `getQuizLeaderboard`
- **Frontend**: Already correctly set to 5 items per page in `ITEMS_PER_PAGE` constant

### 2. **Show All Attempts**: Removed 10-item hard limit
- **Before**: Hard-coded `{ $limit: 10 }` in aggregation pipeline
- **After**: Dynamic pagination with `{ $skip: skip, $limit: limit }`
- **Result**: Now shows ALL quiz attempts with proper pagination

### 3. **Proper Pagination Support**
- Added total count calculation for accurate pagination
- Added pagination metadata in API response
- Implemented proper skip/limit logic for server-side pagination

## Backend Changes Made

### File: `backend/src/controllers/quizAttempt.controller.js`

```javascript
// Changed default limit from 50 to 5
const { limit = 5, page = 1 } = req.query; // Default to 5 items per page

// Removed hard limit of 10, added proper pagination
{ $skip: (parseInt(page) - 1) * parseInt(limit) },
{ $limit: parseInt(limit) }

// Added total count calculation
const totalCountPipeline = [
    {
        $match: {
            quiz: new mongoose.Types.ObjectId(quizId),
            isCompleted: true
        }
    },
    {
        $group: {
            _id: "$user"
        }
    },
    { $count: "total" }
];

// Enhanced response with pagination metadata
return res.status(200).json(
    new ApiResponse(200, {
        leaderboard: rankedLeaderboard,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalEntries / parseInt(limit)),
            totalEntries,
            hasNext: parseInt(page) * parseInt(limit) < totalEntries,
            hasPrev: parseInt(page) > 1
        }
    }, "Quiz leaderboard fetched successfully")
);
```

## Frontend Compatibility

### File: `client/src/components/QuizLeaderboard.jsx`

The frontend component already supports both response formats:
- **Old format**: Array of leaderboard entries (backward compatible)
- **New format**: Object with leaderboard and pagination data

```javascript
// Handles both old and new API response formats
if (Array.isArray(response.data.data)) {
    // Old format - just an array
    leaderboardData = response.data.data;
} else {
    // New format - object with pagination
    leaderboardData = response.data.data.leaderboard || response.data.data || [];
    pagination = response.data.data.pagination || {};
}
```

## Results

### ✅ **Before vs After**

| Aspect | Before | After |
|--------|--------|-------|
| Items per page | 10 (hardcoded) | 5 (configurable) |
| Total items shown | Max 10 | All attempts |
| Pagination | None | Full server-side pagination |
| API response | Array only | Object with pagination metadata |
| User experience | Limited view | Complete leaderboard navigation |

### ✅ **Key Benefits**

1. **Correct Page Size**: Now shows 5 items per page as requested
2. **Complete Data**: Shows ALL quiz attempts, not just top 10
3. **Proper Pagination**: Server-side pagination with accurate page counts
4. **Better UX**: Users can navigate through all participants
5. **Backward Compatible**: Still works with old API format if needed

### ✅ **Testing Scenarios**

- ✅ Quiz with 0 attempts: Shows empty state
- ✅ Quiz with 1-5 attempts: Shows all on one page, no pagination
- ✅ Quiz with 6+ attempts: Shows pagination controls
- ✅ Navigation: Previous/Next buttons work correctly
- ✅ Page numbers: Accurate page indicators
- ✅ Expand toggle: Switches between 5 and 10 items per page

The quiz leaderboard now properly displays 5 items per page and shows all attempts with full pagination support, matching the behavior requested.