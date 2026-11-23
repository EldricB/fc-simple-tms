const express = require('express');
const cors = require('cors');
const { getTransactions, addTransaction } = require('./controller/transactionController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/transactions', getTransactions);
app.post('/transactions', addTransaction);

// 404 handler for any other routes.
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler: malformed JSON (400), oversized body (413), anything else (500).
// Internal details are logged, never sent to the client.
app.use((err, req, res, next) => {
  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  const message =
    status === 500 ? 'Internal server error' : status === 413 ? 'Request body too large' : 'Invalid JSON body';
  res.status(status).json({ success: false, message });
});

// Only listen when running directly, not when imported for testing.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
}

module.exports = app;
