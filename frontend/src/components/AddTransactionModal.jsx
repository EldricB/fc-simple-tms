import { useState } from 'react';
import { createTransaction } from '../api';

const checkAmount = (e) => {
  const v = e.target.value;
  let message = '';
  if (/e/i.test(v)) message = 'Enter a plain number, without "e"';
  else if (v !== '' && Number(v) <= 0) message = 'Amount must be greater than 0';
  else if (/\.\d{3,}/.test(v)) message = 'Use at most 2 decimal places';
  e.target.setCustomValidity(message);
};

const formatAccountNumber = (value) =>
  value.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1-');

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
  // The account number is reformatted on every keystroke and paste
  setForm((prev) => ({
    ...prev,
    [name]: name === 'accountNumber' ? formatAccountNumber(value) : value,
  }));
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
        <h2 className="modal-title">Add Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-combined-div">
            <div className="modal-combined-child">
              <div className="modal-label">
                <label htmlFor="transactionDate">Transaction Date</label>
                <span className="required">*</span>
              </div>
              <input
                className="modal-input-date"
                id="transactionDate"
                name="transactionDate"
                type="date"
                value={form.transactionDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="modal-combined-child">
              <div className="modal-label">
                <label htmlFor="accountNumber">Account Number</label>
                <span className="required">*</span>
              </div>
              <input
                className="modal-input-actnum"
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
          </div>
          <div className="modal-div">
            <div className="modal-label">
              <label htmlFor="accountHolderName">Account Holder Name</label>
              <span className="required">*</span>
            </div>
            <input
              className="modal-input"
              id="accountHolderName"
              name="accountHolderName"
              type="text"
              maxLength={100}
              value={form.accountHolderName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="modal-div">
            <div className="modal-label">
              <label htmlFor="amount">Amount (PHP)</label>
              <span className="required">*</span>
            </div>
            <input
              className="modal-input"
              id="amount"
              name="amount"
              type="number"
              step="any"
              min="0"
              max="999999999.99"
              value={form.amount}
              onChange={handleChange}
              onInput={checkAmount}
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
          <div className="button-container">
            <button className="btn" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            {/* Disabled while saving to prevent a double click from creating two transactions */}
            <button className="btn primary-btn" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;
