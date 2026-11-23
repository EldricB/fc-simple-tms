import { useEffect, useState } from 'react';
import { fetchTransactions } from './api';
import { Plus } from 'lucide-react';
import TransactionTable from './components/TransactionTable';
import AddTransactionModal from './components/AddTransactionModal';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load the list once, when the page first renders (the empty [] means "run only once")
  useEffect(() => {
    fetchTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false)); // runs on success AND failure, so "Loading..." never sticks
  }, []);

  // Called by the modal after the API confirms the save.
  // We append the record the server returned instead of refetching the whole list.
  const handleAdded = (newTransaction) => {
    setTransactions((prev) => [...prev, newTransaction]);
    setIsModalOpen(false);
  };

  // True only when the list loaded successfully. Used for the count, the button and the table.
  const isReady = !loading && !error;

  return (
    <div>
      <h1>Transaction Management System</h1>
      <div className="page-header">
        <div className="page-header-text">
          <h2>
            Transactions
            {isReady && <span className="transaction-count">{transactions.length} total</span>}
          </h2>
          <p>Lists financial transactions with dates, details, and amounts.</p>
        </div>
        {/* Disabled until the list has loaded, so a transaction can't be added to a table that failed to load */}
        <button className="btn primary-btn" onClick={() => setIsModalOpen(true)} disabled={!isReady}>
          <Plus size={16} aria-hidden="true" />
          Add
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {isReady && <TransactionTable transactions={transactions} />}
      {/* Rendering the modal only when open means its form state resets every time it opens */}
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