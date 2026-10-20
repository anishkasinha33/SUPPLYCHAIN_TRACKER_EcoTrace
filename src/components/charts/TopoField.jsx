/** Decorative contour lines (like a topographic map). Deterministic, so it never flickers. */
export function TopoField({ lines = 16, clusters = [[0.78, 0.35], [0.18, 0.8]], className = '' }) {
  const paths = [];
  clusters.forEach(([cx, cy], ci) => {
    for (let k = 1; k <= lines; k++) {
      const pts = [];
      for (let a = 0; a <= 360; a += 6) {
        const t = (a * Math.PI) / 180;
        const wobble = 1 + 0.14 * Math.sin(2 * t + ci * 1.7 + k * 0.21) + 0.08 * Math.sin(3 * t - k * 0.17 + ci);
        const rad = k * 34 * wobble;
        pts.push([cx * 1200 + Math.cos(t) * rad * 1.5, cy * 600 + Math.sin(t) * rad]);
      }
      paths.push('M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L') + ' Z');
    }
  });
  return (
    <svg className={`topo ${className}`} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
    </svg>
  );
}
