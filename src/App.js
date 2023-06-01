import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // New state variable

  const handleChange = (event) => {
    setRequirements(event.target.value);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Set isLoading to true
    document.body.style.cursor = "wait"; // Change cursor to spinner

    const data = {
      method: "GET",
      url: "http://localhost:8000/test-cases",
      params: { requirements: requirements },
    };

    axios.request(data).then(function (response) {
      const jsonString = response.data.choices[0].text.replace(".", "");
      const generatedTestCases = JSON.parse(jsonString).testCases.map(
        (testCase) => ({
          ...testCase,
          Actual_Result: "",
          Status: "New",
        })
      );
      setTestCases(generatedTestCases);
      setIsLoading(false); // Set isLoading to false
      document.body.style.cursor = ""; // Reset cursor to normal
    });
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

  return (
    <div>
      <h1>TestGenie</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="prompt">
          Enter your requirement:
          <textarea value={requirements} onChange={handleChange} />
        </h2>
        <input
          type="submit"
          value="Generate Test Cases"
          disabled={isLoading} // Disable button when isLoading is true
        />
      </form>
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
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <button onClick={downloadCSV}>Download to CSV</button>
          <button>Export To Jira</button>
        </>
      )}
    </div>
  );
};

export default App;
