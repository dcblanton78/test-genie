import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState([]);

  const handleChange = (event) => {
    setRequirements(event.target.value);
  };

  const handleActualResultChange = (event, index) => {
    const newTestCases = [...testCases];
    newTestCases[index].actualResult = event.target.value;
    setTestCases(newTestCases);
  };

  const handleStatusChange = (event, index) => {
    const newTestCases = [...testCases];
    newTestCases[index].status = event.target.value;
    setTestCases(newTestCases);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            "Please provide the test cases associated with these requirements. Please include all the following information: Test Case ID, Description, and Expected Result. Provide the answer as a json object with keys for ID, Description, and Expected_Result " +
            requirements,
        },
      ],
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`,
      },
    };

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        data,
        config
      );
      const generatedTestCases = JSON.parse(
        response.data.choices[0].message.content
      ).map((testCase) => ({ ...testCase, actualResult: "", status: "New" }));
      setTestCases(generatedTestCases);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your software requirements:
          <textarea value={requirements} onChange={handleChange} />
        </label>
        <input type="submit" value="Generate Test Cases" />
      </form>
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
                    value={testCase.actualResult}
                    onChange={(event) => handleActualResultChange(event, index)}
                  />
                </td>
                <td>
                  <select
                    value={testCase.status}
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
    </div>
  );
};

export default App;
