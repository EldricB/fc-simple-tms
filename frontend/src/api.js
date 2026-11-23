const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// API request wrapper that throws on any failure, including network errors and non-2xx responses.
async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch {
    // fetch only throws when the server can't be reached at all
    const error = new Error('Cannot reach the server. Make sure the backend is running.');
    error.messages = [error.message];
    throw error;
  }

  // If the response is not JSON, treat it as an error. This can happen if the server crashes and returns HTML.
  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    // Backend sends `errors` (array) on 400 and `message` on other failures
    const messages = body?.errors || [body?.message || 'Request failed'];
    const error = new Error(messages[0]);
    error.messages = messages;
    throw error;
  }
  return body.data;
}

export const fetchTransactions = () => request('/transactions');

export const createTransaction = (transaction) =>
  request('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
