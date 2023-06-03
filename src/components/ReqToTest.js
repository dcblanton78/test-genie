import React, { useState } from "react";
import axios from "axios";
import "./ReqToTest.css";

const ReqToTest = () => {
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    setRequirements(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    document.body.style.cursor = "wait";

    const data = {
      method: "GET",
      url: "http://localhost:8000/generate-test-cases",
      params: { requirements: requirements },
    };

    axios.request(data).then(function (response) {
      setTestCases(response.data);
      setIsLoading(false);
      document.body.style.cursor = "";
    });
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

  const saveAllTestCases = async (testCases) => {
    try {
      for (let testCase of testCases) {
        await saveTestCase(testCase);
      }
      setSuccessMessage("All test cases saved successfully!");
    } catch (error) {
      console.error(error);
      setSuccessMessage("Failed to save test cases.");
    }
  };

  function clearPlaceholder() {
    document.getElementById("textarea").value = "";
  }

  return (
    <div>
      <h1>TestGenie</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          id="textarea"
          onFocus={() => clearPlaceholder()}
          placeholder="Enter your requirement"
          value={requirements}
          onChange={handleChange}
        />

        <input type="submit" value="Generate Test Cases" disabled={isLoading} />
      </form>
      {successMessage && <div className="success">{successMessage}</div>}

      {testCases.length > 0 && (
        <div>
          <h2>Here are your Gherkin test cases</h2>
          <p>Requirement: {requirements}</p>
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

          <button onClick={downloadCSV}>Download to CSV</button>
          <button>Export To Jira</button>

          <button
            onClick={() => saveAllTestCases(testCases)}
            className="save-all-button"
          >
            Save All
          </button>
        </div>
      )}
    </div>
  );
};

export default ReqToTest;
