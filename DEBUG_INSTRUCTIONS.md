# Debug Instructions - Role-Based Access Control Issue

## Problem

User aur Office role ke users ko Control Panel me Management aur Organization sections show ho rahe hain, jabki unhe sirf Profile section dikhna chahiye.

## Expected Behavior

### User Role ("user"):

- ✅ Profile section visible
- ❌ Management section (Users) hidden
- ❌ Organization section (Regions, Offices, Teams) hidden
- ❌ Control Panel button in Navbar hidden

### Office Role ("office"):

- ✅ Profile section visible
- ❌ Management section (Users) hidden
- ❌ Organization section (Regions, Offices, Teams) hidden
- ❌ Control Panel button in Navbar hidden

### Admin Role ("admin"):

- ✅ Profile section visible
- ✅ Management section (Users) visible
- ✅ Organization section (Regions, Offices, Teams) visible
- ✅ Control Panel button in Navbar visible

### SuperAdmin Role ("superAdmin"):

- ✅ All sections visible
- ✅ Full access

## Debug Steps

### Step 1: Check LocalStorage

Open browser console (F12) and run:

```javascript
console.log("Token:", localStorage.getItem("token"));
console.log("User Data:", JSON.parse(localStorage.getItem("user")));
console.log("User Role:", JSON.parse(localStorage.getItem("user")).role);
```

**Check:**

- Is role exactly "user" or "office"? (case-sensitive)
- Or is it "User", "USER", "Office", "OFFICE"?

### Step 2: Check React DevTools

1. Install React Developer Tools extension
2. Open React DevTools
3. Search for "ControlPanel" component
4. Check `user` object in props/context
5. Verify `user.role` value

### Step 3: Check Network Tab

1. Open Network tab (F12)
2. Login with user role
3. Check `/api/users/login` response
4. Verify `data.role` value in response

### Step 4: Clear Cache & Test

```javascript
// Run in console
localStorage.clear();
// Then refresh page and login again
```

## Common Issues & Solutions

### Issue 1: Role name case mismatch

**Problem**: Backend sends "User" but frontend checks for "user"
**Solution**: Make comparison case-insensitive OR ensure backend sends lowercase

### Issue 2: Old data in localStorage

**Problem**: Old user object with wrong role still in localStorage
**Solution**: Clear localStorage and login again

### Issue 3: Role not being set during login

**Problem**: Backend not sending role in response
**Solution**: Check backend `/api/users/login` endpoint

### Issue 4: Permission functions always returning true

**Problem**: JavaScript truthy/falsy evaluation issue
**Solution**: Explicit boolean comparison

## Code Review Checklist

### ✅ Navbar.js (Line 50-54)

```javascript
{
  (user.role === "admin" || user.role === "superAdmin") && (
    <Link to="/control-panel" className="navbar-link">
      <span className="nav-icon">⚙️</span>
      Control Panel
    </Link>
  );
}
```

**Status**: Correct - Control Panel button hidden for user/office

### ✅ ControlPanel.js (Line 18-28)

```javascript
const canAccessUsers = () => {
  return user?.role === "admin" || user?.role === "superAdmin";
};

const canAccessRegions = () => {
  return user?.role === "admin" || user?.role === "superAdmin";
};
// ... similar for canAccessOffices, canAccessTeams
```

**Status**: Correct - Only admin/superAdmin can access

### ✅ ControlPanel.js (Line 51-60)

```javascript
{canAccessUsers() && (
  <>
    <div className="sidebar-divider">Management</div>
    <div className="sidebar-section">
      <Link to="/control-panel/users" ...>
        Users
      </Link>
    </div>
  </>
)}
```

**Status**: Correct - Management section conditional

### ✅ ControlPanel.js (Line 62-95)

```javascript
{
  (canAccessRegions() || canAccessOffices() || canAccessTeams()) && (
    <>
      <div className="sidebar-divider">Organization</div>
      // ... individual region/office/team links
    </>
  );
}
```

**Status**: Correct - Organization section conditional

### ✅ App.js (Line 48-86)

```javascript
<Route
  path="/control-panel"
  element={
    <PrivateRoute requiredRoles={["admin", "superAdmin"]}>
      <ControlPanel />
    </PrivateRoute>
  }
>
```

**Status**: Correct - Route protected with role requirements

## Next Steps

1. **Run the debug commands** in browser console
2. **Share the output** of localStorage and network response
3. **Check if role value** matches exactly (case-sensitive)
4. If role is correct but sections still showing, check for:
   - Browser cache issues
   - React component not re-rendering
   - Multiple user contexts
