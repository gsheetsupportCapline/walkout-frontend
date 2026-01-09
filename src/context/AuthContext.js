import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";
import {
  clearToken,
  setToken as saveToken,
  getToken,
} from "../utils/tokenManager";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = getToken();
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (emailOrUsername, password) => {
    try {
      const response = await api.post("/users/login", {
        emailOrUsername,
        password,
      });

      if (response.data.success) {
        const { token, data } = response.data;
        saveToken(token);
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await api.post("/users/signup", userData);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const isAdmin = () => {
    return user && (user.role === "admin" || user.role === "superAdmin");
  };

  const isSuperAdmin = () => {
    return user && user.role === "superAdmin";
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
