require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Kintone → Slack Webhook Listener');
});

// Kintone webhook endpoint
app.post('/kintone-webhook', async (req, res) => {
  console.log('Received Kintone webhook:', req.body);
  try {
    const record = req.body.record;
    const message = `New Kintone Record Added: ${record.Text.value}`; // Adjust field code

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

// app.listen(3000, () => {
//   console.log('SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL || 'Not set');
//   console.log('Server running on http://localhost:3000');
// });

module.exports = app;
