# Dynamic Volunteer Role Loading System

## Overview

The CT5 Pride website now features a dynamic volunteer role loading system that automatically displays the latest volunteer opportunities from a centralized configuration file. This system allows admin users to add new roles through the admin panel, which are then automatically committed to Git and deployed to the live website.

## How It Works

### 1. Role Data Storage
- **File**: `js/config.js`
- **Format**: ES6 module that exports `roles` array and `roleIcons` object
- **Structure**: Each role object contains all necessary information (title, description, criteria, etc.)

### 2. Dynamic Loading
- **File**: `volunteer.html`
- **Method**: ES6 module import from `config.js`
- **Features**: 
  - Automatic role card generation
  - Modal popups for detailed role information
  - Responsive grid layout
  - Accessibility features (keyboard navigation, screen reader support)

### 3. Admin Panel Integration
- **File**: `js/admin.js`
- **Process**: 
  1. Admin fills out role form
  2. Data is validated
  3. Sent to server via `/api/submit-role` endpoint
  4. Server commits changes to Git
  5. Changes are pushed to GitHub
  6. Netlify automatically deploys updates

### 4. Server Backend
- **File**: `server.js`
- **Endpoints**:
  - `POST /api/submit-role` - Handles role submissions
  - `GET /api/git-status` - Checks Git repository status
  - `POST /api/check-changes` - Pre-checks if submission would create changes
  - `GET /api/health` - Server health check

## File Structure

```
CT5-Pride/
├── js/
│   ├── config.js          # Role data (auto-updated by admin panel)
│   ├── admin.js           # Admin panel functionality
│   └── main.js            # Main site functionality (updated to use config.js)
├── volunteer.html         # Volunteer page (updated with dynamic loading)
├── admin-add-role.html    # Admin panel interface
├── server.js              # Backend server
└── css/
    └── style.css          # Styles for role cards and modals
```

## Role Object Structure

```javascript
{
    "id": "unique-role-identifier",
    "title": "Role Title",
    "category": "governance",
    "department": "Board of Directors",
    "status": "open", // "open", "draft", or "closed"
    "icon": "volunteers", // Icon type for display
    "summary": "Brief role description",
    "location": "CT5 Area (Whitstable, Seasalter, etc.)",
    "reportingLine": "Who this role reports to",
    "timeCommitment": "8-12 hours per month",
    "description": "<p>Detailed HTML description</p>",
    "essentialCriteria": [
        "Required skill or experience 1",
        "Required skill or experience 2"
    ],
    "desirableCriteria": [
        "Preferred skill or experience 1",
        "Preferred skill or experience 2"
    ]
}
```

## Features

### ✅ Implemented
- **Dynamic Role Loading**: Roles are loaded from `config.js` on page load
- **Responsive Design**: Cards adapt to different screen sizes
- **Modal Details**: Click any role to see full details
- **Admin Panel**: Easy-to-use interface for adding new roles
- **Git Integration**: Automatic commits and pushes to GitHub
- **Error Handling**: Robust error handling and user feedback
- **Accessibility**: Keyboard navigation and screen reader support
- **Preview Mode**: Draft roles can be previewed with `?preview=true` URL parameter

### 🎨 UI Features
- **Role Cards**: Clean, modern card layout with icons
- **Modal Popups**: Detailed role information in accessible modals
- **Status Indicators**: Visual indicators for open/draft/closed roles
- **Apply Buttons**: Direct email links for role applications
- **Loading States**: Visual feedback during operations

### 🔧 Technical Features
- **ES6 Modules**: Modern JavaScript module system
- **Async/Await**: Clean asynchronous code
- **Error Recovery**: Graceful handling of loading failures
- **Performance**: Efficient DOM manipulation
- **Security**: Admin authentication and input validation

## Usage

### For Visitors
1. Visit `/volunteer.html`
2. Browse available roles
3. Click any role card to see details
4. Use "Apply" button to send email application

### For Admins
1. Visit `/admin-add-role.html`
2. Enter admin password: `CT5Pride2024!`
3. Fill out role form
4. Preview role before submission
5. Submit to automatically update the website

### For Developers
1. Roles are stored in `js/config.js`
2. Admin panel updates this file via server
3. Changes are committed to Git automatically
4. Netlify deploys updates within 1-2 minutes

## Troubleshooting

### Common Issues
- **Roles not loading**: Check browser console for JavaScript errors
- **Admin panel not working**: Ensure server is running on port 3000
- **Git push failures**: Verify GitHub token in `.env` file
- **Styling issues**: Check CSS file paths and browser cache

### Debug Steps
1. Check browser console for errors
2. Verify server is running: `http://localhost:3000/api/health`
3. Check Git status: `http://localhost:3000/api/git-status`
4. Verify config.js file exists and is valid JavaScript

## Future Enhancements

- **Role Categories**: Filter roles by category
- **Search Functionality**: Search through available roles
- **Application Tracking**: Track application status
- **Role Analytics**: View role popularity and engagement
- **Bulk Operations**: Import/export multiple roles
- **Role Templates**: Pre-defined role templates for common positions

## Security Notes

- Admin password should be changed in production
- GitHub token should have minimal required permissions
- Input validation prevents XSS attacks
- All user inputs are sanitized before display

---

**Last Updated**: July 2024  
**Version**: 1.0  
**Maintainer**: CT5 Pride Development Team 