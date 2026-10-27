import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Universal Luxury Pagination Component for Efoy Hotel & Suites Dashboards
 * Supports 5, 10, 15, 20 items per page with dropdown and full pagination workflow.
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 15, 20],
  itemLabel = 'entries',
}) {
  if (totalItems === 0) return null;

  const validCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-gray-100 text-xs text-gray-600 rounded-b-xl select-none">
      {/* Left side: Rows per page selector & display count */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-medium">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              if (onPageSizeChange) onPageSizeChange(newSize);
              if (onPageChange) onPageChange(1);
            }}
            aria-label="Rows per page"
            className="bg-gray-50 border border-gray-200 text-dark-900 rounded-md px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-gold-500/50 cursor-pointer shadow-xs hover:border-gold-500/50 transition-colors"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <span className="text-gray-300 hidden sm:inline">|</span>

        <span className="text-gray-500">
          Showing <span className="font-semibold text-dark-900">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
          <span className="font-semibold text-dark-900">{endIndex}</span> of{' '}
          <span className="font-semibold text-dark-900">{totalItems}</span> {itemLabel}
        </span>
      </div>

      {/* Right side: Navigation buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={validCurrentPage === 1}
          title="First page"
          className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-dark-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          title="Previous page"
          className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-dark-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1 text-gray-400 font-medium">
                  •••
                </span>
              );
            }
            const isActive = p === validCurrentPage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage === totalPages}
          title="Next page"
          className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-dark-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight size={14} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={validCurrentPage === totalPages}
          title="Last page"
          className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-dark-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
