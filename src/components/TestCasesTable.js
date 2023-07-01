/* global google */
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./TestCasesTable.css";
import { useNavigate } from "react-router-dom";
import UserContext from "./UserContext";
import Navbar from "./Navbar";

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
    navigate("/code-to-test");
  };

  const handleTestLink = () => {
    navigate("/your-tests");
  };

  const handleLocaterLink = () => {
    navigate("/tag-your-code");
  };

  const handleReqToTestLink = () => {
    navigate("/req-to-test");
  };

  const handleBarrierBreakerLink = () => {
    navigate("/barrier-breaker");
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
      <Navbar
        handleHomeLink={handleHomeLink}
        handleCodeToTestLink={handleCodeToTestLink}
        handleTestLink={handleTestLink}
        handleLocaterLink={handleLocaterLink}
        handleReqToTestLink={handleReqToTestLink}
        handleBarrierBreakerLink={handleBarrierBreakerLink}
        user={user}
        profilePicture={profilePicture}
        logout={logout}
      />
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
