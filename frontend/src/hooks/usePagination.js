import { useState, useMemo, useEffect } from 'react';

/**
 * Custom React hook for robust pagination with dropdown options (5, 10, 15, 20)
 * Works seamlessly with arrays and local/backend data in Efoy Hotel dashboards.
 *
 * @param {Array} items - List of items to paginate
 * @param {number} initialPageSize - Default items per page (default: 5)
 */
export function usePagination(items = [], initialPageSize = 5) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset or clamp current page if items change (e.g. searching, filtering, deleting)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const validPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (validPage - 1) * pageSize;
    return safeItems.slice(start, start + pageSize);
  }, [safeItems, currentPage, pageSize, totalPages]);

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedItems,
    resetPage,
  };
}

export default usePagination;
