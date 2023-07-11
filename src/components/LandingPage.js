/* global google */
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "./img/TestGenieLogo.png";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserContext";

const LandingPage = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    navigate("/");
  };
  const profilePicture = localStorage.getItem("profilePicture");

  return (
    <div className="landing-page-container" data-cy="landing-page">
      <nav className="navbar">
        {user && user.name ? (
          <div className="user-info">
            <img
              referrerPolicy="no-referrer"
              src={profilePicture}
              alt={user.name}
            />
            <h3 data-cy="user-name">{user.name}</h3>
            <button
              className="navbar-link"
              onClick={logout}
              data-cy="logout-button"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="user-info">
            <Link to="/" className="navbar-link" data-cy="login-button">
              Login
            </Link>
          </div>
        )}
      </nav>
      <div className="logo-container">
        <img src={logo} alt="TestGenie Logo" className="logo" />
      </div>
      <h1 className="landing-page-header">Welcome to TestGenie!</h1>
      <div className="landing-page-link-container">
        <div
          className="tooltip-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            to="/req-to-test"
            className="landing-page-link"
            data-cy="req-to-test"
          >
            ReqToTest
          </Link>
          {showTooltip && (
            <span className="tooltip-text">
              Got a well written requirement but no tests?
            </span>
          )}
        </div>

        <div className="tooltip-container">
          <Link
            to="/code-to-test"
            className="landing-page-link"
            data-cy="code-to-test"
          >
            CodeToTest
          </Link>
          <span className="tooltip-text">
            Got code but no regression tests?
          </span>
        </div>

        <div className="tooltip-container">
          <Link
            to="/tag-your-code"
            className="landing-page-link"
            data-cy="locator-generator"
          >
            TagYourCode
          </Link>
          <span className="tooltip-text">Got code but crappy locators?</span>
        </div>

        <div className="tooltip-container">
          <Link
            to="/barrier-breaker"
            className="landing-page-link"
            data-cy="barrier-breaker"
          >
            BarrierBreaker
          </Link>
          <span className="tooltip-text">
            Is your application inaccessible?
          </span>
        </div>

        <div className="tooltip-container">
          <Link
            to="/your-tests"
            className="landing-page-link"
            data-cy="your-tests"
          >
            Your Tests
          </Link>
          <span className="tooltip-text">View your tests</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
