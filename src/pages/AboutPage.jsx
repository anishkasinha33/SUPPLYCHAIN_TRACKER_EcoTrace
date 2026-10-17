import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { SDG_ITEMS, POINTS_PER_ITEM } from '../data/sdgChecklist.js';
import { FACTOR_DEFS, PILLARS } from '../utils/sustainability.js';
import { MODES, ESTIMATE_NOTE } from '../utils/carbon.js';

const MODE_NOTES = {
  road: 'Diesel heavy truck. Flexible, but the highest emissions of the ground options.',
  rail: 'Electric cargo train. Low carbon and the best choice for long overland legs.',
  sea: 'Coastal and maritime ship. Lowest emissions per tonne, but slow.',
  air: 'Air freight. Fast, with by far the highest emissions.',
};

export default function AboutPage() {
  useDocumentTitle('About & SDG scoring');
  return (
    <>
      <PageHead title="About & SDG scoring">How EcoTrace decides how ethical and sustainable a supplier or product is, and why.</PageHead>

      <Section id="mission" title="Our mission">
        <p className="about__lead">EcoTrace lets buyers see how ethical and sustainable each supplier is, using a public checklist tied to two UN Sustainable Development Goals instead of an arbitrary number. Every point can be traced back to something that was checked.</p>
      </Section>

      <Section id="goals" title="Two goals we measure against">
        <div className="goal">
          <article className="goal__card">
            <h3>SDG 8: Decent work and economic growth</h3>
            <p className="meta">Target 8.8</p>
            <p>Labour rights, fair pay, no child or forced labour, and safe factories. Suppliers must pass Fair Trade and environmental audits before products move to the next stage.</p>
          </article>
          <article className="goal__card">
            <h3>SDG 12: Responsible consumption and production</h3>
            <p className="meta">Target 12.5</p>
            <p>Recycling, less production and transport pollution, and cleaner materials and logistics. We track the carbon footprint of every transport leg and favour low-emission carriers.</p>
          </article>
        </div>
      </Section>

      <Section id="scoring" title="How a supplier is scored">
        <p className="about__lead">A supplier&rsquo;s SDG score is a {SDG_ITEMS.length}-item checklist. Each verified item is worth {POINTS_PER_ITEM} points, so the maximum is {SDG_ITEMS.length * POINTS_PER_ITEM}. Open any supplier to see which items it meets.</p>
        <div className="sdg mt-4">
          {[[8, 'SDG 8: Decent work'], [12, 'SDG 12: Responsible production']].map(([n, label]) => (
            <section key={n} aria-label={label}>
              <h3 className="sdg__title">{label} <span className="num muted">50 pts</span></h3>
              <ul className="sdg__list">
                {SDG_ITEMS.filter((i) => i.sdg === n).map((i) => <li key={i.label}><span aria-hidden="true">•</span><span>{i.label}</span></li>)}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section id="eco" title="How a product eco score works" aside={<Link to="/sustainability">Full analysis</Link>}>
        <p className="about__lead">A product&rsquo;s eco score is out of 100, built from ten factors in four groups. Each product page shows the points earned on every factor.</p>
        <div className="method mt-4">
          {PILLARS.map((pl) => {
            const defs = FACTOR_DEFS.filter((d) => d.pillar === pl.key);
            return (
              <section className="method__pillar" key={pl.key} aria-label={pl.label}>
                <h3 className="method__title">{pl.label} <span className="num muted">{defs.reduce((s, d) => s + d.weight, 0)} pts</span></h3>
                <ul className="plain-list">
                  {defs.map((d) => <li key={d.key}><span>{d.label}</span><span className="num muted">{d.weight}</span></li>)}
                </ul>
              </section>
            );
          })}
        </div>
      </Section>

      <Section id="modes" title="Transport and carbon">
        <table className="table about__table">
          <caption className="visually-hidden">Emission factor by transport mode</caption>
          <thead><tr><th scope="col">Mode</th><th scope="col">What it means</th><th scope="col" className="text-end">g CO₂e per tonne-km</th></tr></thead>
          <tbody>
            {Object.entries(MODES).map(([k, m]) => (
              <tr key={k}><th scope="row">{m.label}</th><td>{MODE_NOTES[k]}</td><td className="num text-end">{Math.round(m.factor * 1000)}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="meta">{ESTIMATE_NOTE}</p>
      </Section>
    </>
  );
}
