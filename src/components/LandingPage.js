//Testing git

import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import logo from "./img/LogoTestGenie.png";

//Adding some comments to test git
//Adding some more comments to test git

const LandingPage = () => {
  return (
    <div className="landing-page-container">
          <div className="logo-container">
        <img src={logo} alt="TestGenie Logo" className="logo" />
      </div>
      <h1 className="landing-page-header">Welcome to TestGenie!</h1>
      <div className="landing-page-link-container">
        <Link to="/tests" className="landing-page-link">
          Generate Tests
        </Link>
        <Link to="/your-tests" className="landing-page-link">
          Your Tests
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
