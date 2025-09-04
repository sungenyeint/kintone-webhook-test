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

    const filePath = 'kintone_records.xlsx';
    const workbook = new ExcelJS.Workbook();
    let sheet;

    // If file exists, read and append; else, create new
    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      sheet = workbook.getWorksheet('Records') || workbook.worksheets[0];
    } else {
      sheet = workbook.addWorksheet('Records');
      sheet.addRow(['Text']); // Header row
    }

    // Add new record row (fieldCode: Text)
    sheet.addRow([record.Text.value]);

    await workbook.xlsx.writeFile(filePath);
    console.log('Excel updated!');
    res.status(200).send('OK');
});

module.exports = app;
