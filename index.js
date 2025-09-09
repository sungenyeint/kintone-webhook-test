require('dotenv').config();
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json());

// allow all origins (or restrict to your Kintone domain)
app.use(cors({
  origin: process.env.KINTONE_DOMAIN,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Kintone webhook endpoint
app.post('/kintone-webhook', async (req, res) => {
  console.log('Received Kintone webhook:', req.body);
  try {
    const record = req.body.record;
    let message = '';
    const type = req.body.type;

    if (type === 'ADD_RECORD') {
      message = `New Kintone Record Added: ${record.Text.value}`;
    } else if (type === 'UPDATE_RECORD') {
      message = `Kintone Record Updated: ${record.Text.value}`;
    } else if (type === 'DELETE_RECORD') {
      message = `Kintone Record Deleted: ${record.Text.value}`;
    } else {
      message = `Kintone Record Event`;
    }

    // Send message to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: message
    });

    console.log('Slack notification sent:', message);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Error sending to Slack:', err);
    res.status(500).send('Error');
  }
});

app.options("/chat", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.KINTONE_DOMAIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages
      })
    });

    const data = await response.json();
    console.log("OpenAI response:", data);

    if (!response.ok || !data.choices) {
      return res.status(400).json({
        error: data.error || { message: "No choices returned from OpenAI" }
      });
    }

    res.setHeader("Access-Control-Allow-Origin", process.env.KINTONE_DOMAIN || "*");
    res.json(data);
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({
      error: { message: err.message || "Internal Server Error" }
    });
  }
});

// app.listen(3000, () => {
//   console.log('SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL || 'Not set');
//   console.log('Server running on http://localhost:3000');
// });

module.exports = app;
