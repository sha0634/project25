# CV Scanning Feature

## Overview
The CV scanning feature automatically extracts information from uploaded CVs (PDF format) and populates the student profile with relevant data including skills, education, and professional summary.

## How It Works

### Backend Implementation

#### 1. CV Parser (`backend/utils/cvParser.js`)
- **PDF Text Extraction**: Uses `pdf-parse` library to extract text from PDF files
- **Skills Detection**: Automatically identifies programming languages, frameworks, databases, and tools
- **Education Extraction**: Detects degree information, institutions, and dates
- **Bio/Summary Extraction**: Identifies professional summary sections

#### 2. Profile Controller Update (`backend/controllers/profileController.js`)
- Enhanced `uploadResume` endpoint to parse CVs
- Only processes PDF files (DOC/DOCX support can be added)
- Intelligently merges extracted data with existing profile data
- Returns extracted information to frontend

### Frontend Implementation

#### Student Profile Page (`frontend25/src/pages/stprofile.jsx`)
- Updated CV upload handler to receive and process extracted data
- Auto-fills profile fields with extracted information
- Provides user feedback about extracted data
- Allows users to review and edit auto-filled information

## Features

### Skills Extraction
Automatically detects and adds:
- Programming languages (JavaScript, Python, Java, etc.)
- Frameworks (React, Angular, Django, etc.)
- Databases (MySQL, MongoDB, PostgreSQL, etc.)
- Tools & Technologies (Git, Docker, AWS, etc.)
- Soft skills and domain-specific skills

### Education Extraction
Identifies:
- Degree types (Bachelor's, Master's, PhD, etc.)
- Field of study
- Institution names
- Years of attendance
- Current/ongoing education

### Professional Summary
Extracts bio/summary sections with keywords like:
- Summary
- Profile
- Objective
- About
- Introduction

## User Experience

1. **Upload CV**: Student uploads their CV in PDF format
2. **Automatic Scanning**: System extracts relevant information
3. **Profile Update**: Skills, education, and bio are automatically populated
4. **Review**: User sees summary of extracted data
5. **Edit**: User can review and modify any auto-filled information

## Example Workflow

```javascript
// User uploads CV
CV Upload → Backend Processing → Text Extraction → Information Parsing

// Backend extracts:
{
  skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  education: [
    {
      degree: "Bachelor of Technology in Computer Science",
      institution: "XYZ University",
      startDate: "2019",
      endDate: "2023"
    }
  ],
  bio: "Passionate software developer with experience in web technologies..."
}

// Frontend receives and displays:
• 4 skills added
• 1 education entry added
• Professional summary added
```

## Technical Details

### Dependencies
- `pdf-parse`: PDF text extraction library

### API Endpoint
```
POST /api/profile/student/upload-resume
- Accepts: multipart/form-data with resume file
- Returns: { success, resumePath, fileName, extractedData }
```

### Supported File Types
- PDF (with automatic parsing)
- DOC/DOCX (uploaded but not parsed - can be extended)

### Limitations
- Only PDF files are currently parsed
- Extraction accuracy depends on CV formatting
- Some complex layouts may not parse correctly

## Future Enhancements

1. **DOC/DOCX Support**: Add parsing for Word documents
2. **AI-Powered Extraction**: Use NLP/ML for better accuracy
3. **Custom Skill Categories**: Allow users to categorize skills
4. **Work Experience**: Extract work history and projects
5. **Certifications**: Detect and add certifications
6. **Language Support**: Multi-language CV parsing

## Benefits

- **Time Saving**: Eliminates manual data entry
- **Accuracy**: Reduces human errors in profile creation
- **Completeness**: Ensures comprehensive profile information
- **User-Friendly**: Seamless integration with existing workflow
- **Smart Merging**: Preserves existing data while adding new information
