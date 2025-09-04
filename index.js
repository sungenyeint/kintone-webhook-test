const express = require('express');
const fs = require('fs');
const ExcelJS = require('exceljs');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Kintone to Excel Webhook Listener');
});

app.post('/kintone-webhook', async (req, res) => {
  const record = req.body.record; // webhook payload

  // Create a new Excel workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Records');

  // Add header row
  sheet.addRow(['Customer', 'Inquiry', 'Status']);

  // Add record data (adjust field codes)
  sheet.addRow([record.customer.value, record.inquiry.value, record.status.value]);

  // Save Excel file
  await workbook.xlsx.writeFile('kintone_records.xlsx');

  console.log('Excel updated!');
  res.status(200).send('OK');
});

module.exports = app;
