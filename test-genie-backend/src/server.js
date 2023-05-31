import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PORT = 8000;

const app = express();

app.use(cors());

app.get("/hello", (req, res) => {
  res.json("Hello World");
});

app.get("/test-cases", async (req, res) => {
  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const requirements = req.query.requirements;
  console.log(requirements);

  console.log(API_KEY);

  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content:
          "Please provide the test cases associated with these requirements. Please include all the following information: Test Case ID, Description, and Expected Result. Provide the answer as a json object with keys for ID, Description, and Expected_Result: " +
          requirements,
      },
    ],
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
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

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
