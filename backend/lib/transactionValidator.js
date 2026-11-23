const STATUSES = ['Pending', 'Settled', 'Failed'];

const isRealDate = (str) => {
  const d = new Date(`${str}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
};

const ACCOUNT_NUMBER_FORMAT = /^(\d{12}|\d{4}-\d{4}-\d{4})$/;
const ACCOUNT_HOLDER_NAME_FORMAT = /^\p{L}[\p{L}\p{M}\s.\u0027\u2019-]*$/u;
const AMOUNT_FORMAT = /^\d{1,9}(\.\d{1,2})?$/;

/**
 * Validates and normalizes a POST body.
 * Returns { errors } on failure, or { errors: [], value } on success.
 *
 * Expected format:
 * Date: YYYY-MM-DD
 * Account Number: 1234-5678-9012 or 123456789012
 * Account Holder Name: John Smith
 * Amount: 99.99
 */

const validateTransaction = (body) => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body must be a JSON object'] };
  }

  const { transactionDate, accountNumber, accountHolderName, amount } = body;
  const errors = [];

  if (typeof transactionDate !== 'string' || !isRealDate(transactionDate)) {
    errors.push('Transaction date must be a valid date in YYYY-MM-DD format');
  }

  const rawAccountNumber = typeof accountNumber === 'string' ? accountNumber.trim() : '';
  if (!ACCOUNT_NUMBER_FORMAT.test(rawAccountNumber)) {
    errors.push('Account number must be 12 digits, with or without dashes (1234-5678-9012 or 123456789012)');
  }
  const acct = rawAccountNumber.replace(/-/g, '').replace(/(\d{4})(?=\d)/g, '$1-');

  const name = typeof accountHolderName === 'string' ? accountHolderName.trim().replace(/\s+/g, ' ') : '';
  if (!name || name.length > 100 || !ACCOUNT_HOLDER_NAME_FORMAT.test(name)) {
    errors.push('Account holder name is required (max 100 characters; letters, spaces, apostrophes, periods and hyphens only)');
  }

  const amountStr = typeof amount === 'number' ? String(amount) : typeof amount === 'string' ? amount.trim() : '';
  if (!AMOUNT_FORMAT.test(amountStr) || Number(amountStr) <= 0) {
    errors.push('Amount must be greater than 0, with at most 2 decimal places (max 999,999,999.99)');
  }

  // Return the formatted values, then the controller stores it.
  if (errors.length > 0) return { errors };
  return {
    errors,
    value: { transactionDate, accountNumber: acct, accountHolderName: name, amount: Number(amountStr) },
  };
};

module.exports = { validateTransaction, STATUSES };
