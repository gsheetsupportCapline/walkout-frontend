import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import PrivateRoute from "./components/Auth/PrivateRoute";
import ControlPanel from "./components/Layout/ControlPanel";
import Home from "./components/Home/Home";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Profile/Profile";
import UserManagement from "./components/Users/UserManagement";
import RegionManagement from "./components/Management/RegionManagement";
import OfficeManagement from "./components/Management/OfficeManagement";
import TeamManagement from "./components/Management/TeamManagement";
import DropdownSetManagement from "./components/Management/DropdownSetManagement";
import RadioButtonSetManagement from "./components/Management/RadioButtonSetManagement";
import ArchiveDropdownManagement from "./components/Management/ArchiveDropdownManagement";
import ArchiveRadioButtonManagement from "./components/Management/ArchiveRadioButtonManagement";
import Appointments from "./components/Appointments/Appointments";
import WalkoutDetails from "./components/WalkoutDetails/WalkoutDetails";
import Navbar from "./components/Layout/Navbar";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Dashboard - With Navbar only */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Appointments - With Navbar only */}
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <Appointments />
                </PrivateRoute>
              }
            />

            {/* Walkout Details - With Navbar only */}
            <Route
              path="/appointments/:id"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <WalkoutDetails />
                  </>
                </PrivateRoute>
              }
            />

            {/* Control Panel Routes - With Sidebar */}
            <Route
              path="/control-panel"
              element={
                <PrivateRoute requiredRoles={["admin", "superAdmin"]}>
                  <ControlPanel />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/profile" replace />} />
              <Route
                path="users"
                element={
                  <PrivateRoute requiredRoles={["admin", "superAdmin"]}>
                    <UserManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="regions"
                element={
                  <PrivateRoute requiredRoles={["admin", "superAdmin"]}>
                    <RegionManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="offices"
                element={
                  <PrivateRoute requiredRoles={["admin", "superAdmin"]}>
                    <OfficeManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="teams"
                element={
                  <PrivateRoute requiredRoles={["admin", "superAdmin"]}>
                    <TeamManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="dropdown-sets"
                element={
                  <PrivateRoute requiredRoles={["admin", "superAdmin"]}>
                    <DropdownSetManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="radio-button-sets"
                element={
                  <PrivateRoute requiredRoles={["admin", "superAdmin"]}>
                    <RadioButtonSetManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="archives/dropdown-sets"
                element={
                  <PrivateRoute requiredRoles={["superAdmin"]}>
                    <ArchiveDropdownManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="archives/radio-button-sets"
                element={
                  <PrivateRoute requiredRoles={["superAdmin"]}>
                    <ArchiveRadioButtonManagement />
                  </PrivateRoute>
                }
              />
            </Route>

            {/* Profile - In Control Panel */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ControlPanel />
                </PrivateRoute>
              }
            >
              <Route index element={<Profile />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
