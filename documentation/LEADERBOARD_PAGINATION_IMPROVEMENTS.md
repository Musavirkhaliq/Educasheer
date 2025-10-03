# Leaderboard Pagination Improvements

## Overview
Enhanced the TestSeriesLeaderboard component with pagination (5 items per page), toggle for expanded view, and lazy loading functionality.

## Key Features Implemented

### 1. Pagination System
- **Default**: 5 items per page
- **Expanded**: 10 items per page
- Server-side pagination using existing backend API
- Page navigation with Previous/Next buttons
- Page number indicators (shows up to 5 page numbers)
- "Find Me" button to jump to user's position

### 2. Toggle Expanded View
- Compact view: 5 items per page
- Expanded view: 10 items per page
- Toggle button with expand/compress icons
- Automatic page reset when toggling views

### 3. Lazy Loading
- Data fetched on-demand per page
- Loading states during page transitions
- Efficient API calls with limit and page parameters
- No client-side data caching to ensure fresh data

### 4. Enhanced User Experience
- Loading indicators during pagination
- User position card when not visible on current page
- Responsive design for mobile and desktop
- Touch-friendly pagination controls
- Clear pagination information display

## Technical Implementation

### Constants
```javascript
const ITEMS_PER_PAGE = 5;
const EXPANDED_ITEMS_PER_PAGE = 10;
```

### State Management
- `currentPage`: Current page number
- `isExpanded`: Toggle state for expanded view
- `totalEntries`: Total number of leaderboard entries
- `hasNextPage`/`hasPrevPage`: Pagination flags
- `loadingMore`: Loading state for page transitions

### API Integration
- Uses existing backend pagination support
- Supports both authenticated and public endpoints
- Parameters: `limit` and `page`
- Returns pagination metadata

### Key Functions
- `handlePageChange(page)`: Navigate to specific page
- `handleNextPage()`/`handlePrevPage()`: Navigate between pages
- `handleToggleExpanded()`: Switch between compact/expanded views
- `fetchLeaderboard(showLoading, page)`: Fetch paginated data

## Backend Compatibility
The implementation leverages existing backend features:
- Pagination support in `getTestSeriesLeaderboard`
- Public endpoint for non-authenticated users
- Proper pagination metadata in API responses

## Benefits
1. **Performance**: Reduced data transfer and faster loading
2. **User Experience**: Better navigation and cleaner interface
3. **Scalability**: Handles large leaderboards efficiently
4. **Accessibility**: Touch-friendly controls and clear navigation
5. **Flexibility**: Expandable view for power users

## Usage
The component automatically handles pagination and provides intuitive controls:
- Use pagination buttons to navigate
- Click expand/compact to change items per page
- Use "Find Me" to locate your position
- All interactions include loading states

## Testing
Includes comprehensive test coverage for:
- Pagination functionality
- Expand/compact toggle
- Loading states
- API integration
- User interactions

This implementation provides a smooth, efficient, and user-friendly leaderboard experience with proper pagination and lazy loading capabilities.