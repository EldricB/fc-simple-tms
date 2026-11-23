import { useState } from 'react';
import Pagination from './Pagination';

const STATUS_CLASSES = {
  Pending: 'status-pending',
  Settled: 'status-settled',
  Failed: 'status-failed',
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// en-PH: Philippine Peso
const currency = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

function TransactionTable({ transactions }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const total = transactions.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.min(page, totalPages); // safety net: the page can never point past the end
  const start = (currentPage - 1) * pageSize;
  const visible = transactions.slice(start, start + pageSize);

  // A different page size changes how many pages exist, so go back to page 1
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <table caption="Transactions">
      {transactions.length > 0 && (
        <thead>
          <tr>
            <th>Transaction Date</th>
            <th>Account Number</th>
            <th>Account Holder Name</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
      )}
      <tbody>
        {visible.length > 0 ? (
          visible.map((t, index) => (
            <tr key={`${t.accountNumber}-${t.transactionDate}-${start + index}`}>
              <td>{t.transactionDate}</td>
              <td>{t.accountNumber}</td>
              <td>{t.accountHolderName}</td>
              <td>{Number.isFinite(t.amount) ? currency.format(t.amount) : '—'}</td>
              <td>
                <span className={`status ${STATUS_CLASSES[t.status] || 'status-unknown'}`}>
                  {t.status}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <p colSpan={5} className="empty-table">
              No transactions yet.
            </p>
          </tr>
        )}
      </tbody>
      {transactions.length > 0 ? (
        <tfoot>
          <tr>
            <td colSpan={5}>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                shown={visible.length}
                total={total}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </td>
          </tr>
        </tfoot>
      ) : (
        <tr className="empty-footer"></tr>
      )}
    </table>
  );
}

export default TransactionTable;
