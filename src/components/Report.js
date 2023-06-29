import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm"; // this is for GitHub flavored markdown
import "./Report.css";

const Report = ({ report }) => {
  return (
    <div className="report-container">
      <ReactMarkdown
        plugins={[gfm]}
        children={report}
        className="report-content"
      />
    </div>
  );
};

export default Report;
