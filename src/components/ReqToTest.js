/* global google */

import React, { useState, useContext } from "react";
import axios from "axios";
import "./ReqToTest.css";
import { useNavigate } from "react-router-dom";

import CodeBlock from "./CodeBlock";
import logo from "./img/TestGenieLogo.png";
import TextareaAutosize from "react-textarea-autosize";
//creaete modal to display a wait message to the user
import Modal from "react-modal";
import { BeatLoader } from "react-spinners";
import UserContext from "./UserContext";

const ReqToTest = () => {
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [codeString, setCodeString] = useState("");
  const [integrationTestCases, setIntegrationTestCases] = useState("");
  const [e2eTestCases, setE2eTestCases] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, setUser } = useContext(UserContext);
  console.log("user", user);

  const navigate = useNavigate();

  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    navigate("/");
  };

  const handleHomeLink = () => {
    navigate("/landing");
  };

  const handleCodeToTestLink = () => {
    navigate("/CodeToTest");
  };

  const handleTestLink = () => {
    navigate("/your-tests");
  };

  const handleLocaterLink = () => {
    navigate("/locator");
  };

  const handleChange = (event) => {
    setRequirements(event.target.value);
  };

  const handleSubmit = async (event) => {
    console.log("Submit button clicked");
    event.preventDefault();
    setIsLoading(true);
    document.body.style.cursor = "wait";

    const data = {
      method: "GET",
      url: "http://localhost:8000/generate-test-cases",
      params: { requirements: requirements },
    };

    const unitTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-unit-tests",
      params: { requirements: requirements },
    };

    const integrationTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-integration-tests",
      params: { requirements: requirements },
    };

    const e2eTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-e2e-tests",
      params: { requirements: requirements },
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

      const updatedTestCases = testResponse.data.map((testCase) => ({
        ...testCase,
        Status: testCase.Status || "In Progress",
      }));
      console.log("Status: ", testCases.Status);
      setTestCases(updatedTestCases);
      console.log("testCases:", testCases);

      setCodeString(unitTestResponse.data);
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

  const profilePicture = localStorage.getItem("profilePicture");
  console.log("profilePicture: " + profilePicture);

  return (
    <div className="ReqToTest" data-cy="req-to-test-page">
      <nav className="navbar">
        <button
        id="home-link-two"
          className="navbar-link"
          onClick={handleHomeLink}
          data-cy="home-link"
        >
          Home
        </button>
        <button
          className="navbar-link"
          data-cy="req-to-test-link"
        >
          Req to Test
        </button>
        <button
          id="code-to-test-link-two"
          className="navbar-link"
          onClick={handleCodeToTestLink}
          data-cy="code-to-test-link"
        >
          Code to Test
        </button>
        <button
          id="locate-link-two"
          className="navbar-link"
          onClick={handleLocaterLink}
          data-cy="locate-link"
        >
          Locator
        </button>
        <button
          id="test-link-two"
          className="navbar-link"
          onClick={handleTestLink}
          data-cy="your-tests-link"
        >
          Your Tests
        </button>
        {user && user.name && (
          <div className="user-info">
            <img src={profilePicture} alt={user.name} />
            <h3 data-cy="user-name">{user.name}</h3>
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

      <form onSubmit={handleSubmit} data-cy="req-to-test-form">
        <TextareaAutosize
          id="textarea"
          onFocus={() => clearPlaceholder()}
          placeholder="Enter your requirement"
          value={requirements}
          onChange={handleChange}
          data-cy="requirements-textarea"
        />
        <input
          type="submit"
          value="Generate Tests"
          disabled={isLoading}
          data-cy="generate-tests-button"
        />
      </form>
      {testCases.length > 0 && (
        <div className="gherkContainter" data-cy="test-cases-container">
          <h2>Here are your Gherkin test cases</h2>
          <p id="GherkReq" data-cy="requirements-text">
            Requirement:
            {isExpanded || requirements.length <= 100
              ? requirements
              : requirements.slice(0, 100) + "... "}
            {requirements.length > 100 && (
              <button
                className="show-more-button"
                onClick={() => setIsExpanded(!isExpanded)}
                data-cy="show-more-button"
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
                      data-cy={`actual-result-input-${index}`}
                    />
                  </td>
                  <td>
                    <select
                      value={testCase.Status}
                      onChange={(event) => handleStatusChange(event, index)}
                      data-cy={`status-select-${index}`}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => saveTestCase(testCase)}
                      data-cy={`save-button-${index}`}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-container">
            <button onClick={downloadCSV} data-cy="download-csv-button">
              Download to CSV
            </button>
            <button data-cy="export-jira-button">Export To Jira</button>
            <button
              onClick={() => saveAllTestCases(testCases)}
              className="save-all-button"
              data-cy="save-all-button"
            >
              Save All
            </button>
          </div>
          {successMessage && (
            <div className="success" data-cy="success-message">
              {successMessage}
            </div>
          )}
        </div>
      )}
      {codeString && (
        <CodeBlock
          codeString={codeString}
          requirements={requirements}
          title="And here are your Unit Tests"
        />
      )}
      {integrationTestCases && (
        <CodeBlock
          codeString={integrationTestCases}
          requirements={requirements}
          title="And here are your Integration Tests"
        />
      )}
      {e2eTestCases && (
        <CodeBlock
          codeString={e2eTestCases}
          requirements={requirements}
          title="And here are your E2E Tests"
        />
      )}
    </div>
  );
};

export default ReqToTest;
