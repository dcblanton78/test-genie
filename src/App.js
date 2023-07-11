import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ReqToTest from "./components/ReqToTest";
import TestCasesTable from "./components/TestCasesTable";
import CodeToTest from "./components/CodeToTest";
import Login from "./components/Login";
import UserContext from "./components/UserContext";
import TagYourCode from "./components/TagYourCode";
import BarrierBreaker from "./components/BarrierBreaker";
import { useState } from "react";
import RequireAuth from "./components/RequireAuth";

const App = () => {
  const [user, setUser] = useState({});
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/landing"
            element={
              <RequireAuth>
                <LandingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/req-to-test"
            element={
              <RequireAuth>
                <ReqToTest />
              </RequireAuth>
            }
          />
          <Route
            path="/your-tests"
            element={
              <RequireAuth>
                <TestCasesTable />
              </RequireAuth>
            }
          />
          <Route
            path="/code-to-test"
            element={
              <RequireAuth>
                <CodeToTest />
              </RequireAuth>
            }
          />
          <Route
            path="/tag-your-code"
            element={
              <RequireAuth>
                <TagYourCode />
              </RequireAuth>
            }
          />
          <Route
            path="/barrier-breaker"
            element={
              <RequireAuth>
                <BarrierBreaker />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
};

export default App;
