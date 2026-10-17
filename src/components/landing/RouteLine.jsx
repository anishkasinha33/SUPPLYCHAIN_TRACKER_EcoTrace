const NODES = [
  ['Material source', 'Kesarpada, Sundarpur'], ['Supplier', 'GreenWeave Textiles'], ['Processing', 'Nandipur mill'],
  ['Manufacturing', 'Riverbend Stitch Works'], ['Transport', '525 km by rail'], ['Warehouse', 'Bandarpada, Nav Sagarpur'], ['Your customer', 'Deepghat, Sagarpur'],
];

/** The hero's single orchestrated moment: the route draws once, then the stops appear in order. */
export function RouteLine() {
  const W = 1200, step = (W - 160) / (NODES.length - 1);
  const pts = NODES.map((_, i) => ({ x: 80 + i * step, y: i % 2 === 0 ? 70 : 130 }));
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], mx = (a.x + b.x) / 2; d += ` C${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`; }
  return (
    <div className="routeline">
      <svg viewBox="0 0 1200 230" role="img" aria-label="A product's route: material source, supplier, processing, manufacturing, transport, warehouse and customer">
        <path d={d} className="routeline__path" pathLength="1" fill="none" strokeLinecap="round" />
        {NODES.map(([name, sub], i) => (
          <g key={name} className="routeline__node" style={{ animationDelay: `${0.5 + i * 0.32}s` }} transform={`translate(${pts[i].x} ${pts[i].y})`}>
            <circle r="9" />
            <text y={i % 2 === 0 ? -42 : 40} textAnchor="middle" className="routeline__name">{name}</text>
            <text y={i % 2 === 0 ? -25 : 57} textAnchor="middle" className="routeline__sub">{sub}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
