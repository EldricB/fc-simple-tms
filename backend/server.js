const express = require('express');
const cors = require('cors');
const { getTransactions } = require('./controller/transactionController');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
  });
});

app.get('/transactions', getTransactions);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});