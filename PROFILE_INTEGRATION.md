# Student Profile Backend Integration

## Overview
The student profile section now stores and retrieves data from the MongoDB database, providing persistent profile management for each student user.

## Backend Implementation

### 1. Profile Controller (`backend/controllers/profileController.js`)
Created CRUD operations for both student and company profiles:

**Student Endpoints:**
- `GET /api/profile/student` - Fetch current user's profile
- `PUT /api/profile/student` - Update profile data

**Company Endpoints:**
- `GET /api/profile/company` - Fetch current user's profile
- `PUT /api/profile/company` - Update profile data

**Features:**
- User type validation (students can only access student routes)
- Authentication required for all endpoints
- Comprehensive error handling

### 2. Profile Routes (`backend/routes/profileRoutes.js`)
- Protected routes using `protect` middleware
- Separate routes for students and companies
- RESTful API design

### 3. Updated Server (`backend/index.js`)
- Added profile routes: `app.use('/api/profile', profileRoutes)`
- CORS already configured for localhost:5174

### 4. User Model Updates (`backend/models/User.js`)
The existing User model already includes:
- `profile.fullName` - User's full name
- `profile.phone` - Phone number
- `profile.bio` - Biography
- `profile.profilePicture` - Profile image URL
- `profile.skills[]` - Array of skills
- `profile.education[]` - Education history
- `profile.resume` - Resume file URL/path

### 5. Auth Controller Enhancement
Updated signup to initialize profile with username:
```javascript
profile: {
    fullName: username, // Initialize with username
    ...(profile || {})
}
```

## Frontend Implementation

### Updated Student Profile (`frontend25/src/pages/stprofile.jsx`)

#### New Features:

1. **Data Fetching on Mount**
   - Uses `useEffect` to fetch profile data when component loads
   - Retrieves data from `/api/profile/student` endpoint
   - Maps backend profile structure to frontend state

2. **Profile Data Persistence**
   - Save button calls `handleSaveProfile()` function
   - Sends PUT request to `/api/profile/student`
   - Updates: fullName, phone, bio, profilePicture, skills, resume

3. **Loading States**
   - Shows spinner while fetching profile data
   - Displays "Saving..." text during save operation
   - Disables save button during save process

4. **Cancel Functionality**
   - Added Cancel button in edit mode
   - Reverts changes without saving

5. **AuthContext Integration**
   - Uses `useContext(AuthContext)` to access user data
   - Pulls email from authenticated user object

## Data Flow

### Profile Load:
1. Component mounts → `useEffect` triggers
2. Fetch request to `GET /api/profile/student` with JWT token
3. Backend validates token, retrieves user from database
4. Profile data returned to frontend
5. State updated with profile information

### Profile Save:
1. User clicks "Save" button → `handleSaveProfile()` called
2. PUT request to `/api/profile/student` with updated data
3. Backend validates token and user type
4. Profile fields updated in database
5. Success response returned
6. Edit mode disabled

## API Endpoints

### GET /api/profile/student
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "fullName": "John Doe",
    "phone": "1234567890",
    "bio": "Passionate developer",
    "profilePicture": "data:image/jpeg;base64,...",
    "skills": ["JavaScript", "React", "Node.js"],
    "education": [],
    "resume": ""
  },
  "user": {
    "username": "johndoe",
    "email": "john@example.com",
    "userType": "student"
  }
}
```

### PUT /api/profile/student
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "fullName": "John Doe",
  "phone": "1234567890",
  "bio": "Updated bio",
  "profilePicture": "data:image/jpeg;base64,...",
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "resume": "base64_or_url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": { /* updated profile data */ }
}
```

## Security Features

1. **JWT Authentication** - All profile routes require valid token
2. **User Type Validation** - Students can only access student endpoints
3. **User-Specific Data** - Each user can only view/edit their own profile
4. **Token Verification** - Middleware validates token before processing requests

## Testing the Integration

1. **Sign up** as a new student user
2. Navigate to **Student Dashboard**
3. Click on **Profile** tab
4. Click **Edit Profile** button
5. Update profile information (name, phone, bio, skills)
6. Upload profile picture (optional)
7. Click **Save** button
8. Verify success message appears
9. Refresh the page to confirm data persists

## Future Enhancements

- [ ] File upload handling for resume (currently base64)
- [ ] Profile picture upload to cloud storage (AWS S3/Cloudinary)
- [ ] Education history management (add/edit/delete)
- [ ] Applied companies tracking (separate collection)
- [ ] Profile completion percentage indicator
- [ ] Input validation and error messages
- [ ] Company profile page implementation
- [ ] Profile visibility settings

## Notes

- Profile data is stored in the `users` collection under the `profile` object
- Images are currently stored as base64 strings (consider cloud storage for production)
- Resume handling needs proper file upload implementation
- Applied companies data is currently hardcoded (needs separate model)
