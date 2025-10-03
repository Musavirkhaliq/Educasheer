# Quiz Leaderboard with Pagination

## Overview
Created a new QuizLeaderboard component with pagination (5 items per page), toggle for expanded view, and lazy loading functionality, similar to the TestSeriesLeaderboard component.

## Key Features Implemented

### 1. Pagination System
- **Default**: 5 items per page
- **Expanded**: 10 items per page
- Client-side pagination (works with existing backend)
- Page navigation with Previous/Next buttons
- Page number indicators (shows up to 5 page numbers)
- "Find Me" button to jump to user's position (when backend supports it)

### 2. Toggle Expanded View
- Compact view: 5 items per page
- Expanded view: 10 items per page
- Toggle button with expand/compress icons
- Automatic page reset when toggling views

### 3. Backward Compatibility
- **Supports both old and new API formats**:
  - Old format: Array of leaderboard entries
  - New format: Object with leaderboard, pagination, and userPosition
- Graceful fallback when pagination data is not available
- Works with existing backend without modifications

### 4. Enhanced User Experience
- Loading indicators during page transitions
- User position card when not visible on current page (if supported by backend)
- Responsive design for mobile and desktop
- Touch-friendly pagination controls
- Clear pagination information display

## Technical Implementation

### Component Structure
```javascript
// Constants
const ITEMS_PER_PAGE = 5;
const EXPANDED_ITEMS_PER_PAGE = 10;

// State Management
- currentPage: Current page number
- isExpanded: Toggle state for expanded view
- totalEntries: Total number of leaderboard entries
- hasNextPage/hasPrevPage: Pagination flags
- loadingMore: Loading state for page transitions
```

### API Integration
- Uses existing quizAPI methods with optional pagination parameters
- Enhanced `getQuizLeaderboard` and `getPublicQuizLeaderboard` to accept params
- Backward compatible with existing API responses

### Key Functions
- `handlePageChange(page)`: Navigate to specific page
- `handleNextPage()`/`handlePrevPage()`: Navigate between pages
- `handleToggleExpanded()`: Switch between compact/expanded views
- `fetchLeaderboard(showLoading, page)`: Fetch paginated data

## Files Created/Modified

### New Files
1. **`client/src/components/QuizLeaderboard.jsx`** - Main component
2. **`client/src/components/QuizLeaderboard.test.jsx`** - Test suite

### Modified Files
1. **`client/src/services/quizAPI.js`** - Added pagination parameter support
2. **`client/src/components/QuizDetails.jsx`** - Integrated new QuizLeaderboard component

## Usage

### Basic Usage
```jsx
import QuizLeaderboard from './QuizLeaderboard';

<QuizLeaderboard 
  quizId="quiz-id-here"
  className="mb-8"
  onDataLoad={(data) => {
    console.log('Participants:', data.participantCount);
    console.log('User Rank:', data.userRank);
  }}
/>
```

### Props
- `quizId` (required): The quiz ID to fetch leaderboard for
- `className` (optional): Additional CSS classes
- `onDataLoad` (optional): Callback when data is loaded

## Backend Compatibility

### Current Backend Support
- ✅ Basic leaderboard data (array format)
- ✅ Public and authenticated endpoints
- ⚠️ Pagination support (would need backend updates for full functionality)

### Future Backend Enhancements
To fully utilize all features, the backend could be enhanced to support:
```javascript
// Enhanced API response format
{
  leaderboard: [...],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalEntries: 50,
    hasNext: true,
    hasPrev: false
  },
  userPosition: {
    rank: 15,
    bestPercentage: 85.5,
    totalAttempts: 3
  }
}
```

## Testing
Comprehensive test coverage includes:
- ✅ Pagination functionality
- ✅ Expand/compact toggle
- ✅ Loading states
- ✅ API integration (both old and new formats)
- ✅ User interactions
- ✅ Error handling
- ✅ Empty state handling

## Benefits

1. **Performance**: Client-side pagination reduces initial load time
2. **User Experience**: Better navigation and cleaner interface
3. **Scalability**: Handles large leaderboards efficiently
4. **Backward Compatibility**: Works with existing backend
5. **Future-Ready**: Prepared for enhanced backend pagination
6. **Consistency**: Matches TestSeriesLeaderboard functionality

## Migration Path

### Phase 1 (Current) ✅
- Client-side pagination with existing API
- Backward compatibility maintained
- Enhanced UI/UX features

### Phase 2 (Future)
- Backend pagination support
- Enhanced user position tracking
- Real-time leaderboard updates

This implementation provides immediate value while maintaining compatibility and preparing for future enhancements.