import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Requirements from "./components/ReqToTest";
import ReqToTest from "./components/ReqToTest";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/requirements" element={<Requirements />} />
      </Routes>
    </Router>
  );
};

export default App;
