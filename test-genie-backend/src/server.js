import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Load environment variables from .env file
dotenv.config();

const PORT = 8000;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://test-genie.com"],
    credentials: true,
  })
);

app.use(express.json());

import db from "./db.js"; // Import db from database.js
import { compareBuild } from "semver";

app.use(express.json());
// Initialize Passport

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
  // console.log("LOOK HERE!!!! Req.query: ", req.query);
  // console.log("LOOK HERE!!!! Req.header: ", req.headers);
  // console.log("LOOK HERE!!!! Req.body: ", req.body);
  const isCypressTest = req.headers["iscypresstest"] === "true";

  //const isCypressTest = req.query["x-cypress-test"] === "true";
  console.log("Cypress test RESULT: " + isCypressTest);

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

  if (process.env.MOCK_TEST_DATA === "true" || isCypressTest) {
    return res.status(200).json(MOCK_TEST_CASES);
  }

  // Log the requirements to the console (for debugging purposes)
  //console.log(requirements);

  // Create the data object to send to OpenAI's API
  const data = {
    model: "text-davinci-003",
    prompt:
      "Please provide at least 5 test cases associated with the following requirement: " +
      requirements +
      " The test cases should be provided in Gherkin syntax (Given, When, Then). In addition to happy path, include all negative cases, edge cases, and corner cases. Please include all the following information: Test Case ID, Description, and Expected Result. Provide the answer as a JSON object with a key 'testCases' that has a value of an array containing objects with keys for 'ID', 'Description', and 'Expected_Result'. ONLY include the Given and When steps in the Description and ONLY the Then step should be included in the Expected Result. Be sure to start with the word Then in the Expected Result. For example, Description: Given I am on the reset password page, when I enter my email address. Expected Result: Then I am sent a link to reset my password: ",
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
    console.log("response.data: ", response.data);
    const generatedTestCases = response.data.choices[0].text;
    console.log("Generated test cases:", generatedTestCases);

    // Find the position of the first '{' character in the string
    const jsonStart = generatedTestCases.indexOf("{");

    // Slice the string from the first '{' character
    const jsonContent = generatedTestCases.slice(jsonStart);

    // Parse the JSON content
    const parsedTestCases = JSON.parse(jsonContent).testCases;

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
  const isCypressTest = req.headers["iscypresstest"] === "true";
  console.log("LOOK HERE!!!! Req.header: ", req.headers);
  //console.log("Req.Headers: ", req.headers);

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

  //console.log("isCypressTest: ", isCypressTest);
  if (process.env.MOCK_TEST_DATA === "true" || isCypressTest) {
    console.log("Mock data requested, returning mock test cases...");
    return res.status(200).json(MOCK_TEST_CASES);
    return res.status(200).json(MOCK_UNIT_TESTS);
  }

  // Create the data object to send to OpenAI's API
  const data = {
    model: "text-davinci-003",
    prompt:
      "Please provide the jest unit tests to test the following requirement: " +
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

app.get("/generate-integration-tests", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const isCypressTest = req.query["x-cypress-test"] === "true";

  // Get the requirements parameter from the query string
  const requirements = req.query.requirements;

  const MOCK_INTEGRATION_TESTS = `
    describe('TEST!!! View Listing Details', () => {
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

  if (process.env.MOCK_TEST_DATA === "true" || isCypressTest) {
    return res.status(200).json(MOCK_INTEGRATION_TESTS);
  }

  // Create the data object to send to OpenAI's API
  const integrationData = {
    model: "text-davinci-003",
    prompt:
      "Please provide the jest integration (not unit!) tests to test the following requirement: " +
      requirements,
    max_tokens: 1500,
    temperature: 0.4,
  };
  console.log(integrationData);

  // Set up the configuration object for the API request
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  try {
    // Send a POST request to OpenAI's API to generate the integration tests
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      integrationData,
      config
    );

    // Extract the generated integration tests from the API response
    const generatedIntegrationTests = response.data.choices[0].text;

    // Send the generated integration tests as a JSON response to the client
    res.json(generatedIntegrationTests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create route to handle requests to the /generate-e2e-tests endpoint
app.get("/generate-e2e-tests", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const requirements = req.query.requirements;
  const isCypressTest = req.query["x-cypress-test"] === "true";

  const MOCK_E2E_TESTS = `


    describe('TEST!!! View Listing Details', () => {
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

  if (process.env.MOCK_TEST_DATA === "true" || isCypressTest) {
    return res.status(200).json(MOCK_E2E_TESTS);
  }

  // Create the data object to send to OpenAI's API
  const e2eData = {
    model: "text-davinci-003",
    prompt: `Please provide the Cypress End to End tests to test the following requirement: ${requirements}. Here is an example of what the response should look like: 

    describe('Listing Search', () => {
      beforeEach(() => {
        // Visit the homepage
        cy.visit('http://www.airbnb.com');
      });

      it('should allow a guest to search by location', () => {
        cy.get('[data-cy=location-input]').type('New York');
        cy.get('[data-cy=search-submit]').click();
        cy.get('[data-cy=listing]').should('be.visible');
      });

      it('should allow a guest to search by dates', () => {
        cy.get('[data-cy=checkin-date-input]').type('2023-07-01');
        cy.get('[data-cy=checkout-date-input]').type('2023-07-10');
        cy.get('[data-cy=search-submit]').click();
        cy.get('[data-cy=listing]').should('be.visible');
      });

      it('should allow a guest to search by number of guests', () => {
        cy.get('[data-cy=guests-input]').type('4');
        cy.get('[data-cy=search-submit]').click();
        cy.get('[data-cy=listing]').should('be.visible');
      });

      it('should allow a guest to search by amenities', () => {
        cy.get('[data-cy=amenities-dropdown]').click();
        cy.get('[data-cy=amenities-wifi-checkbox]').check();
        cy.get('[data-cy=search-submit]').click();
        cy.get('[data-cy=listing]').should('be.visible');
      });

      it('should allow a guest to search by location, dates, number of guests, and amenities', () => {
        cy.get('[data-cy=location-input]').type('New York');
        cy.get('[data-cy=checkin-date-input]').type('2023-07-01');
        cy.get('[data-cy=checkout-date-input]').type('2023-07-10');
        cy.get('[data-cy=guests-input]').type('4');
        cy.get('[data-cy=amenities-dropdown]').click();
        cy.get('[data-cy=amenities-wifi-checkbox]').check();
        cy.get('[data-cy=search-submit]').click();
        cy.get('[data-cy=listing]').should('be.visible');
      });
    });`,
    max_tokens: 1500,
    temperature: 0.4,
  };

  //console.log(e2eData);
  // Set up the configuration object for the API request
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  try {
    // Send a POST request to OpenAI's API to generate the integration tests
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      e2eData,
      config
    );

    // Extract the generated End to End tests from the API response
    const generatedE2ETests = response.data.choices[0].text;

    // Send the generated integration tests as a JSON response to the client
    res.json(generatedE2ETests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/generate-test-cases-from-code", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Get the code parameter from the query string
  const code = req.query.code;
  console.log("Code!! " + code);

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

  // Create the data object to send to OpenAI's API
  const data = {
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates test cases in Gherkin syntax for provided code. Remember to include all negative cases, edge cases, and corner cases. Each test case should include a 'Test Case ID', 'Description', and 'Expected Result'.",
      },
      {
        role: "user",
        content:
          `Please provide all possible test cases associated with the following code in Gherkin syntax (Given, When, Then). In addition to happy path, include all negative cases, edge cases, and corner cases. Please include all the following information: Test Case ID, Description, and Expected Result. Provide the answer as a JSON object with keys for 'ID', 'Description', and 'Expected_Result'. ONLY INCLUDE THE JSON OBJECT. DO NOT SEND BACK ANY OTHER TEXT. ALSO, ONLY include the Given, When steps in the Description and ONLY the Then step should be included in the Expected Result. Be sure to start with the word Then in the Expected Result.  For example, Description: Given I am on the reset password page, When I enter an incorrect password. Expected Result: Then I am see an error message that says You have entered an incorrect email or password.  ` +
          code +
          `Here is an example of what the response should look like: [
            {
                "ID": 1,
                "Description": "Given I have sent a booking request to a host, When I receive an email or in-app notification",
                "Expected_Result": "Then I am informed that my booking has been accepted."
            },
            {
                "ID": 2,
                "Description": "Given I have received an email or in-app notification, When I open the app or log into the website",
                "Expected_Result": "Then I can see the booking confirmation in my dashboard."
            },
            {
                "ID": 3,
                "Description": "Given I can see the booking confirmation in my dashboard, When I click on the booking confirmation",
                "Expected_Result": "Then I am taken to a page containing more detailed information about the booking."
            }
           
        ]`,
      },
    ],
    max_tokens: 500,
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
      "https://api.openai.com/v1/chat/completions",
      data,
      config
    );
    console.log(
      "Raw output from the API: " +
        response.data.choices[0].message.content.trim()
    );

    console.log("Full API Response: " + JSON.stringify(response.data));

    // Extract the generated test cases from the API response
    const generatedTestCases = response.data.choices[0].message.content.trim();
    console.log("Generated END TO END Test Cases: " + generatedTestCases);
    const parsedTestCases = JSON.parse(generatedTestCases);
    console.log("Parsed Test Cases: " + JSON.stringify(parsedTestCases));

    // Send the parsed test cases as a JSON response to the client
    res.json(parsedTestCases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Define a route that generates unit tests based on user-provided requirements
app.get("/generate-unit-tests-from-code", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Get the requirements parameter from the query string
  const code = req.query.code;

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
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates unit tests for provided code. Each test should ensure the code behaves as expected. Please ensure you only provide the describe statements and the tests themselves. No need to include Import statements, etc. Include all of the code (DO NOT leave any code out!!). Please provide the Jest unit tests for the following code:\n\n" +
          code +
          "\n\nThe response should be formatted like this example:\n\n" +
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
      },
    ],
    max_tokens: 500,
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
      "https://api.openai.com/v1/chat/completions",
      data,
      config
    );

    // Extract the generated unit tests from the API response
    const generatedUnitTests = response.data.choices[0].message.content;

    // Send the generated unit tests as a JSON response to the client
    res.json(generatedUnitTests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/generate-integration-tests-from-code", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Get the requirements parameter from the query string
  const code = req.query.code;

  const MOCK_INTEGRATION_TESTS = `
    describe('TEST!!! View Listing Details', () => {
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
    return res.status(200).json(MOCK_INTEGRATION_TESTS);
  }

  // Create the data object to send to OpenAI's API
  const integrationData = {
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates integration tests for provided code. Each test should ensure the code behaves as expected. Please provide the Jest integration tests for the following code:\n\n" +
          code +
          "\n\nThe response should be formatted like this example:\n\n" +
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
      },
    ],
    max_tokens: 500,
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
    // Send a POST request to OpenAI's API to generate the integration tests
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      integrationData,
      config
    );

    // Extract the generated integration tests from the API response
    const generatedIntegrationTests = response.data.choices[0].message.content;

    // Send the generated integration tests as a JSON response to the client
    res.json(generatedIntegrationTests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create route to handle requests to the /generate-e2e-tests endpoint
app.get("/generate-e2e-tests-from-code", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const code = req.query.code;

  const MOCK_E2E_TESTS = `

    describe('TEST!!! View Listing Details', () => {
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
    return res.status(200).json(MOCK_E2E_TESTS);
  }

  // Create the data object to send to OpenAI's API
  const e2eData = {
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that generates Cypress End to End tests for provided code. Each test should ensure the code behaves as expected. Please provide the Cypress End to End tests to test the following code: ${code}. Here is an example of what the response should look like: 

describe('Listing Search', () => {
  beforeEach(() => {
    // Visit the homepage
    cy.visit('http://www.airbnb.com');
  });

  it('should allow a guest to search by location', () => {
    cy.get('[data-cy=location-input]').type('New York');
    cy.get('[data-cy=search-submit]').click();
    cy.get('[data-cy=listing]').should('be.visible');
  });

  it('should allow a guest to search by dates', () => {
    cy.get('[data-cy=checkin-date-input]').type('2023-07-01');
    cy.get('[data-cy=checkout-date-input]').type('2023-07-10');
    cy.get('[data-cy=search-submit]').click();
    cy.get('[data-cy=listing]').should('be.visible');
  });

  it('should allow a guest to search by number of guests', () => {
    cy.get('[data-cy=guests-input]').type('4');
    cy.get('[data-cy=search-submit]').click();
    cy.get('[data-cy=listing]').should('be.visible');
  });

  it('should allow a guest to search by amenities', () => {
    cy.get('[data-cy=amenities-dropdown]').click();
    cy.get('[data-cy=amenities-wifi-checkbox]').check();
    cy.get('[data-cy=search-submit]').click();
    cy.get('[data-cy=listing]').should('be.visible');
  });

  it('should allow a guest to search by location, dates, number of guests, and amenities', () => {
    cy.get('[data-cy=location-input]').type('New York');
    cy.get('[data-cy=checkin-date-input]').type('2023-07-01');
    cy.get('[data-cy=checkout-date-input]').type('2023-07-10');
    cy.get('[data-cy=guests-input]').type('4');
    cy.get('[data-cy=amenities-dropdown]').click();
    cy.get('[data-cy=amenities-wifi-checkbox]').check();
    cy.get('[data-cy=search-submit]').click();
    cy.get('[data-cy=listing]').should('be.visible');
  });
});`,
      },
    ],
    max_tokens: 500,
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
    // Send a POST request to OpenAI's API to generate the end-to-end tests
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      e2eData,
      config
    );

    // Extract the generated end-to-end tests from the API response
    const generatedE2ETests = response.data.choices[0].message.content;

    // Send the generated end-to-end tests as a JSON response to the client
    res.json(generatedE2ETests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//The following code is a React component. I want to implement e2e Cypress tests to test its functionality. Update the code directly with 'data-cy' locators that will be needed to successfully build the e2e Cypress tests

// New endpoint called /update-code-with-data-cy-locators
app.get("/update-code-with-data-cy-locators", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const code = req.query.code;

  const MOCK_E2E_TESTS = `


    describe('TEST!!! View Listing Details', () => {
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
    return res.status(200).json(MOCK_E2E_TESTS);
  }

  // Create the data object to send to OpenAI's API
  const data = {
    model: "text-davinci-003",
    prompt:
      "The following code is a React component. I want to implement e2e Cypress tests to test its functionality. Update the code directly with 'data-cy' locators that will be needed to successfully build the e2e Cypress tests. Please send back ALL of the updated code. Not just a snippet" +
      code,
    max_tokens: 1500,
    temperature: 0.4,
  };

  //console.log(e2eData);
  // Set up the configuration object for the API request
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  try {
    // Send a POST request to OpenAI's API to generate the integration tests
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      data,
      config
    );

    // Extract the generated End to End tests from the API response
    const updatedCode = response.data.choices[0].text;

    // Send the generated integration tests as a JSON response to the client
    res.json(updatedCode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/generate-a11y-report", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const USE_STUB_API = process.env.USE_STUB_API === "true";

  const apiUrl = USE_STUB_API
    ? "http://localhost:8080/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  // Get the requirements parameter from the query string
  const code = req.query.code;

  // Create the data object to send to OpenAI's API
  const data = {
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "system",
        content:
          "You are an expert in a11y software best practices, including WCAG. Please analyze the following code for accessibility issues / violations and provide a report with two sections: 1) WCAG Violations 2.0: A list of WCAG violations including a description and link / URL to the corresponding WCAG 2.0 violation and a description of how to resolve the violation. 2) WCAG Violations 2.1: A list of WCAG violations including a description and link / URL to the corresponding WCAG 2.1 violation and a description of how to resolve the violation. Don't forget the URLs!!! Also, provide the response with Markdown, so I can properly format it on my side :\n\n" +
          code,
      },
    ],
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
    const response = await axios.post(apiUrl, data, config);

    // Extract the generated unit tests from the API response
    const generatedA11yReport = response.data.choices[0].message.content;

    console.log(generatedA11yReport);

    // Send the generated unit tests as a JSON response to the client
    res.json({ report: generatedA11yReport });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server and listen for incoming requests
app
  .listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  })
  .on("error", (error) => {
    console.log("Error occurred:", error);
  });
