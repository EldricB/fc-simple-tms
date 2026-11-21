const STATUS_COLORS = {
  Pending: 'gold',
  Settled: 'green',
  Failed: 'red',
};

function TransactionTable({ transactions }) {
  if (transactions.length === 0) {
    return <p>No transactions yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Transaction Date</th>
          <th>Account Number</th>
          <th>Account Holder Name</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t, index) => (
          // Rows are keyed by account number + date + index to avoid collisions if the same transaction is added twice.
          <tr key={`${t.accountNumber}-${t.transactionDate}-${index}`}>
            <td>{t.transactionDate}</td>
            <td>{t.accountNumber}</td>
            <td>{t.accountHolderName}</td>
            <td>{Number.isFinite(t.amount) ? t.amount.toFixed(2) : '—'}</td>
            <td style={{ color: STATUS_COLORS[t.status] || 'gray', fontWeight: 'bold' }}>
              {t.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TransactionTable;