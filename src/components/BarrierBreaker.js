/* global google */

import React, { useState, useContext } from "react";
import axios from "axios";
// import CodeBlock from "./CodeBlockCTT";
import { useNavigate } from "react-router-dom";
import logo from "./img/TestGenieLogo.png";
import TextareaAutosize from "react-textarea-autosize";
import Modal from "react-modal";
import { BeatLoader } from "react-spinners";
import UserContext from "./UserContext";
import Report from "./Report";
import "./Report.css";
// import "./BarrierBreaker.css";

const BarrierBreaker = () => {
  const [codeBlock, setCodeBlock] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState("");
  //const [updatedCode, setUpdatedCode] = useState("");
  const navigate = useNavigate();
  const profilePicture = localStorage.getItem("profilePicture");
  const { user, setUser } = useContext(UserContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (event) => {
    setCodeBlock(event.target.value);
  };

  const handleTestLink = () => {
    navigate("/your-tests");
  };

  const handleLocatorLink = () => {
    navigate("/tag-your-code");
  };

  //A function that routes the user to the landing page when they click the Home button
  const handleHomeLink = () => {
    navigate("/landing");
  };

  const handleReqToTestLink = () => {
    navigate("/req-to-test");
  };

  const handleCodeToTestLink = () => {
    navigate("/code-to-test");
  };

  const handleBarrierBreakerLink = () => {
    navigate("/barrier-breaker");
  };

  function clearPlaceholder() {
    document.getElementById("textarea").placeholder = "";
  }

  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const data = {
      method: "POST",
      url: "http://localhost:8000/generate-a11y-report",
      params: { code: codeBlock },
    };

    try {
      const response = await axios.request(data);
      setAnalysisReport(response.data.report);
      console.log("a11y report frontend: " + response.data.report);
      //setUpdatedCode(response.data.updatedCode);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="BarrierBreaker">
      <div className="barrierbreaker-header">
        <nav className="navbar">
          <button
            id="home-link"
            className="navbar-link"
            onClick={handleHomeLink}
          >
            Home
          </button>
          <button
            id="req-link"
            className="navbar-link"
            onClick={handleReqToTestLink}
          >
            ReqToTest
          </button>
          <button
            id="code-to-test-link-two"
            className="navbar-link"
            onClick={handleCodeToTestLink}
          >
            CodeToTest
          </button>
          <button
            id="locate-link"
            className="navbar-link"
            onClick={handleLocatorLink}
          >
            TagYourCode
          </button>
          <button
            id="barrier-link"
            className="navbar-link"
            onClick={handleBarrierBreakerLink}
          >
            BarrierBreaker
          </button>
          <button
            id="test-link"
            className="navbar-link"
            onClick={handleTestLink}
          >
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
      </div>
      <Modal
        isOpen={isLoading}
        contentLabel="Loading Modal"
        style={{
          overlay: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#808080",
          },
          content: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            inset: "auto",
            width: "fit-content",
            border: "none",
            background: "none",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "4px",
            outline: "none",
            padding: "20px",
          },
        }}
      >
        <BeatLoader color="#61DAFB" size={15} margin={2} />
        <p style={{ fontSize: "20px" }}>
          Please wait while I analyze your code for accessibility issues. This
          might take a moment...
        </p>
      </Modal>
      <div className="main-content">
        {analysisReport ? (
          <div className="report">
            <h2>Accessibility Analysis Report</h2>
            <p id="CollapsedCode">
              Code:
              {isExpanded || codeBlock.length <= 100
                ? codeBlock
                : codeBlock.slice(0, 100) + "... "}
              {codeBlock.length > 100 && (
                <button
                  className="show-more-button"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </p>
            <Report report={analysisReport} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextareaAutosize
              id="textarea"
              onFocus={() => clearPlaceholder()}
              placeholder="Enter your code block"
              value={codeBlock}
              onChange={handleChange}
            />
            <input type="submit" value="Generate Report" disabled={isLoading} />
          </form>
        )}
      </div>
    </div>
  );
};

export default BarrierBreaker;
