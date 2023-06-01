import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Load environment variables from .env file
dotenv.config();

const PORT = 8000;

const app = express();

// Enable cross-origin resource sharing
app.use(cors());

// Enable Express to parse JSON bodies from POST requests
app.use(express.json());

// Create MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "<your_mysql_root_password>",
  database: "test_genie",
});

// Define a route that returns a simple string response
app.get("/hello", (req, res) => {
  res.json("Hello World");
});

// Define a route that generates test cases based on user-provided requirements
app.get("/test-cases", async (req, res) => {
  // Your existing '/test-cases' route code goes here...
});

// Define a route that saves test cases to the MySQL database
app.post("/store-test-cases", async (req, res) => {
  try {
    const testCases = req.body;

    for (let testCase of testCases) {
      const { ID, Description, Expected_Result, Actual_Result, Status } =
        testCase;

      await db.execute(
        "INSERT INTO test_cases (ID, Description, Expected_Result, Actual_Result, Status) VALUES (?, ?, ?, ?, ?)",
        [ID, Description, Expected_Result, Actual_Result, Status]
      );
    }

    res.status(201).json({ message: "Test cases saved successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred." });
  }
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
