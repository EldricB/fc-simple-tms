const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvFilePath = path.join(__dirname, '../data/transactions.csv');

// Data Fetcher : Reads the CSV file.
const getTransactions = (req, res) => {
  const transactions = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      transactions.push({
        transactionDate: row['Transaction Date'],
        accountNumber: row['Account Number'],
        accountHolderName: row['Account Holder Name'],
        amount: Number(row['Amount']),
        status: row['Status'],
      });
    })
    .on('end', () => {
      res.status(200).json({
        success: true,
        data: transactions,
      });
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to read transactions' });
    });
};

// Status Fetcher : Randomly assigns a status to newly added transactions.
const status = ['Pending', 'Completed', 'Failed'];
const getRandomStatus = () => {
  const randomIndex = Math.floor(Math.random() * status.length);
  return status[randomIndex];
};

const escapeCsvValue = (value) => {
  if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// Data Validator : Validates the data before adding it to the table.
const validateTransactionData = (transactionDate, accountNumber, accountHolderName, amount) => {const errors = [];
  // Date Format : YYYY-MM-DD
  if (!transactionDate || !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
    errors.push('Invalid transaction date. Expected format: YYYY-MM-DD');
  } else {
    const date = new Date(`${transactionDate}T00:00:00.00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== transactionDate) {
      errors.push('Invalid transaction date. Expected format: YYYY-MM-DD');
    }
  }
  // Account Number
  if (typeof accountNumber !== 'string' || accountNumber.trim() === '') {
    errors.push('Account number is required and must be a non-empty string');
  }
  // Account Holder Name
  if (typeof accountHolderName !== 'string' || accountHolderName.trim() === '') {
    errors.push('Account holder name is required and must be a non-empty string');
  }
  // Amount
  if (amount === undefined || amount === null || amount === '' || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    errors.push('Amount is required and must be a positive number');
  }
  return errors;
}

// Add Transaction : Adds a transaction to the bottom of the table, assigns a random status.
const addTransaction = (req, res) => {
  const { transactionDate, accountNumber, accountHolderName, amount } = req.body;
  const status = getRandomStatus();
  
  const validateErrors = validateTransactionData(req.body);
  if (validateErrors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: validateErrors,
    });
  }

  const newTransaction = {
    transactionDate,
    accountNumber,
    accountHolderName,
    amount: Number(amount),
    status,
  };

  const csvRow = [
    escapeCsvValue(newTransaction.transactionDate),
    escapeCsvValue(newTransaction.accountNumber),
    escapeCsvValue(newTransaction.accountHolderName),
    escapeCsvValue(newTransaction.amount),
    escapeCsvValue(newTransaction.status),
  ].join(',') + '\n';

  fs.appendFile(csvFilePath, csvRow, (err) => {
    if (err) {
      console.error('Error writing to CSV file:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to add transaction',
      });
    } else {
      res.status(201).json({
        success: true,
        data: newTransaction,
      });
    }
  });
};

module.exports = {
  getTransactions,
  addTransaction,
};