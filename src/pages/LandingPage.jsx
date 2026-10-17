import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Logo } from '../components/layout/Logo.jsx';
import { ThemeToggle } from '../components/layout/ThemeToggle.jsx';
import { TopoField } from '../components/charts/TopoField.jsx';
import { RouteLine } from '../components/landing/RouteLine.jsx';
import { JourneyStrip } from '../components/passport/Passport.jsx';
import { EcoScoreDial } from '../components/sustainability/EcoScoreDial.jsx';
import { ScoreBreakdown } from '../components/sustainability/ScoreBreakdown.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { jump } from '../utils/dom.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const BENEFITS = [
  ['Trace every product', 'Follow a product from the field or scrap yard to the shelf, one stage at a time, with the dates and places to prove it.'],
  ['Know your suppliers', 'See who is verified, who is still pending and who needs a second look, along with their certifications and labour standards.'],
  ['Watch sustainability', 'Recycled content, fair-trade share and an eco score of ten research-based factors that shows its working.'],
  ['See where carbon comes from', 'Every transport leg shows distance, mode and its share of the total, so the biggest savings are obvious.'],
  ['Earn customer trust', 'Share a clear product passport that customers can open from a link or a QR code.'],
];
const STEPS = [
  ['Add your products', 'Name, batch and where it is made.'],
  ['Connect materials', 'What goes in, how much, and how much is recycled.'],
  ['Add suppliers', 'Who provides each material and makes each product.'],
  ['Track production', 'Dates, locations and status at every stage.'],
  ['Monitor transportation', 'Distance and mode for every leg, with estimated emissions.'],
  ['Analyse sustainability', 'A 100-point eco score built from ten factors across climate, materials, people and transparency.'],
  ['Share with customers', 'Publish a passport page and a link or QR code to it.'],
];

export default function LandingPage() {
  useDocumentTitle('');
  const { isAuthed, loginDemo } = useAuth();
  const { graph } = useData();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const sample = graph?.products.find((p) => p.id === 'pr-001');

  const demo = async () => { setBusy(true); try { await loginDemo(); navigate('/dashboard'); } finally { setBusy(false); } };

  return (
    <div className="landing">
      <a href="#content" className="skip-link" onClick={jump('content')}>Skip to content</a>
      <header className="lnav">
        <Logo inverse />
        <nav aria-label="Site" className="lnav__links">
          <a href="#how" onClick={jump('how')}>How it works</a><a href="#passport" onClick={jump('passport')}>Product passport</a><a href="#impact" onClick={jump('impact')}>Impact</a>
        </nav>
        <div className="lnav__right">
          <ThemeToggle className="lnav__theme" />
          {isAuthed ? <Link className="btn btn-primary btn-sm" to="/dashboard">Open dashboard</Link> : (<><Link className="btn btn-quiet btn-sm lnav__login" to="/login">Log in</Link><Link className="btn btn-primary btn-sm" to="/signup">Start tracing</Link></>)}
        </div>
      </header>

      <main id="content">
        <section className="hero">
          <TopoField lines={18} />
          <div className="hero__in">
            <h1>Know where it came from. Show where it&rsquo;s going.</h1>
            <p className="hero__lead">EcoTrace helps small businesses follow every product from raw material to customer, check who they buy from, and share the whole story.</p>
            <div className="hero__cta">
              <Link className="btn btn-primary btn-lg hero__btn" to="/signup">Start tracing</Link>
              <button className="btn btn-lg hero__ghost" onClick={demo} disabled={busy}>{busy ? 'Opening demo' : 'Explore the demo'}</button>
            </div>
          </div>
          <RouteLine />
        </section>

        <section className="lsec lsec--split" aria-labelledby="why">
          <div className="lsec__lead">
            <h2 id="why">Every product has a story. Most small businesses can&rsquo;t tell theirs.</h2>
            <p className="lead">Where did the cotton come from? Is that supplier certified? How far did the boxes travel? The answers sit in emails, spreadsheets and memory. EcoTrace puts them in one place and links them together.</p>
          </div>
          <dl className="ruled">
            {BENEFITS.map(([t, d]) => (<div key={t} className="ruled__row"><dt>{t}</dt><dd>{d}</dd></div>))}
          </dl>
        </section>

        <section className="lsec lsec--tone" id="how" aria-labelledby="how-h">
          <h2 id="how-h">From first entry to shareable passport in seven steps</h2>
          <ol className="steps">
            {STEPS.map(([t, d], i) => (<li key={t}><span className="steps__n num">{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>))}
          </ol>
        </section>

        {sample && (
          <section className="lsec" id="passport" aria-labelledby="pass-h">
            <div className="lsec__lead lsec__lead--narrow">
              <h2 id="pass-h">What your customers see</h2>
              <p className="lead">A plain-language page for each product: its journey, what it is made of and the impact behind it. No prices, no contracts, nothing internal.</p>
              <Link className="btn btn-outline-primary" to={`/p/${sample.traceId}`}>Open a sample passport</Link>
            </div>
            <div className="sample">
              <div className="sample__head">
                <div><p className="meta m-0">Sample product</p><h3>{sample.name}</h3><span className="mono meta">{sample.traceId}</span></div>
                <EcoScoreDial score={sample.ecoScore} band={sample.eco.band} size={120} />
              </div>
              <JourneyStrip product={sample} />
              <details className="sample__why"><summary>How is this score worked out?</summary><ScoreBreakdown factors={sample.eco.factors} /></details>
            </div>
          </section>
        )}

        <section className="lsec lsec--tone" id="impact" aria-labelledby="imp-h">
          <h2 id="imp-h">Built for responsible work and responsible production</h2>
          <div className="sdg">
            <div><p className="sdg__tag">Decent work and economic growth (SDG 8)</p><p>Choose suppliers on evidence. EcoTrace tracks verification, labour audits and fair-trade coverage, so fair treatment of workers becomes something you can measure.</p></div>
            <div><p className="sdg__tag">Responsible consumption and production (SDG 12)</p><p>Cut waste where it starts. See recycled content, transport emissions and material choices per product, then pick what to improve first.</p></div>
          </div>
        </section>

        <section className="cta" aria-labelledby="cta-h">
          <TopoField lines={12} clusters={[[0.5, 0.5]]} />
          <div className="cta__in">
            <h2 id="cta-h">Start with one product. See its whole story.</h2>
            <div className="hero__cta">
              <Link className="btn btn-primary btn-lg hero__btn" to="/signup">Create an account</Link>
              <button className="btn btn-lg hero__ghost" onClick={demo} disabled={busy}>Explore the demo</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="lfoot">
        <Logo inverse />
        <p className="meta m-0">A student project. Data is fictional, sign-in is a demo and emission figures are estimates.</p>
      </footer>
    </div>
  );
}
