const axios = require('axios');
require('dotenv').config();

async function testGroq() {
  try {
    console.log("API KEY EXISTS:", !!process.env.GROQ_API_KEY);
    console.log("API KEY PREVIEW:", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + "..." : "MISSING");

    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Return only valid JSON."
          },
          {
            role: "user",
            content: "Generate 2 MCQs on DBMS normalization in JSON format with questions array."
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("GROQ API SUCCESS!");
    console.log("STATUS:", res.status);
    console.log("FULL RESPONSE:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("GROQ TEST ERROR:", err.response?.data || err.message);
    console.error("STATUS:", err.response?.status);
    if (err.response?.data) {
      console.error("ERROR DETAILS:", JSON.stringify(err.response.data, null, 2));
    }
  }
}

testGroq();
