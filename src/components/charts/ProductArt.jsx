// Generated, licence-free product imagery: a pattern per product, tinted by category.
const PALETTES = {
  Bags: ['#c9b79a', '#3b3226'], 'Home textiles': ['#b7c3b5', '#26362c'], 'Home & office': ['#d2c4a4', '#4a3d22'],
  Drinkware: ['#aeb9bf', '#1f2e38'], Fitness: ['#c3a79a', '#3d2a22'], Packaging: ['#cfc7b4', '#3a3629'],
  'Personal care': ['#d8c9b0', '#4a3a28'], Apparel: ['#9eb0b3', '#1d2f33'],
};
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function ProductArt({ product, ratio = '4 / 3', className = '' }) {
  const [bg, fg] = PALETTES[product.category] || ['#c8c5b8', '#2a2d2a'];
  const h = hash(product.id + product.name);
  const lines = 9 + (h % 5);
  const amp = 6 + (h % 14);
  const phase = (h % 360) * (Math.PI / 180);
  const rows = [];
  for (let i = 0; i < lines; i++) {
    const y = 20 + (i * 160) / lines;
    let d = `M-10 ${y}`;
    for (let x = 0; x <= 210; x += 10) d += ` L${x} ${(y + Math.sin(x / 26 + phase + i * 0.3) * amp).toFixed(1)}`;
    rows.push(d);
  }
  const cx = 40 + (h % 120);
  return (
    <svg className={`art ${className}`} style={{ aspectRatio: ratio }} viewBox="0 0 200 150" role="img" aria-label={`Abstract pattern for ${product.name}, ${product.category.toLowerCase()}`} preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="150" fill={bg} />
      {rows.map((d, i) => <path key={i} d={d} fill="none" stroke={fg} strokeOpacity={0.18 + (i % 3) * 0.08} strokeWidth="1" />)}
      <circle cx={cx} cy={52 + (h % 40)} r={18 + (h % 10)} fill={fg} fillOpacity="0.85" />
      <path d={`M0 150 L0 ${110 + (h % 15)} Q ${cx} ${90 + (h % 20)} 200 ${118 + (h % 12)} L200 150 Z`} fill={fg} fillOpacity="0.9" />
    </svg>
  );
}
