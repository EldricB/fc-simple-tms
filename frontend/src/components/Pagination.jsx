import { ChevronLeft, ChevronRight } from 'lucide-react';

// Builds the page buttons to display, e.g. [1, '…', 4, 5, 6, '…', 10].
function getPageItems(page, totalPages) {
  // A Set removes duplicates automatically (e.g. page 1 would otherwise add "1" twice)
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);

  // Right at either end, also include the page next to the edge so the list reads "1 2 … 10"
  if (page <= 2) {
    wanted.add(2);
  }
  if (page >= totalPages - 1) {
    wanted.add(totalPages - 1);
  }

  // Drop out-of-range numbers (page - 1 can be 0, page + 1 can exceed the last page) and sort ascending
  const sorted = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  // Walk through the sorted pages and fill in "…" wherever pages were skipped
  const items = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined) {
      if (p - prev === 2) items.push(prev + 1); // only one page skipped: show it instead of "…"
      else if (p - prev > 2) items.push('…'); // two or more skipped: collapse them into "…"
    }
    items.push(p);
  });
  return items;
}

// Purely presentational: it holds no state. The parent (TransactionTable) owns the current
// page and page size, and this component only displays them and reports user actions back.
function Pagination({
  page,
  totalPages,
  pageSize,
  pageSizeOptions,
  shown,
  total,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div className="pagination">
      {/* Left side: rows-per-page selector and the "x out of y" summary */}
      <div className="pagination-info">
        <label>
          Show{' '}
          {/* Number() is needed because event values are always strings, but page size is a number */}
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        {/* "shown" is the number of rows on this page, so the last page can read e.g. "5 out of 100" */}
        <span>
          {shown} out of {total} transactions
        </span>
      </div>

      {/* Right side: previous, page numbers, next. <nav> + aria-label lets screen readers jump to it */}
      <nav className="pagination-pages" aria-label="Pagination">
        {/* Icon-only button, so aria-label gives screen readers the name the text used to provide.
            Disabled on the first page so it can't go to page 0. */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        {getPageItems(page, totalPages).map((item, i) =>
          item === '…' ? (
            // Not a button, so it can't be clicked. Its position is part of the key because
            // there can be two of them (e.g. "1 … 4 5 6 … 10") and they have no value of their own.
            // aria-hidden: screen readers would otherwise read it out as punctuation.
            <span key={`gap-${i}`} className="pagination-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              // Marks the current page for screen readers; the CSS also uses it to highlight the button
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        {/* Disabled on the last page so it can't go past the end */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
