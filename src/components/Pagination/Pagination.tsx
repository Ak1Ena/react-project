import { type FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function buildPages(current: number, last: number): (number | 'ellipsis')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < last - 1) pages.push('ellipsis');
  pages.push(last);
  return pages;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  total,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const pages = buildPages(currentPage, totalPages);

  const goto = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange(p);
  };

  return (
    <nav className={styles.pagination} aria-label="Catalog pagination">
      <button
        className={styles.pageBtn}
        onClick={() => goto(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === currentPage ? styles.active : ''}`}
            onClick={() => goto(p)}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        className={styles.pageBtn}
        onClick={() => goto(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
      <span className={styles.summary}>
        {total === 0
          ? '0 results'
          : `${(currentPage - 1) * pageSize + 1}–${Math.min(
              currentPage * pageSize,
              total
            )} of ${total}`}
      </span>
    </nav>
  );
};

export default Pagination;
