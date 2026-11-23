import { useState } from 'react';
import { createTransaction } from '../api';

const EMPTY_FORM = {
  transactionDate: '',
  accountNumber: '',
  accountHolderName: '',
  amount: '',
};

function AddTransactionModal({ onClose, onAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Handler for all input changes. The name of the input must match the key in the form state.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      const created = await createTransaction(form);
      onAdded(created); // Parent adds the new transaction to the list and closes the modal.
    } catch (err) {
      // Show every message the backend returned, or the single network error.
      setErrors(err.messages || [err.message]);
    } finally {
      setSubmitting(false); // Re-enables the buttons so the user can fix the input and retry.
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="transactionDate">Transaction Date</label>
            <input
              id="transactionDate"
              name="transactionDate"
              type="date"
              value={form.transactionDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="accountNumber">Account Number</label>
            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              placeholder="1234-5678-9012"
              pattern="\d{4}-\d{4}-\d{4}"
              title="Format: 1234-5678-9012"
              maxLength={14}
              value={form.accountNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="accountHolderName">Account Holder Name</label>
            <input
              id="accountHolderName"
              name="accountHolderName"
              type="text"
              maxLength={100}
              value={form.accountHolderName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          {errors.length > 0 && (
            <ul role="alert">
              {errors.map((msg, i) => (
                <li key={`${i}-${msg}`}>{msg}</li>
              ))}
            </ul>
          )}

          <button type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          {/* Disabled while saving to prevent a double click from creating two transactions */}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
