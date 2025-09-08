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
      let message = '';
      // Determine event type (add, update, delete)
      const eventType = req.body.eventType || 'add'; // You may need to adjust this based on your webhook payload

      if (eventType === 'add') {
        message = `New Kintone Record Added: ${record.Text.value}`;
      } else if (eventType === 'update') {
        message = `Kintone Record Updated: ${record.Text.value}`;
      } else if (eventType === 'delete') {
        message = `Kintone Record Deleted: ${record.Text.value}`;
      } else {
        message = `Kintone Record Event: ${eventType} - ${record.Text.value}`;
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

// app.listen(3000, () => {
//   console.log('SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL || 'Not set');
//   console.log('Server running on http://localhost:3000');
// });

module.exports = app;
