//A module that prompts the user for a block of code. Based on that code, make an API call to OpenAI's  API to
//return the associated tests (unit, integration, regression, etc). The user can then copy the code and paste it.

/* global google */

import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

import "./CodeToTest.css";
import { useNavigate } from "react-router-dom";

import CodeBlock from "./CodeBlockCTT";
import logo from "./img/TestGenieLogo.png";
import TextareaAutosize from "react-textarea-autosize";
import Modal from "react-modal";
import { BeatLoader } from "react-spinners";
import UserContext from "./UserContext";
import "./TagYourCode.css";
import Navbar from "./Navbar";

//const axios = require("axios");

//A component that prompts the user for a block of code. Based on that code, make an API call to OpenAI's  API to return the associated tests (unit, integration, regression, etc). The user can then copy the code and paste it into their dev environment.
const CodeToTest = () => {
  //State variables
  const [codeBlock, setCodeBlock] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeString, setCodeString] = useState("");
  const navigate = useNavigate();
  const profilePicture = localStorage.getItem("profilePicture");
  const { user, setUser } = useContext(UserContext);
  const [displayCodeString, setDisplayCodeString] = useState("");
  const [testsString, setTestsString] = useState("");

  //Functions

  //A function that handles the change in the code block
  const handleChange = (event) => {
    setCodeBlock(event.target.value);
  };

  const handleHomeLink = () => {
    navigate("/landing");
  };

  const handleCodeToTestLink = () => {
    navigate("/code-to-test");
  };

  const handleTestLink = () => {
    navigate("/your-tests");
  };

  const handleReqToTestLink = () => {
    navigate("/req-to-test");
  };
  const handleLocaterLink = () => {
    navigate("/tag-your-code");
  };

  const handleBarrierBreakerLink = () => {
    navigate("/barrier-breaker");
  };

  //A function that logs the user out of the application
  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    navigate("/");
  };

  useEffect(() => {
    if (codeString) {
      const generateTests = async () => {
        const e2eData = {
          method: "GET",
          url: "http://localhost:8000/generate-e2e-tests-from-code",
          params: { code: codeString },
        };

        try {
          const [testsResponse] = await Promise.all([axios.request(e2eData)]);
          setTestsString(testsResponse.data);
          setDisplayCodeString(codeString);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      generateTests();
    }
  }, [codeString]); // On

  //A function that handles the submit button click
  const handleSubmit = async (event) => {
    console.log("Submit button clicked");
    event.preventDefault();
    setIsLoading(true);
    document.body.style.cursor = "wait";

    //API calls to generate the test cases

    //API call to generate the Gherkin tests
    const data = {
      method: "GET",
      url: "http://localhost:8000/update-code-with-data-cy-locators",
      params: { code: codeBlock },
    };

    try {
      const [codeResponse] = await Promise.all([axios.request(data)]);

      setCodeString(codeResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      document.body.style.cursor = "";
    }
  };

  function clearPlaceholder() {
    document.getElementById("textarea").placeholder = "";
  }

  return (
    <div className="Locator">
      {!isLoading && (
        <Navbar
          handleHomeLink={handleHomeLink}
          handleCodeToTestLink={handleCodeToTestLink}
          handleTestLink={handleTestLink}
          handleLocaterLink={handleLocaterLink}
          handleReqToTestLink={handleReqToTestLink}
          handleBarrierBreakerLink={handleBarrierBreakerLink}
          user={user}
          profilePicture={profilePicture}
          logout={logout}
        />
      )}
      <div className="logo-container">
        <img src={logo} alt="TestGenie Logo" className="logo" />
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
          Please wait while I update your code. It's a lot of work, so it'll
          take a moment...
        </p>
      </Modal>

      {!displayCodeString && !testsString && (
        <form onSubmit={handleSubmit}>
          <TextareaAutosize
            id="textarea"
            onFocus={() => clearPlaceholder()}
            placeholder="Enter your code block"
            value={codeBlock}
            onChange={handleChange}
          />
          <input type="submit" value="Update Code" disabled={isLoading} />
        </form>
      )}

      {displayCodeString && !isLoading && (
        <CodeBlock
          codeString={codeString}
          code={codeBlock}
          title="Here is your code updated with data-cy locators:"
          type="code"
        />
      )}
      {testsString && !isLoading && (
        <CodeBlock
          codeString={testsString}
          code={codeBlock}
          title="Here are the e2e Cypress tests for your code:"
          type="tests"
        />
      )}
    </div>
  );
};

export default CodeToTest;
