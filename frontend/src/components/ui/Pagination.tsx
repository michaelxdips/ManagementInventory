import clsx from 'clsx';

type Props = {
  current: number;
  total: number;
  onChange: (page: number) => void;
};

const Pagination = ({ current, total, onChange }: Props) => {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1).slice(0, 11);

  return (
    <div className="pagination">
      <button
        type="button"
        className="page-btn"
        disabled={current === 1}
        onClick={() => onChange(Math.max(1, current - 1))}
      >
        « Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={clsx('page-number', p === current && 'is-active')}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      {total > pages.length && <span className="page-ellipsis">…</span>}
      <button
        type="button"
        className="page-btn"
        disabled={current === total}
        onClick={() => onChange(Math.min(total, current + 1))}
      >
        Next »
      </button>
    </div>
  );
};

export default Pagination;
