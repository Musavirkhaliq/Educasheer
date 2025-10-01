# Testing the Test Series Sections Feature

## Quick Setup Guide

### 1. Backend Setup
The backend changes are already implemented. Make sure your backend server is running:

```bash
cd backend
npm run dev
```

### 2. Frontend Setup
The frontend components are ready. Make sure your frontend is running:

```bash
cd client
npm run dev
```

### 3. Access the Feature

#### Option 1: Through Admin Dashboard (Debug Mode)
1. Login as an admin user
2. Go to Admin Dashboard
3. Click on the "Debug Sections" tab
4. Select a test series from the dropdown
5. Click "Test Add Section" to add a test section
6. Click "Test Get Test Series" to verify the section was added
7. Check browser console for detailed API responses

#### Option 2: Through Test Series Edit Page
1. Login as an admin user
2. Go to Admin Dashboard → Test Series tab
3. Click the "Edit" button (pencil icon) on any test series
4. You should see two tabs: "Details" and "Sections"
5. Click on the "Sections" tab to access section management

### 4. Testing Section Management

#### Prerequisites
Before testing sections, ensure you have:
1. A test series created
2. Quizzes that belong to that test series (important!)

#### Creating Quizzes for Test Series
1. Go to Admin Dashboard → Quizzes & Exams
2. Click "Create Quiz"
3. **Important**: In the quiz form, select the test series from the "Test Series" dropdown
4. Create at least 2-3 quizzes for testing

#### Adding Sections
1. In the Sections tab, click "Add Section"
2. Enter a section title (e.g., "Chapter 1: Introduction")
3. Optionally add a description
4. Click "Save Section"

#### Organizing Quizzes
1. Expand a section by clicking on it
2. If you have quizzes assigned to this test series, they'll appear in the "Add Quiz to Section" area
3. Click the "+" button next to a quiz to add it to the section
4. The quiz will move from the unorganized list to the section

#### Troubleshooting Quiz Organization
If you don't see any quizzes to add to sections:
1. Check that quizzes are properly assigned to the test series
2. Go to Quiz Management and verify the "Test Series" field is set
3. Use the Debug Sections tab to test API calls directly

#### Managing Sections
- **Edit**: Click the edit icon next to a section title to rename it
- **Delete**: Click the trash icon to delete a section (quizzes move back to main list)
- **Reorder**: Use the grip handle to drag and reorder sections

### 5. Viewing Sections (Student View)

#### Test the Student Experience
1. Logout from admin account
2. Login as a regular user (or create a new account)
3. Navigate to the test series you just organized
4. You should see the sections displayed as collapsible cards
5. Each section shows:
   - Section title and description
   - Number of tests and total duration
   - Individual tests within the section
   - Progress indicators for completed tests

### 6. API Testing

#### Direct API Testing
You can test the API endpoints directly using tools like Postman or curl:

```bash
# Add a section
POST /api/v1/test-series/{testSeriesId}/sections
{
  "title": "Chapter 1: Basics",
  "description": "Introduction to the subject",
  "order": 0
}

# Get test series with sections
GET /api/v1/test-series/{testSeriesId}

# Add quiz to section
POST /api/v1/test-series/{testSeriesId}/sections/{sectionId}/quizzes/{quizId}
```

### 7. Troubleshooting

#### Common Issues

**"Add Section" button not visible:**
- Make sure you're logged in as an admin
- Check that you're on the correct edit page with the Sections tab
- Verify the test series exists and you have edit permissions

**API errors:**
- Check browser console for detailed error messages
- Verify backend server is running
- Check network tab for failed API calls
- Ensure you have proper authentication tokens

**Sections not displaying:**
- Clear browser cache and reload
- Check if the test series has sections in the database
- Verify the API is returning section data

#### Debug Steps

1. **Check Browser Console**: Look for JavaScript errors or API failures
2. **Check Network Tab**: Verify API calls are being made and responses received
3. **Check Backend Logs**: Look for server-side errors
4. **Verify Database**: Check if sections are being saved in MongoDB

### 8. Database Verification

You can check the database directly to see if sections are being saved:

```javascript
// In MongoDB shell or Compass
db.testseries.findOne({_id: ObjectId("your-test-series-id")})
```

Look for the `sections` array in the document.

### 9. Feature Validation Checklist

- [ ] Can create new sections
- [ ] Can edit section titles and descriptions
- [ ] Can delete sections
- [ ] Can add quizzes to sections
- [ ] Can remove quizzes from sections
- [ ] Can reorder sections
- [ ] Sections display correctly in student view
- [ ] Progress tracking works within sections
- [ ] Backward compatibility maintained (old test series still work)
- [ ] API endpoints respond correctly
- [ ] Database updates properly

### 10. Next Steps

Once basic functionality is confirmed:

1. **Test with Real Data**: Create meaningful sections with actual quiz content
2. **User Testing**: Have actual users test the navigation and organization
3. **Performance Testing**: Test with large numbers of sections and quizzes
4. **Mobile Testing**: Verify the interface works well on mobile devices
5. **Edge Cases**: Test empty sections, single quiz sections, etc.

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Review the API responses in the network tab
3. Verify backend server logs
4. Ensure proper authentication and permissions
5. Check the database for data consistency

The sections feature is designed to be backward compatible, so existing test series should continue to work normally while new ones can take advantage of the improved organization.