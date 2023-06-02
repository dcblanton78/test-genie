// Import needed dependencies and styles
import React, { useState } from "react";
import axios from "axios";
import "./ReqToTest.css";

const ReqToTest = () => {
  // Define state variables
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // New state variable
  const [successMessage, setSuccessMessage] = useState(""); // New state variable

  // Handle change of input field for requirements
  const handleChange = (event) => {
    setRequirements(event.target.value);
  };

  // Handle change of input fields for actual result and status
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

  // Handle form submission to generate test cases
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Set isLoading to true
    document.body.style.cursor = "wait"; // Change cursor to spinner

    // API request to get generated test cases
    const data = {
      method: "GET",
      url: "http://localhost:8000/test-cases",
      params: { requirements: requirements },
    };

    axios.request(data).then(function (response) {
      // Extract the generated test cases from response
      const jsonString = response.data.choices[0].text.replace(".", "");
      const generatedTestCases = JSON.parse(jsonString).testCases.map(
        (testCase) => ({
          ...testCase,
          Actual_Result: "",
          Status: "New",
        })
      );
      // Set the state variable with generated test cases
      setTestCases(generatedTestCases);
      setIsLoading(false); // Set isLoading to false
      document.body.style.cursor = ""; // Reset cursor to normal
    });
  };

  // Function to download test cases in CSV format
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

  // Function to save individual test case to backend
  const saveTestCase = async (testCase) => {
    try {
      await axios.post("http://localhost:8000/store-test-cases", testCase);
      setSuccessMessage("Test case saved successfully!"); // Update the success message
    } catch (error) {
      console.error(error);
      // Handle error if the save operation fails
      setSuccessMessage("Failed to save test case.");
    }
  };

  // Function to save all test cases to backend
  const saveAllTestCases = async (testCases) => {
    try {
      // Iterate through each test case and save it individually
      for (let testCase of testCases) {
        await saveTestCase(testCase);
      }
      setSuccessMessage("All test cases saved successfully!"); // Update the success message
    } catch (error) {
      console.error(error);
      // Handle error if the save operation fails
      setSuccessMessage("Failed to save test cases.");
    }
  };

  return (
    <div>
      {/* Render application header */}
      <h1>TestGenie</h1>

      <form onSubmit={handleSubmit}>
        {/* Render input field for requirements */}
        <h2 className="prompt">
          Enter your requirement:
          <textarea value={requirements} onChange={handleChange} />
        </h2>

        {/* Render button to submit form */}
        <input
          type="submit"
          value="Generate Test Cases"
          disabled={isLoading} // Disable button when isLoading is true
        />
      </form>
      {successMessage && <div className="success">{successMessage}</div>}
      {/* Render generated test cases */}
      {testCases.length > 0 && (
        <>
          {testCases.map((testCase, index) => (
            <div key={index}>
              <h2>Test Case {testCase.ID}</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Expected Result</th>
                    <th>Actual Result</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* Render test case details and input fields for actual result and status */}
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

                    {/* Render save button for individual test case */}
                    <td>
                      <button onClick={() => saveTestCase(testCase)}>
                        Save
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {/* Render buttons to download and export test cases */}
          <button onClick={downloadCSV}>Download to CSV</button>
          <button>Export To Jira</button>

          {/* Render "Save All" button */}
          <button
            onClick={() => saveAllTestCases(testCases)}
            className="save-all-button"
          >
            Save All
          </button>
        </>
      )}
    </div>
  );
};

// Export the App component as default
export default ReqToTest;
