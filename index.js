require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json());

// Kintone webhook endpoint
app.post('/kintone-webhook', async (req, res) => {
  console.log('Received Kintone webhook:', req.body);
  try {
      const record = req.body.record;
      let message = '';
      const event = req.body.event;

      if (event === 'app.record.create.submit') {
        message = `New Kintone Record Added: ${record.Text.value}`;
      } else if (event === 'app.record.edit.submit') {
        message = `Kintone Record Updated: ${record.Text.value}`;
      } else if (event === 'app.record.delete.submit') {
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

// app.listen(3000, () => {
//   console.log('SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL || 'Not set');
//   console.log('Server running on http://localhost:3000');
// });

module.exports = app;
