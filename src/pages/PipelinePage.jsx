import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { RouteMap } from '../components/pipeline/RouteMap.jsx';
import { StageDetail } from '../components/pipeline/StageDetail.jsx';
import { LegTable } from '../components/pipeline/LegTable.jsx';
import { EmissionsBar } from '../components/charts/EmissionsBar.jsx';
import { MetricBlock } from '../components/sustainability/ScoreBreakdown.jsx';
import { ProductStatusBadge } from '../components/common/Badge.jsx';
import { MODES } from '../utils/carbon.js';
import { fmtKg, fmtPct } from '../utils/format.js';

export default function PipelinePage() {
  useDocumentTitle('Pipeline');
  const { graph } = useData();
  const [params, setParams] = useSearchParams();
  const product = graph.products.find((p) => p.id === params.get('product')) || graph.products[0];
  const [stageId, setStageId] = useState(null);

  useEffect(() => {
    if (!product) return;
    const current = product.stages.find((s) => s.status === 'in-progress') || product.stages[product.stages.length - 1];
    setStageId(current?.id || null);
  }, [product?.id]);

  const stage = useMemo(() => product?.stages.find((s) => s.id === stageId), [product, stageId]);
  if (!product) return <PageHead title="Pipeline">Add a product to see its route.</PageHead>;

  const km = product.legs.reduce((s, l) => s + l.distanceKm, 0);
  const top = [...product.legs].sort((a, b) => b.co2e - a.co2e)[0];

  return (
    <>
      <PageHead title="Pipeline">Follow one product from material source to retail. Select a stop for details. Thicker paths carry more emissions.</PageHead>

      <div className="pipe-pick">
        <label htmlFor="pp" className="form-label">Product</label>
        <select id="pp" className="form-select" value={product.id} onChange={(e) => setParams({ product: e.target.value })}>
          {graph.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <ProductStatusBadge status={product.status} />
        <Link to={`/products/${product.id}`}>Open product</Link>
      </div>

      <RouteMap product={product} selectedId={stageId} onSelect={setStageId} />

      <div className="pipe-detail">{stage ? <StageDetail stage={stage} product={product} /> : <p className="muted">Select a stop on the route to see its details.</p>}</div>

      <Section id="emis" title="Transportation and carbon">
        <div className="metrics metrics--3">
          <MetricBlock label="Distance moved" value={km.toLocaleString('en-IN')} unit="km" context={`Across ${product.legs.length} transport legs.`} />
          <MetricBlock label="Transport emissions" value={fmtKg(product.carbon.transportKg)} unit="CO₂e" context={`${fmtKg(product.carbon.transportKg / product.shipmentTonnes)} per tonne shipped. Estimate.`} />
          <MetricBlock label="Biggest source" value={top ? fmtPct(top.share * 100) : '0%'} context={top ? `${top.from?.location} to ${top.to?.location} by ${MODES[top.mode].label.toLowerCase()}.` : 'No legs recorded.'} />
        </div>
        <EmissionsBar legs={product.legs} />
        <LegTable legs={product.legs} />
      </Section>
    </>
  );
}
