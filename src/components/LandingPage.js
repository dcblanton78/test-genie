import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

//Adding some comments to test git

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <h1 className="landing-page-header">Welcome to TestGenie!</h1>
      <div className="landing-page-link-container">
        <Link to="/requirements" className="landing-page-link">
          Generate Test Cases
        </Link>
        <Link to="/your-tests" className="landing-page-link">
          Your Tests
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
