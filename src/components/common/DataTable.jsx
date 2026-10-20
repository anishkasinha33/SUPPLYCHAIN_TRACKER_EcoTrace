import { Link } from 'react-router-dom';

/**
 * Ledger-style table. On small screens each row becomes a stacked block with labels
 * (CSS reads the data-label attribute), so there is no sideways scrolling.
 * columns: [{ key, label, render?(row), primary?, align? }]
 */
export function DataTable({ columns, rows, getHref, caption, rowKey = 'id' }) {
  return (
    <table className="ledger">
      {caption && <caption className="visually-hidden">{caption}</caption>}
      <thead>
        <tr>{columns.map((c) => <th key={c.key} scope="col" className={c.align === 'end' ? 'text-end' : ''}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[rowKey]}>
            {columns.map((c) => {
              const content = c.render ? c.render(row) : row[c.key];
              return (
                <td key={c.key} data-label={c.label} className={`${c.primary ? 'ledger__primary' : ''} ${c.align === 'end' ? 'text-end' : ''}`}>
                  {c.primary && getHref ? <Link to={getHref(row)}>{content}</Link> : content}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
