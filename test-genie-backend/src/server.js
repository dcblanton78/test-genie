import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const PORT = 8000;

const app = express();

// Enable cross-origin resource sharing
app.use(cors());

// Define a route that returns a simple string response
app.get("/hello", (req, res) => {
  res.json("Hello World");
});

// Define a route that generates test cases based on user-provided requirements
app.get("/test-cases", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Get the requirements parameter from the query string
  const requirements = req.query.requirements;

  // Log the requirements to the console (for debugging purposes)
  console.log(requirements);

  // Create the data object to send to OpenAI's API
  const data = {
    model: "text-davinci-003",
    prompt:
      "Please provide the test cases associated with this requirement in Gherkin syntax (Given, When, Then). In addition to happy path, include all negative cases, edge cases, and corner cases. Please include all the following information: Test Case ID, Description, and Expected Result. Provide the answer as a JSON object with a key 'testCases' that has a value of an array containing objects with keys for 'ID', 'Description', and 'Expected_Result'. ONLY include the Given, When steps in the Description and ONLY the Then step should be included in the Expected Result. Be sure to start with the word Then in the Expected Result. For example, Description: Given I am on the reset password page, When I enter my email address. Expected Result: Then I am sent a link to reset my password: " +
      requirements,
    max_tokens: 1500,
    temperature: 0.4,
  };

  // Set up the configuration object for the API request
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  try {
    // Send a POST request to OpenAI's API to generate the test cases
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      data,
      config
    );

    // Send the API response as a JSON response to the client
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
