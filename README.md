# Walkout Frontend - React Application

Complete React-based frontend application for the Walkout Management System with role-based access control.

## Features

### 🔐 Authentication

- User login with email/username
- User signup with role selection
- JWT token-based authentication
- Automatic token refresh and validation
- Secure logout functionality

### 👥 User Management (Admin/SuperAdmin)

- View all users in the system
- Activate/Deactivate user accounts
- Delete users
- Change user roles (SuperAdmin only)
- View user details with team and office assignments

### 🌍 Region Management (Admin/SuperAdmin)

- Create new regions
- Edit existing regions
- Delete regions
- Toggle region visibility
- Manage region status (active/inactive)

### 🏢 Office Management (Admin/SuperAdmin)

- Create offices linked to regions
- Edit office details
- Delete offices
- Assign offices to regions
- Manage office visibility and status

### 🤝 Team Management (Admin/SuperAdmin)

- Create organizational teams
- Edit team information
- Delete teams
- Manage team visibility and status

### 👤 Profile Management (All Users)

- View profile information
- Update name and email
- Change password
- View account status

### 🎨 UI/UX Features

- Modern, clean design with CSS variables
- Responsive layout for all screen sizes
- Role-based navigation
- Collapsible sidebar
- Beautiful color-coded role badges
- Smooth animations and transitions
- Toast notifications for success/error messages
- Modal dialogs for data entry
- Loading states

## Tech Stack

- **React** 18.2.0 - UI Framework
- **React Router DOM** 6.20.0 - Routing
- **Axios** 1.6.2 - HTTP Client
- **Context API** - State Management
- **CSS3** - Styling with CSS Variables

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:
   Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the development server:

```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── PrivateRoute.js
│   │   └── Auth.css
│   ├── Dashboard/
│   │   ├── Dashboard.js
│   │   └── Dashboard.css
│   ├── Layout/
│   │   ├── Layout.js
│   │   └── Layout.css
│   ├── Management/
│   │   ├── RegionManagement.js
│   │   ├── OfficeManagement.js
│   │   ├── TeamManagement.js
│   │   └── Management.css
│   ├── Profile/
│   │   ├── Profile.js
│   │   └── Profile.css
│   └── Users/
│       ├── UserManagement.js
│       └── UserManagement.css
├── context/
│   └── AuthContext.js
├── utils/
│   └── api.js
├── App.js
├── index.js
└── index.css
```

## Role-Based Access

### SuperAdmin

- Full system access
- Can change user roles
- Can manage all entities (users, regions, offices, teams)
- Can assign extra permissions

### Admin

- Manage users (activate/deactivate, delete)
- Manage regions, offices, and teams
- Cannot change user roles
- Cannot manage superAdmin functions

### Office

- Same as User role
- Limited to assigned office data

### User

- View and update own profile
- Access basic features
- No admin capabilities

## API Integration

All API calls are made through the centralized `api.js` utility with:

- Automatic JWT token injection
- Global error handling
- 401 redirect to login
- Axios interceptors

## Available Scripts

### `npm start`

Runs the app in development mode at http://localhost:3000

### `npm build`

Builds the app for production to the `build` folder

### `npm test`

Launches the test runner

## Backend Requirements

This frontend requires the Walkout Backend API running at the configured `REACT_APP_API_URL`.

Backend should provide these endpoints:

- POST `/api/users/login`
- POST `/api/users/signup`
- GET `/api/users`
- PUT `/api/users/:id/activate`
- PUT `/api/users/:id/deactivate`
- DELETE `/api/users/:id`
- PUT `/api/users/:id/change-role`
- PUT `/api/users/profile`
- GET/POST/PUT/DELETE `/api/regions`
- GET/POST/PUT/DELETE `/api/offices`
- GET/POST/PUT/DELETE `/api/teams`

## Styling

The app uses a modern design system with:

- CSS Variables for theming
- Consistent color palette
- Shadow and border utilities
- Responsive grid layouts
- Flexbox for alignment
- Smooth transitions
- Custom scrollbar styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - All rights reserved
