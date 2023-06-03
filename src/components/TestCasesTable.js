import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TestCasesTable.css";

const TestCasesTable = () => {
  const [testCases, setTestCases] = useState([]);

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      const response = await axios.get("http://localhost:8000/get-test-cases");
      setTestCases(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="test-cases-container">
      <h1>Your Tests</h1>
      <table className="test-cases-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Test Case ID</th>
            <th>Description</th>
            <th>Expected Result</th>
            <th>Actual Result</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase) => (
            <tr key={testCase.ID}>
              <td>{testCase.ID}</td>
              <td>{testCase.test_case_id}</td>
              <td>{testCase.Description}</td>
              <td>{testCase.Expected_Result}</td>
              <td>{testCase.Actual_Result}</td>
              <td>{testCase.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestCasesTable;
