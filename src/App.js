import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ReqToTest from "./components/ReqToTest";
import TestCasesTable from "./components/TestCasesTable";
import CodeToTest from "./components/CodeToTest";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tests" element={<ReqToTest />} />
        <Route path="/your-tests" element={<TestCasesTable />} />
        <Route path="/codetotest" element={<CodeToTest />} />
      </Routes>
    </Router>
  );
};

export default App;
