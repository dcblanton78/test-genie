import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "./img/TestGenieLogo.png";

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <div className="logo-container">
        <img src={logo} alt="TestGenie Logo" className="logo" />
      </div>
      <h1 className="landing-page-header">Welcome to TestGenie!</h1>
      <div className="landing-page-link-container">
        <div className="tooltip-container">
          <Link to="/tests" className="landing-page-link">
            Req To Test Generator
          </Link>
          <span className="tooltip-text">
            Got a well written requirement but no tests?
          </span>
        </div>
        <div className="tooltip-container">
          <Link to="/codetotest" className="landing-page-link">
            Regression Generator
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
