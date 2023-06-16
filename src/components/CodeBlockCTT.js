import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./CodeBlock.css";

const CodeBlock = ({ codeString, code, title }) => {
  console.log("codeString", codeString);
  console.log("code", code);
  console.log("title", title);

  const [isCopied, setIsCopied] = useState(false);

  //  create a 'read more' or 'expand' functionality for long strings
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000); // reset after 3s
  };

  if (!code) {
    console.log("CodeBlock received undefined or null prop");
    return <div>No code to display.</div>;
  }

  return (
    <div className="code-block">
      <div className="heading-container">
        {/* <h2 className="unit-tests">And here are your Integration Tests</h2> */}
        <h2> {title} </h2>
        <p id="GherkReq">
          Code:
          {isExpanded || code.length <= 100
            ? code
            : code.slice(0, 100) + "... "}
          {code.length > 100 && (
            <button
              className="show-more-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </p>
      </div>
      <div className="highlight-wrapper">
        <div className="highlight-container">
          <CopyToClipboard text={codeString} onCopy={handleCopy}>
            <button className="copy-code-button">
              {isCopied ? "Copied!" : "Copy Code"}
            </button>
          </CopyToClipboard>
          <SyntaxHighlighter language="javascript" style={solarizedlight}>
            {codeString}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;
