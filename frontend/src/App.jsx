import { useEffect, useState } from 'react';
import { fetchTransactions } from './api';
import TransactionTable from './components/TransactionTable';
import AddTransactionModal from './components/AddTransactionModal';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load the transactions once when the component mounts. If it fails, show the error and don't allow adding new transactions.
  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // When a new transaction is added, append it to the list and close the modal.
  const handleAdded = (newTransaction) => {
    setTransactions((prev) => [...prev, newTransaction]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Transaction Management System</h1>
      {/* Disabled until the list has loaded, so a transaction can't be added to a table that failed to load */}
      <button onClick={() => setIsModalOpen(true)} disabled={loading || !!error}>
        Add Transaction
      </button>

      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && <TransactionTable transactions={transactions} />}

      {/* Modal for adding a new transaction */}
      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}

export default App;
