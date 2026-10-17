export function PageHead({ title, children, actions, kicker }) {
  return (
    <header className="page-head">
      <div>
        {kicker && <p className="page-head__kicker">{kicker}</p>}
        <h1>{title}</h1>
        {children && <p className="lead page-head__sub">{children}</p>}
      </div>
      {actions && <div className="page-head__actions">{actions}</div>}
    </header>
  );
}

export function Section({ title, aside, children, id, className = '' }) {
  return (
    <section className={`block ${className}`} aria-labelledby={id}>
      <div className="block__head">
        <h2 id={id}>{title}</h2>
        {aside && <div className="block__aside">{aside}</div>}
      </div>
      {children}
    </section>
  );
}
