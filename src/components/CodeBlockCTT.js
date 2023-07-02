import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./CodeBlock.css";

const CodeBlock = ({ codeString, code, title, type }) => {
  console.log("codeString", codeString);
  console.log("code", code);
  console.log("title", title);

  const [isCopied, setIsCopied] = useState(false);

  // create a 'read more' or 'expand' functionality for long strings
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000); // reset after 3s
  };

  if (!code) {
    console.log("CodeBlock received undefined or null prop");
    return <div>No code to display.</div>;
  }

  const codeSnippet =
    isExpanded || code.length <= 100 ? code : code.slice(0, 100) + "... ";

  return (
    <div className="code-block">
      <div className="heading-container">
        <h2> {title} </h2>
        <div id="provided-code">
          <p style={{ marginLeft: "20px" }}>Provided Code:</p>
          <div className="highlight-container">
            <SyntaxHighlighter language="javascript" style={solarizedlight}>
              {codeSnippet}
            </SyntaxHighlighter>
            {code.length > 100 && (
              <button
                className="show-more-button"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* if {type} is equal to 'code', display 'Updated Code'. If {type} is equal to 'tests', display 'E2E Tests based on provdied code' */}
      <p style={{ marginLeft: "20px" }}>
        {type === "code"
          ? "Updated Code:"
          : "E2E Tests based on provided code:"}
      </p>
      {/* <p style={{ marginLeft: "20px" }}>Updated Code:</p> */}
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
