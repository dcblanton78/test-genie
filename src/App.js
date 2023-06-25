import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ReqToTest from "./components/ReqToTest";
import TestCasesTable from "./components/TestCasesTable";
import CodeToTest from "./components/CodeToTest";
import Login from "./components/Login";
import UserContext from "./components/UserContext";
import TagYourCode from "./components/TagYourCode";
import { useState } from "react";

const App = () => {
  const [user, setUser] = useState({});
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />{" "}
          {/* Login page is now the root route */}
          <Route path="/landing" element={<LandingPage />} />{" "}
          {/* LandingPage has been moved to /landing */}
          <Route path="/tests" element={<ReqToTest />} />
          <Route path="/your-tests" element={<TestCasesTable />} />
          <Route path="/codetotest" element={<CodeToTest />} />
          <Route path="/tag-your-code" element={<TagYourCode />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
};

export default App;
