import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./CodeBlock.css";

const CodeBlock = ({ codeString, requirements, title }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000); // reset after 3s
  };

  return (
    <div className="code-block">
      <div className="heading-container">
        {/* <h2 className="unit-tests">And here are your Integration Tests</h2> */}
        <h2> {title} </h2>
        <p>Requirement: {requirements}</p>
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
