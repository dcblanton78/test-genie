import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const PORT = 8000;

const app = express();

app.use(express.json());

// Enable cross-origin resource sharing
app.use(cors());

import db from "./db.js"; // Import db from database.js

app.use(express.json());

// rest of your code...

// Define a route that saves test cases to the MySQL database
app.post("/store-test-cases", async (req, res) => {
  try {
    console.log("req.body:", req.body);

    let testCases = req.body;
    // Check if testCases is an array. If not, convert it into an array.
    if (!Array.isArray(testCases)) {
      testCases = [testCases];
    }

    for (let testCase of testCases) {
      const {
        ID,
        Description,
        Expected_Result,
        Actual_Result = null,
        Status,
      } = testCase;
      console.log("Status: ", Status);

      await db.execute(
        "INSERT INTO test_cases (test_case_id, Description, Expected_Result, Actual_Result, Status) VALUES (?, ?, ?, ?, ?)",
        [ID, Description, Expected_Result, Actual_Result, Status]
      );
    }

    res.status(201).json({ message: "Test cases saved successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred." });
  }
});

// Define a route that returns a simple string response
app.get("/hello", (req, res) => {
  res.json("Hello World");
});

// Define a route that generates test cases based on user-provided requirements
app.get("/get-test-cases", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM test_cases");
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred." });
  }
});

app.get("/generate-test-cases", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Get the requirements parameter from the query string
  const requirements = req.query.requirements;

  const MOCK_TEST_CASES = [
    {
      ID: "TC1",
      Description: "Test Case 1 Description",
      Expected_Result: "Expected Result for Test Case 1",
      Actual_Result: "",
      Status: null,
    },
    // additional test cases...
  ];

  if (process.env.MOCK_TEST_DATA === "true") {
    return res.status(200).json(MOCK_TEST_CASES);
  }

  // Log the requirements to the console (for debugging purposes)
  console.log(requirements);

  // Create the data object to send to OpenAI's API
  const data = {
    model: "text-davinci-003",
    prompt:
      "Please provide at least 20 test cases associated with this requirement in Gherkin syntax (Given, When, Then). In addition to happy path, include all negative cases, edge cases, and corner cases. Please include all the following information: Test Case ID, Description, and Expected Result. Provide the answer as a JSON object with a key 'testCases' that has a value of an array containing objects with keys for 'ID', 'Description', and 'Expected_Result'. ONLY include the Given, When steps in the Description and ONLY the Then step should be included in the Expected Result. Be sure to start with the word Then in the Expected Result. For example, Description: Given I am on the reset password page, When I enter my email address. Expected Result: Then I am sent a link to reset my password: " +
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

    // Extract the generated test cases from the API response
    const generatedTestCases = response.data.choices[0].text;
    const parsedTestCases = JSON.parse(generatedTestCases).testCases;

    // Send the parsed test cases as a JSON response to the client
    res.json(parsedTestCases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Define a route that generates unit tests based on user-provided requirements
app.get("/generate-unit-tests", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Get the requirements parameter from the query string
  const requirements = req.query.requirements;

  const MOCK_UNIT_TESTS = `


    describe('View Listing Details', () => {
      const mockListing = {
        id: 1,
        photos: ['photo1.jpg', 'photo2.jpg'],
        description: 'This is a great listing',
        houseRules: 'No parties',
        reviews: [{ author: 'John', rating: 5 }, { author: 'Jane', rating: 4 }],
        pricing: {
          basePrice: 100,
          extraPersonFee: 10
        }
      };

      test('should return the correct listing photos', () => {
        expect(mockListing.photos).toEqual(['photo1.jpg', 'photo2.jpg']);
      });

      // Rest of tests
    });
    `;

  if (process.env.MOCK_TEST_DATA === "true") {
    return res.status(200).json(MOCK_UNIT_TESTS);
  }

  // Create the data object to send to OpenAI's API
  const data = {
    model: "text-davinci-003",
    prompt:
      "Please provide at least 7 jest unit tests to test the following requirement: " +
      requirements +
      ". The response should be formatted like this example: \n\n" +
      "describe('View Listing Details', () => {\n" +
      "  const mockListing = {\n" +
      "    id: 1,\n" +
      "    photos: ['photo1.jpg', 'photo2.jpg'],\n" +
      "    description: 'This is a great listing',\n" +
      "    houseRules: 'No parties',\n" +
      "    reviews: [{ author: 'John', rating: 5 }, { author: 'Jane', rating: 4 }],\n" +
      "    pricing: {\n" +
      "      basePrice: 100,\n" +
      "      extraPersonFee: 10\n" +
      "    }\n" +
      "  };\n\n" +
      "  test('should return the correct listing photos', () => {\n" +
      "    expect(mockListing.photos).toEqual(['photo1.jpg', 'photo2.jpg']);\n" +
      "  });\n\n" +
      // Rest of tests
      "});",

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
    // Send a POST request to OpenAI's API to generate the unit tests
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      data,
      config
    );

    // Extract the generated unit tests from the API response
    const generatedUnitTests = response.data.choices[0].text;

    // Send the generated unit tests as a JSON response to the client
    res.json(generatedUnitTests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
