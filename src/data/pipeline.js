// Pipeline stages and transport legs are stored as compact specs here and expanded
// into SQL-shaped rows (PipelineStage, TransportLeg) below.
//
// stage tuple: [stageKey, location, orgKind, orgId, durationDays]
//   orgKind: 'supplier' | 'provider' | 'business'
// leg tuple:   [fromIndex, toIndex, distanceKm, mode]  (mode: road | rail | sea | air)
export const STAGE_ORDER = ['source', 'supplier', 'processing', 'manufacturing', 'transportation', 'warehouse', 'retail'];

const WAREHOUSE = ['warehouse', 'Bandarpada, Nav Sagarpur', 'provider', 'p7', 6];
const RETAIL = ['retail', 'Deepghat, Sagarpur', 'business', 'biz', 4];

const specs = {
  'pr-001': {
    stages: [
      ['source', 'Kesarpada Industrial Estate, Sundarpur', 'supplier', 's1', 4],
      ['supplier', 'GreenWeave Mill, Nandipur, Sundarpur', 'supplier', 's1', 5],
      ['processing', 'GreenWeave Mill, Nandipur, Sundarpur', 'supplier', 's1', 9],
      ['manufacturing', 'Riverbend Stitch Works, Sundarpur', 'supplier', 's10', 12],
      ['transportation', 'Riverbend Rail Terminal, Sundarpur', 'provider', 'p2', 3],
      WAREHOUSE, RETAIL,
    ],
    legs: [[0, 1, 14, 'road'], [2, 3, 16, 'road'], [3, 4, 9, 'road'], [4, 5, 525, 'rail'], [5, 6, 38, 'road']],
  },
  'pr-002': {
    stages: [
      ['source', 'Yavatmal, Kapaspur', 'supplier', 's1', 6],
      ['supplier', 'GreenWeave Mill, Nandipur, Sundarpur', 'supplier', 's1', 6],
      ['processing', 'GreenWeave Mill, Nandipur, Sundarpur', 'supplier', 's1', 10],
      ['manufacturing', 'Silaipur Knit Works, Silaipur', 'supplier', 's5', 18],
      ['transportation', 'Silaipur Container Depot', 'provider', 'p2', 4],
      WAREHOUSE, RETAIL,
    ],
    legs: [[0, 1, 820, 'road'], [2, 3, 1650, 'rail'], [3, 4, 14, 'road'], [4, 5, 1240, 'rail'], [5, 6, 38, 'road']],
  },
  'pr-003': {
    stages: [
      ['source', 'Bansgaon bamboo groves', 'supplier', 's2', 7],
      ['supplier', 'Bansgaon Bamboo Collective, Kudal', 'supplier', 's2', 5],
      ['processing', 'Bansgaon Bamboo Collective, Kudal', 'supplier', 's2', 6],
      ['manufacturing', 'Karigarpada Craft Works, Karigarpada', 'supplier', 's12', 10],
      ['transportation', 'Karigarpada Truck Terminal', 'provider', 'p1', 1],
      WAREHOUSE, RETAIL,
    ],
    legs: [[0, 1, 22, 'road'], [2, 3, 450, 'road'], [3, 4, 6, 'road'], [4, 5, 32, 'road'], [5, 6, 38, 'road']],
  },
  'pr-004': {
    stages: [
      ['source', 'Lohapur scrap yards, Shilpanagar', 'supplier', 's3', 6],
      ['supplier', 'Ridgeway Reclaim Metals, Lohapur', 'supplier', 's3', 6],
      ['processing', 'Ridgeway Reclaim Metals, Lohapur', 'supplier', 's3', 5],
      ['manufacturing', 'Tamrapur Metalform, Tamrapur', 'supplier', 's7', 14],
      ['transportation', 'Tamrapur Rail Yard', 'provider', 'p2', 5],
      WAREHOUSE, RETAIL,
    ],
    legs: [[0, 1, 25, 'road'], [2, 3, 1010, 'road'], [3, 4, 11, 'road'], [4, 5, 1150, 'rail'], [5, 6, 38, 'road']],
  },
  'pr-005': {
    stages: [
      ['source', 'Raspur rubber estates', 'supplier', 's4', 8],
      ['supplier', 'Heron Natural Rubber Co-op, Raspur', 'supplier', 's4', 6],
      ['processing', 'Heron Natural Rubber Co-op, Raspur', 'supplier', 's4', 7],
      ['manufacturing', 'Samudrapur Polymer Moulders, Samudrapur', 'supplier', 's13', 12],
      ['transportation', 'Samudrapur Port', 'provider', 'p3', 6],
      WAREHOUSE, RETAIL,
    ],
    legs: [[0, 1, 18, 'road'], [2, 3, 62, 'road'], [3, 4, 14, 'road'], [4, 5, 1420, 'sea'], [5, 6, 38, 'road']],
  },
  'pr-006': {
    stages: [
      ['source', 'Kagadnagar collection yards', 'supplier', 's8', 5],
      ['supplier', 'Kagadnagar Pulp & Pack, Kagadnagar', 'supplier', 's8', 6],
      ['processing', 'Kagadnagar Pulp & Pack, Kagadnagar', 'supplier', 's8', 6],
      ['manufacturing', 'Karigarpada Craft Works, Karigarpada', 'supplier', 's12', 9],
      ['transportation', 'Karigarpada Truck Terminal', 'provider', 'p1', 1],
      WAREHOUSE, RETAIL,
    ],
    legs: [[0, 1, 12, 'road'], [2, 3, 175, 'road'], [3, 4, 6, 'road'], [4, 5, 32, 'road'], [5, 6, 38, 'road']],
  },
  'pr-007': {
    stages: [
      ['source', 'Aravali collection groups, Ayurgaon', 'supplier', 's9', 9],
      ['supplier', 'Thistledown Herbal Extracts, Ayurgaon', 'supplier', 's9', 6],
      ['processing', 'Thistledown Herbal Extracts, Ayurgaon', 'supplier', 's9', 8],
      ['manufacturing', 'Karigarpada Craft Works, Karigarpada', 'supplier', 's12', 8],
      ['transportation', 'Ayurgaon to Karigarpada truck', 'provider', 'p1', 2],
      WAREHOUSE, RETAIL,
    ],
    legs: [[0, 1, 40, 'road'], [2, 3, 780, 'road'], [3, 4, 6, 'road'], [4, 5, 32, 'road'], [5, 6, 38, 'road']],
  },
  'pr-008': {
    stages: [
      ['source', 'Sutrapur petrochemical feedstock, Tantunagar', 'supplier', 's6', 5],
      ['supplier', 'Tantunagar Fibre Mills, Sutrapur', 'supplier', 's6', 8],
      ['processing', 'Tantunagar Fibre Mills, Sutrapur', 'supplier', 's6', 8],
      ['manufacturing', 'Unnipur Outerwear Works, Unnipur', 'supplier', 's11', 14],
      ['transportation', 'Unnipur Air Cargo Terminal', 'provider', 'p8', 2],
      WAREHOUSE, RETAIL,
    ],
    legs: [[0, 1, 9, 'road'], [2, 3, 1350, 'road'], [3, 4, 15, 'road'], [4, 5, 1700, 'air'], [5, 6, 38, 'road']],
  },
};

function addDays(iso, days) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

import { products } from './products.js';

const startOf = Object.fromEntries(products.map((p) => [p.id, p.startDate]));

export const stages = [];
export const legs = [];

Object.entries(specs).forEach(([productId, spec]) => {
  let cursor = startOf[productId];
  spec.stages.forEach(([stageName, location, organizationKind, organizationId, durationDays], i) => {
    stages.push({ id: `${productId}-st${i}`, productId, order: i, stageName, location, organizationKind, organizationId, date: cursor, durationDays });
    cursor = addDays(cursor, durationDays);
  });
  const modeProvider = { road: 'p1', rail: 'p2', sea: 'p3', air: 'p8' };
  spec.legs.forEach(([from, to, distanceKm, mode], n) => {
    legs.push({ id: `${productId}-lg${n}`, productId, fromStageId: `${productId}-st${from}`, toStageId: `${productId}-st${to}`, distanceKm, mode, providerId: modeProvider[mode] });
  });
});
