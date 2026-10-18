// Pure tests (no database needed): they prove the API's row format reproduces what the frontend builds from its own seed data.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addProductRows, emptyRaw } from '../src/services/rawGraph.js';
import { remapIds } from '../src/utils/remap.js';
import { generateTraceId, TRACE_ID_PATTERN } from '../src/utils/ids.js';
import { sampleProductDocs } from '../src/seed/sampleDocs.js';
import { buildGraph } from '../../src/utils/graph.js';
import { certifications } from '../../src/data/certifications.js';
import { providers } from '../../src/data/providers.js';
import { suppliers } from '../../src/data/suppliers.js';
import { materials } from '../../src/data/materials.js';
import { products, productMaterials } from '../../src/data/products.js';
import { stages, legs } from '../../src/data/pipeline.js';
import { DEMO_USER } from '../../src/data/users.js';

const catalogs = { certifications, providers, suppliers, materials };
const originalRaw = { ...catalogs, products, productMaterials, stages, legs };
const clean = (x) => JSON.parse(JSON.stringify(x)); // drops undefined, like JSON over the wire

describe('API rows vs the frontend graph', () => {
  it('stored sample documents -> rows -> buildGraph equals the frontend graph built from its own seed files', () => {
    const raw = { ...emptyRaw(), ...catalogs };
    sampleProductDocs().forEach((doc) => addProductRows(raw, doc));
    assert.deepEqual(clean(buildGraph(clean(raw), DEMO_USER)), clean(buildGraph(clean(originalRaw), DEMO_USER)));
  });

  it('copies get new stage and leg ids but keep every computed value (scores, emissions)', () => {
    const [template] = sampleProductDocs();
    const newId = 'pr-copy123';
    const { stages: s, legs: l } = remapIds({ stages: template.stages, legs: template.legs }, newId);
    const raw = { ...emptyRaw(), ...catalogs };
    addProductRows(raw, { ...template, _id: newId, stages: s, legs: l });

    const copy = buildGraph(clean(raw), DEMO_USER).products[0];
    const original = buildGraph(clean(originalRaw), DEMO_USER).products.find((p) => p.id === template._id);
    const renamed = JSON.parse(JSON.stringify(original).replaceAll(template._id, newId));
    assert.deepEqual(clean(copy), renamed);
    assert.equal(copy.stages.length, 7);
    assert.ok(copy.legs.every((leg) => leg.fromStageId.startsWith(newId) && leg.toStageId.startsWith(newId)));
  });

  it('remapIds never produces a leg that points at a missing stage', () => {
    for (const doc of sampleProductDocs()) {
      const { stages: s, legs: l } = remapIds({ stages: doc.stages, legs: doc.legs }, 'pr-x');
      const ids = new Set(s.map((st) => st.id));
      assert.ok(l.every((leg) => ids.has(leg.fromStageId) && ids.has(leg.toStageId)), doc._id);
    }
  });

  it('generates well-formed traceability ids', () => {
    for (let i = 0; i < 200; i += 1) assert.match(generateTraceId(), TRACE_ID_PATTERN);
  });

  it('every sample traceability id matches the format the API accepts', () => {
    sampleProductDocs().forEach((d) => assert.match(d.traceId, TRACE_ID_PATTERN));
  });
});
