import React, { useState } from "react";
import axios from "axios";
import "./ReqToTest.css";

import CodeBlock from "./CodeBlock";
import logo from "./img/TestGenieLogo.png";
import TextareaAutosize from "react-textarea-autosize";
//creaete modal to display a wait message to the user
import Modal from "react-modal";
import { BeatLoader } from "react-spinners";

const ReqToTest = () => {
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [codeString, setCodeString] = useState("");
  const [integrationTestCases, setIntegrationTestCases] = useState("");
  // Add a new state variable to store the e2e test cases
  const [e2eTestCases, setE2eTestCases] = useState("");
  //  create a 'read more' or 'expand' functionality for long strings
  const [isExpanded, setIsExpanded] = useState(false);

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

    // Add a new request to get the e2e test cases
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
        axios.request(e2eTestData), // add a new request to get the e2e test cases
      ]);

      const updatedTestCases = testResponse.data.map((testCase) => ({
        ...testCase,
        Status: testCase.Status || "In Progress",
      }));
      console.log("Status: ", testCases.Status);
      setTestCases(updatedTestCases);
      console.log("testCases:", testCases);

      setCodeString(unitTestResponse.data);
      setIntegrationTestCases(integrationTestResponse.data); // updated to use the data from the integration test response
      setE2eTestCases(e2eTestResponse.data); // updated to use the data from the e2e test response
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
    //clear the placeholder text
    document.getElementById("textarea").placeholder = "";
  }

  return (
    <div className="ReqToTest">
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
            display: "flex", // Added to center items
            flexDirection: "column", // Added to align spinner and text vertically
            alignItems: "center", // Added to center items
            justifyContent: "center", // Added to center items
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
        </p>{" "}
        {/* Increased font size */}
      </Modal>

      <form onSubmit={handleSubmit}>
        <TextareaAutosize
          id="textarea"
          onFocus={() => clearPlaceholder()}
          placeholder="Enter your requirement"
          value={requirements}
          onChange={handleChange}
        />
        <input type="submit" value="Generate Tests" disabled={isLoading} />
      </form>
      {testCases.length > 0 && (
        <div className="gherkContainter">
          <h2>Here are your Gherkin test cases</h2>
          {/* create a 'read more' or 'expand' functionality for long strings */}
          <p id="GherkReq">
            Requirement:
            {isExpanded || requirements.length <= 100
              ? requirements
              : requirements.slice(0, 100) + "... "}
            {requirements.length > 100 && (
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
      {/* Add e2e test code block */}
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
