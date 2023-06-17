/* global google */
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "./img/TestGenieLogo.png";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserContext";
const profilePicture = localStorage.getItem("profilePicture");

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    navigate("/");
  };

  const handleCodeToTestLink = () => {
    navigate("/CodeToTest");
  };

  const handleReqToTestLink = () => {
    navigate("/tests");
  };

  const handleTestLink = () => {
    navigate("/your-tests");
  };

  return (
    <div className="landing-page-container">
      <nav className="navbar">
        <button className="navbar-link" onClick={handleReqToTestLink}>
          Req To Test
        </button>
        <button className="navbar-link" onClick={handleCodeToTestLink}>
          CodeToTest
        </button>
        <button className="navbar-link" onClick={handleTestLink}>
          Your Tests
        </button>
        {user && user.name && (
          <div className="user-info">
            <img src={profilePicture} alt={user.name} />
            <h3>{user.name}</h3>
            <button className="navbar-link" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </nav>
      <div className="logo-container">
        <img src={logo} alt="TestGenie Logo" className="logo" />
      </div>
      <h1 className="landing-page-header">Welcome to TestGenie!</h1>
      <div className="landing-page-link-container">
        <div className="tooltip-container">
          <Link to="/tests" className="landing-page-link">
            Req To Test
          </Link>
          <span className="tooltip-text">
            Got a well written requirement but no tests?
          </span>
        </div>
        <div className="tooltip-container">
          <Link to="/codetotest" className="landing-page-link">
            Code To Test
          </Link>
          <span className="tooltip-text">
            Got code but no regression tests?
          </span>
        </div>
        <div className="tooltip-container">
          <Link to="/locator" className="landing-page-link">
            Locator Generator
          </Link>
          <span className="tooltip-text">Got code but crappy locators?</span>
        </div>
        <div className="tooltip-container">
          <Link to="/your-tests" className="landing-page-link">
            Your Tests
          </Link>
          <span className="tooltip-text">View your tests</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
