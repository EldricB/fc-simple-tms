const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_PATH = process.env.CSV_PATH || path.join(__dirname, '../data/transactions.csv');
const HEADER = 'Transaction Date,Account Number,Account Holder Name,Amount,Status\n';

// Writes one at a time so concurrent POSTs cannot interleave.
let writeQueue = Promise.resolve();
const enqueue = (task) => {
  const result = writeQueue.then(task);
  writeQueue = result.catch(() => {});
  return result;
};

// Formats CSV values according to RFC 4180.
const escapeCsv = (value) => {
  const s = String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Reads the CSV file and returns an array of transactions.
// If the file does not exist, returns an empty array.
const readTransactions = () =>
  new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(CSV_PATH)
      // pipe() does not forward errors; without this a missing file crashes the process
      .on('error', (err) => (err.code === 'ENOENT' ? resolve([]) : reject(err)))
      .pipe(csv())
      .on('data', (row) =>
        rows.push({
          transactionDate: row['Transaction Date'],
          accountNumber: row['Account Number'],
          accountHolderName: row['Account Holder Name'],
          amount: Number(row['Amount']),
          status: row['Status'],
        })
      )
      .on('error', reject)
      .on('end', () => resolve(rows));
  });

// Appends a transaction to the CSV file.
// If the file does not exist, creates it with a header.
// If the last line is unterminated, adds a newline before appending.
const appendTransaction = (t) =>
  enqueue(async () => {
    let existing = '';
    try {
      existing = await fs.promises.readFile(CSV_PATH, 'utf8');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    // New file/empty file: write header. Unterminated last line: add the missing newline.
    const prefix = existing === '' ? HEADER : existing.endsWith('\n') ? '' : '\n';
    const row = [
      t.transactionDate,
      escapeCsv(t.accountNumber),
      escapeCsv(t.accountHolderName),
      t.amount.toFixed(2),
      t.status,
    ].join(',');
    await fs.promises.appendFile(CSV_PATH, `${prefix}${row}\n`);
  });

module.exports = { readTransactions, appendTransaction };
