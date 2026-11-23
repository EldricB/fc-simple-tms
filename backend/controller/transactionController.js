const { readTransactions, appendTransaction } = require('../lib/csvStore');
const { validateTransaction, STATUSES } = require('../lib/transactionValidator');

const getRandomStatus = () => STATUSES[Math.floor(Math.random() * STATUSES.length)];


// GET /transactions
const getTransactions = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: await readTransactions() });
  } catch (err) {
    console.error('Error reading CSV file:', err);
    res.status(500).json({ success: false, message: 'Failed to read transactions' });
  }
};

// POST /transactions
const addTransaction = async (req, res) => {
  const { errors, value } = validateTransaction(req.body); // Validate before adding status.
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Add a random status to the validated transaction.
  const newTransaction = { ...value, status: getRandomStatus() };

  try {
    await appendTransaction(newTransaction);
    res.status(201).json({ success: true, data: newTransaction });
  } catch (err) {
    console.error('Error writing to CSV file:', err);
    res.status(500).json({ success: false, message: 'Failed to add transaction' });
  }
};

module.exports = { getTransactions, addTransaction };
