/* global google */

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./TestCasesTable.css";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserContext";

const TestCasesTable = () => {
  const [testCases, setTestCases] = useState([]);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTestCases();
  }, []);

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
    navigate("/tag-your-code");
  };

  const handleReqToTestLink = () => {
    navigate("/tests");
  };

  const logout = () => {
    setUser({});
    if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    navigate("/");
  };

  const fetchTestCases = async () => {
    try {
      const response = await axios.get("http://localhost:8000/get-test-cases");
      setTestCases(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const profilePicture = localStorage.getItem("profilePicture");

  return (
    <div className="test-cases-container">
      <nav className="navbar">
        <button
          id="home-link-three"
          className="navbar-link"
          onClick={handleHomeLink}
          data-cy="home-link"
        >
          Home
        </button>
        <button
          id="req-to-test-three"
          className="navbar-link"
          onClick={handleReqToTestLink}
          data-cy="req-to-test-link"
        >
          ReqToTest
        </button>
        <button
          id="code-to-test-link-three"
          className="navbar-link"
          onClick={handleCodeToTestLink}
          data-cy="code-to-test-link"
        >
          CodeToTest
        </button>
        <button
          id="locate-link-four"
          className="navbar-link"
          onClick={handleLocaterLink}
          data-cy="locate-link"
        >
          TagYourCode
        </button>
        <button
          id="test-link-four"
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
