# Copilot Instructions - Walkout Frontend

## Architecture Overview

**Walkout Management System** - React-based frontend for dental office workflow management with role-based access control. The app manages dental appointments through a complex walkout form system with Office and LC3 team validations.

### Core Structure

- **Two-tier navigation**: Home/Dashboard (no sidebar) vs. Control Panel (with collapsible sidebar)
- **Role-based access**: `user`, `office`, `admin`, `superAdmin` with strict permission checks
- **Context-driven state**: `AuthContext` for authentication, `ToastContext` for notifications
- **Centralized API**: All backend calls through `src/utils/api.js` with JWT interceptors

## Critical Development Patterns

### 1. Field ID System (CRITICAL)

The walkout form uses unique field IDs to map dynamic radio buttons and dropdowns. **These IDs MUST match between components**:

```javascript
// Defined in WalkoutForm.js (lines 10-93)
const FIELD_IDS = {
  PATIENT_TYPE: "WFDRP_OFFICE_PATIENT_TYPE",
  PATIENT_CAME: "WFRAD_OFFICE_PATIENT_CAME",
  // ... 50+ field IDs
};
```

When adding/modifying fields:

- Update `FIELD_IDS` in [WalkoutForm.js](src/components/WalkoutForm/WalkoutForm.js)
- Update `FIELD_LABELS` in [RadioButtonSetManagement.js](src/components/Management/RadioButtonSetManagement.js) and [DropdownSetManagement.js](src/components/Management/DropdownSetManagement.js)
- Check [walkout-form-schema.json](walkout-form-schema.json) for data structure

### 2. Role-Based Access Control

Roles are **case-sensitive** and stored in `localStorage.user.role`:

```javascript
// AuthContext provides helpers
isAdmin(); // returns true for "admin" or "superAdmin"
isSuperAdmin(); // returns true only for "superAdmin"

// In components, check user.role directly:
{
  user && (user.role === "admin" || user.role === "superAdmin") && (
    <Link to="/control-panel">Control Panel</Link>
  );
}
```

Common debugging issue: Role mismatches due to old localStorage data. Clear storage and re-login when testing role changes.

### 3. Toast Notifications Pattern

Use `ToastContext` hooks, never `alert()`:

```javascript
const { showSuccess, showError, showWarning, showInfo } = useToast();
showSuccess("Operation completed!");
showError(error.response?.data?.message || "Operation failed");
```

Toasts auto-dismiss after 3 seconds and appear in top-right corner (fixed position).

### 4. API Integration

All requests go through the Axios instance in [src/utils/api.js](src/utils/api.js):

```javascript
import api from "../../utils/api";

// Token automatically attached via interceptor
const response = await api.get("/users");

// 401 errors auto-redirect to /login
// Always handle errors: error.response?.data?.message
```

**Environment Variable**: `REACT_APP_API_URL` (default: `http://localhost:5000/api`)

### 5. WalkoutForm State Management

The [WalkoutForm.js](src/components/WalkoutForm/WalkoutForm.js) component is 4000+ lines with complex state:

- **Collapsible sections**: `office`, `lc3`, `audit` (controlled by `sections` state)
- **Dynamic fields**: Loaded from backend via `/radio-buttons/button-sets` and `/dropdowns/dropdown-sets`
- **Field visibility**: Conditional rendering based on previous field values (see [validate/](validate/) docs)
- **Timer tracking**: Sidebar tracks session time with `sidebarData.timer`
- **Image management**: Three image types with zoom controls: `officeWO`, `checkImage`, `lc3WO`

Key validation patterns are documented in [validate/FRONTEND_OFFICE_SECTION_PART2_VALIDATION.md](validate/FRONTEND_OFFICE_SECTION_PART2_VALIDATION.md).

## Project-Specific Conventions

### Component Organization

- **Management components**: CRUD operations for entities (Regions, Offices, Teams, Users)
- **Layout components**: `AdminLayout` (sidebar), `Navbar` (simple header), `ControlPanel` (admin wrapper)
- **Auth components**: `Login`, `Signup`, `PrivateRoute` (route guard with role checking)

### Styling Approach

- **CSS Variables**: Professional business palette defined in [src/index.css](src/index.css)
  ```css
  --primary-color: #1a56db;
  --danger-color: #e02424;
  --text-primary: #111827;
  ```
- **Component CSS**: Each component has its own `.css` file
- **No inline styles**: Use CSS classes, not style props

### Data Flow

1. User logs in → JWT token + user data stored in localStorage
2. `AuthContext` loads user from localStorage on mount
3. Protected routes check `user` via `PrivateRoute` component
4. API calls auto-inject token from localStorage via interceptor
5. 401 responses clear token and redirect to login

## Development Workflows

### Running the App

```bash
npm start  # Development server on localhost:3000
npm build  # Production build
npm test   # Run tests
```

### Environment Setup

Create `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Debugging Role Issues

See [DEBUG_INSTRUCTIONS.md](DEBUG_INSTRUCTIONS.md) for common role-based access problems:

1. Check localStorage: `JSON.parse(localStorage.getItem("user")).role`
2. Verify case-sensitivity (must be exactly "admin", not "Admin")
3. Clear cache and re-login to reset state

### Adding New Management Entities

Follow pattern from [RegionManagement.js](src/components/Management/RegionManagement.js):

1. Create management component with list view, modal for create/edit
2. Add route in [App.js](src/App.js) under `/control-panel` with role guard
3. Add sidebar link in [ControlPanel.js](src/components/Layout/ControlPanel.js)
4. Use `useToast()` for success/error feedback

## Integration Points

### Backend Dependencies

Requires backend API with these endpoints (see [README file backend.md](README%20file%20backend.md)):

- `/api/users/login`, `/api/users/signup`
- `/api/users`, `/api/regions`, `/api/offices`, `/api/teams`
- `/api/radio-buttons/button-sets`, `/api/dropdowns/dropdown-sets`
- `/api/appointments` (for WalkoutForm)

### External Systems

- **LC3 Team**: Special team ID `692b62d7671d81750966a63c` used for LC3 section access control
- **Image Storage**: Images uploaded via `/upload-image` endpoint (implementation in WalkoutForm)

## Key Files Reference

- [src/context/AuthContext.js](src/context/AuthContext.js) - Authentication state and helpers
- [src/utils/api.js](src/utils/api.js) - Axios instance with interceptors
- [src/components/WalkoutForm/WalkoutForm.js](src/components/WalkoutForm/WalkoutForm.js) - Main form logic (4000+ lines)
- [walkout-form-schema.json](walkout-form-schema.json) - Data structure for walkout submissions
- [validate/](validate/) - Frontend validation rules and documentation

## Common Pitfalls

1. **Field ID mismatches**: Always sync FIELD_IDS across WalkoutForm and Management components
2. **Role case sensitivity**: Roles are lowercase strings ("admin", not "Admin")
3. **localStorage stale data**: Clear localStorage when testing role changes
4. **Missing role guards**: Always wrap admin routes with `requiredRoles={["admin", "superAdmin"]}`
5. **Toast vs alert**: Use ToastContext, never browser `alert()`
