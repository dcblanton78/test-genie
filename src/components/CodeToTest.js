//A module that prompts the user for a block of code. Based on that code, make an API call to OpenAI's  API to
//return the associated tests (unit, integration, regression, etc). The user can then copy the code and paste it.

import React, { useState } from "react";
import axios from "axios";
import "./CodeToTest.css";
import { useNavigate } from "react-router-dom";

import CodeBlock from "./CodeBlock";
import logo from "./img/TestGenieLogo.png";
import TextareaAutosize from "react-textarea-autosize";
import Modal from "react-modal";
import { BeatLoader } from "react-spinners";

const CodeToTest = () => {
  const [codeBlock, setCodeBlock] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [codeString, setCodeString] = useState("");
  const [integrationTestCases, setIntegrationTestCases] = useState("");
  const [e2eTestCases, setE2eTestCases] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setCodeBlock(event.target.value);
  };

  const handleHomeLink = () => {
    navigate("/landing");
  };  

  const handleSubmit = async (event) => {
    console.log("Submit button clicked");
    event.preventDefault();
    setIsLoading(true);
    document.body.style.cursor = "wait";


    const data = {
      method: "GET",
      url: "http://localhost:8000/generate-test-cases",
      params: { code: codeBlock },
    };


    const unitTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-unit-tests",
      params: { code: codeBlock },
    };

    const integrationTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-integration-tests",
      params: { code: codeBlock },
    };

    const e2eTestData = {
      method: "GET",
      url: "http://localhost:8000/generate-e2e-tests",
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

  return (
    <div className="CodeToTest">
      <nav className="navbar">
        <button className="navbar-link" onClick={handleHomeLink}>
          Home
        </button>
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
          placeholder="Enter your code block"
          value={codeBlock}
          onChange={handleChange}
        />
        <input type="submit" value="Generate Tests" disabled={isLoading} />
      </form>
      {testCases.length > 0 && (
        <div className="gherkContainter">
          <h2>Here are your Gherkin test cases</h2>
          <p id="GherkReq">
            Code Block:
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
          {testCases.map((testCase, index) => (
            <div key={testCase.ID} className="gherkCases">
              <div className="gherkCase">
                <h3>
                  Test Case {index + 1}: {testCase.Description}
                </h3>
                <CodeBlock codeBlock={testCase} />
                <div className="results">
                  <label>
                    Actual Result:
                    <textarea
                      className="actual-result"
                      value={testCase.Actual_Result || ""}
                      onChange={(event) =>
                        handleActualResultChange(event, index)
                      }
                    />
                  </label>
                  <label>
                    Status:
                    <select
                      value={testCase.Status}
                      onChange={(event) => handleStatusChange(event, index)}
                    >
                      <option>In Progress</option>
                      <option>Pass</option>
                      <option>Fail</option>
                    </select>
                  </label>
                </div>
                <button onClick={() => saveTestCase(testCase)}>
                  Save Test Case
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {testCases.length > 0 && (
        <button onClick={saveAllTestCases}>Save All Test Cases</button>
      )}
      {testCases.length > 0 && (
        <button onClick={downloadCSV}>Download Test Cases as CSV</button>
      )}
      {codeString && (
        <div className="unitTestContainer">
          <h2>Here are your unit tests</h2>
          <CodeBlock codeBlock={codeString} />
        </div>
      )}
      {integrationTestCases && (
        <div className="integrationTestContainer">
          <h2>Here are your integration tests</h2>
          <CodeBlock codeBlock={integrationTestCases} />
        </div>
      )}
      {e2eTestCases && (
        <div className="e2eTestContainer">
          <h2>Here are your end-to-end tests</h2>
          <CodeBlock codeBlock={e2eTestCases} />
        </div>
      )}
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default CodeToTest;
