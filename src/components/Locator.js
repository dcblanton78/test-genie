//A module that prompts the user for a block of code. Based on that code, make an API call to OpenAI's  API to
//return the associated tests (unit, integration, regression, etc). The user can then copy the code and paste it.

/* global google */

import React, { useState, useContext } from "react";
import axios from "axios";

import "./CodeToTest.css";
import { useNavigate } from "react-router-dom";

import CodeBlock from "./CodeBlockCTT";
import logo from "./img/TestGenieLogo.png";
import TextareaAutosize from "react-textarea-autosize";
import Modal from "react-modal";
import { BeatLoader } from "react-spinners";
import UserContext from "./UserContext";

//const axios = require("axios");

//A component that prompts the user for a block of code. Based on that code, make an API call to OpenAI's  API to return the associated tests (unit, integration, regression, etc). The user can then copy the code and paste it into their dev environment.
const CodeToTest = () => {
  //State variables
  const [codeBlock, setCodeBlock] = useState("");

  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [codeString, setCodeString] = useState("");

  const [integrationTestCases, setIntegrationTestCases] = useState("");
  const [e2eTestCases, setE2eTestCases] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const profilePicture = localStorage.getItem("profilePicture");
  const { user, setUser } = useContext(UserContext);

  //Functions

  //A function that handles the change in the code block
  const handleChange = (event) => {
    setCodeBlock(event.target.value);
  };

  const handleTestLink = () => {
    navigate("/your-tests");
  };

  //A function that routes the user to the landing page when they click the Home button
  const handleHomeLink = () => {
    navigate("/landing");
  };

  const handleReqToTestLink = () => {
    navigate("/tests");
  };

  //A function that logs the user out of the application
  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    navigate("/");
  };

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
      url: "http://localhost:8000/generate-test-cases-from-code",
      params: { code: codeBlock },
    };

    //API call to generate the unit tests
    const unitTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-unit-tests-from-code",
      params: { code: codeBlock },
    };

    const integrationTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-integration-tests-from-code",
      params: { code: codeBlock },
    };

    const e2eTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-e2e-tests-from-code",
      params: { code: codeBlock },
    };

    try {
      const [
        testResponse,
        unitTestResponse,
        integrationTestResponse,
        e2eTestResponse,
      ] = await Promise.all([
        axios.request(data),
        axios.request(unitTestData),
        axios.request(integrationTestData),
        axios.request(e2eTestData),
      ]);
      console.log("unitTestResponse: ", unitTestResponse);

      const updatedTestCases = testResponse.data.map((testCase) => ({
        ...testCase,
        Status: testCase.Status || "New",
      }));
      console.log("Status: ", testCases.Status);
      setTestCases(updatedTestCases);
      console.log("testCases:", testCases);

      setCodeString(unitTestResponse.data);
      console.log("CodeString: ", codeString);
      console.log("unitTestCases:", unitTestResponse.data);
      setIntegrationTestCases(integrationTestResponse.data);
      setE2eTestCases(e2eTestResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      document.body.style.cursor = "";
    }
  };

  const handleActualResultChange = (event, index) => {
    const newTestCases = [...testCases];
    newTestCases[index].Actual_Result = event.target.value;
    setTestCases(newTestCases);
  };

  const handleStatusChange = (event, index) => {
    const newTestCases = [...testCases];
    newTestCases[index].Status = event.target.value;
    setTestCases(newTestCases);
  };

  const downloadCSV = () => {
    const csvData = [
      ["ID", "Description", "Expected Result", "Actual Result", "Status"],
      ...testCases.map(
        ({ ID, Description, Expected_Result, Actual_Result, Status }) => [
          ID,
          Description,
          Expected_Result,
          Actual_Result,
          Status,
        ]
      ),
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${
                value !== undefined ? value.toString().replace(/"/g, '""') : ""
              }"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "test-cases.csv");
    link.click();
  };

  const saveTestCase = async (testCase) => {
    try {
      await axios.post("http://localhost:8000/store-test-cases", testCase);
      setSuccessMessage("Test case saved successfully!");
    } catch (error) {
      console.error(error);
      setSuccessMessage("Failed to save test case.");
    }
  };

  const saveAllTestCases = async () => {
    try {
      for (let index = 0; index < testCases.length; index++) {
        await saveTestCase(testCases[index]);
      }
      setSuccessMessage("All test cases saved successfully!");
    } catch (error) {
      console.error(error);
      setSuccessMessage("Failed to save test cases.");
    }
  };

  function clearPlaceholder() {
    document.getElementById("textarea").placeholder = "";
  }

  return (
    <div className="CodeToTest">
      <nav className="navbar">
        <button className="navbar-link" onClick={handleHomeLink}>
          Home
        </button>
        <button className="navbar-link" onClick={handleReqToTestLink}>
          Req to Test
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
          Please wait while I create your tests. It's a lot of work, so it'll
          take a moment...
        </p>
      </Modal>

      <form onSubmit={handleSubmit}>
        <TextareaAutosize
          id="textarea"
          onFocus={() => clearPlaceholder()}
          placeholder="Need locators. Enter your code here."
          value={codeBlock}
          onChange={handleChange}
        />
        <input type="submit" value="Generate Tests" disabled={isLoading} />
      </form>
      {testCases.length > 0 && (
        <div className="gherkContainter">
          <h2>Here are your Gherkin test cases</h2>
          {/* create a 'read more' or 'expand' functionality for long strings */}
          <p id="GherkReq">
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

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Expected Result</th>
                <th>Actual Result</th>
                <th>Status</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((testCase, index) => (
                <tr key={index}>
                  <td>{testCase.ID}</td>
                  <td>{testCase.Description}</td>
                  <td>{testCase.Expected_Result}</td>
                  <td>
                    <input
                      type="text"
                      value={testCase.Actual_Result}
                      onChange={(event) =>
                        handleActualResultChange(event, index)
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={testCase.Status}
                      onChange={(event) => handleStatusChange(event, index)}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => saveTestCase(testCase)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-container">
            <button onClick={downloadCSV}>Download to CSV</button>
            <button>Export To Jira</button>
            <button
              onClick={() => saveAllTestCases(testCases)}
              className="save-all-button"
            >
              Save All
            </button>
          </div>
          {successMessage && <div className="success">{successMessage}</div>}
        </div>
      )}
      {codeString && (
        <CodeBlock
          codeString={codeString}
          code={codeBlock}
          title="And here are your Unit Tests"
        />
      )}
      {integrationTestCases && (
        <CodeBlock
          codeString={integrationTestCases}
          code={codeBlock}
          title="And here are your Integration Tests"
        />
      )}
      {/* Add e2e test code block */}
      {e2eTestCases && (
        <CodeBlock
          codeString={e2eTestCases}
          code={codeBlock}
          title="And here are your E2E Tests"
        />
      )}
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default CodeToTest;
