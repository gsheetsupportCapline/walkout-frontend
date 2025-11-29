import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../Layout/Navbar";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="home-page">
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="hero-title">
                Welcome to Walkout Management System
              </h1>
              <p className="hero-description">
                A comprehensive platform for managing users, regions, offices,
                and teams with role-based access control and secure
                authentication.
              </p>
              <div className="hero-buttons">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-primary btn-lg">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔐</div>
                <h3>Secure Authentication</h3>
                <p>JWT-based authentication with role-based access control</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>User Management</h3>
                <p>
                  Complete user lifecycle management with approval workflows
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <h3>Region Management</h3>
                <p>Organize and manage geographic regions efficiently</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🏢</div>
                <h3>Office Management</h3>
                <p>Track and manage office locations across regions</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3>Team Management</h3>
                <p>Create and manage organizational teams with permissions</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Dashboard Analytics</h3>
                <p>Real-time insights and comprehensive reporting</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <div className="container">
            <p>&copy; 2025 Walkout Management System. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
