import { z } from 'zod';
import { STATUSES, STAGE_NAMES, MODES } from '../models/Product.js';

const id = z.string().trim().min(1).max(64);
const text = (max) => z.string().trim().min(1, 'This field is required.').max(max, 'This value is too long.');
const isoDate = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date like 2026-10-18.')
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, 'Enter a real calendar date.');

// Unknown keys are stripped, so a request can never set ownerId, isSample, timestamps and so on.
const productFields = z.object({
  id: z.string().max(64).optional(), // accepted but ignored: the server owns ids
  traceId: z.string().max(40).optional(), // used only if it is well formed and still free
  name: z.string().trim().min(3, 'Enter a product name of at least 3 characters.').max(120),
  category: text(60),
  batchNumber: z.string().trim().regex(/^[A-Za-z0-9-]{3,40}$/, 'Use letters, numbers and hyphens only, at least 3 characters.'),
  origin: text(120),
  status: z.enum(STATUSES),
  manufacturerId: id,
  unitsInBatch: z.number().int('Enter a whole number of units.').min(1).max(100_000_000),
  shipmentTonnes: z.number().positive('Enter a shipment weight above 0 tonnes.').max(1_000_000),
  startDate: isoDate,
  story: z.string().trim().max(1000).default(''),
});

const materialLine = z.object({
  materialId: id,
  quantityKg: z.number().positive('Enter a quantity above 0 kg.').max(10_000_000),
});

const stage = z.object({
  id,
  productId: z.string().max(64).optional(),
  order: z.number().int().min(0).max(19),
  stageName: z.enum(STAGE_NAMES),
  location: text(200),
  organizationKind: z.enum(['supplier', 'provider', 'business']),
  organizationId: id,
  date: isoDate,
  durationDays: z.number().int().min(0).max(365),
});

const leg = z.object({
  id,
  productId: z.string().max(64).optional(),
  fromStageId: id,
  toStageId: id,
  distanceKm: z.number().positive('Enter a distance above 0 km.').max(100_000),
  mode: z.enum(MODES),
  providerId: id,
  co2eOverride: z.number().min(0).max(1_000_000_000).nullish(),
});

export const bundleSchema = z.object({
  product: productFields,
  materialLines: z.array(materialLine).min(1, 'Add at least one material.').max(30),
  stages: z.array(stage).min(1).max(20),
  legs: z.array(leg).max(30),
}).superRefine((b, ctx) => {
  const bad = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
  const dupes = (values) => values.length !== new Set(values).size;

  if (dupes(b.materialLines.map((l) => l.materialId))) bad(['materialLines'], 'Each material can only be listed once.');
  if (dupes(b.stages.map((s) => s.id))) bad(['stages'], 'Stage ids must be unique.');
  if (dupes(b.stages.map((s) => s.order))) bad(['stages'], 'Stage order values must be unique.');
  if (dupes(b.legs.map((l) => l.id))) bad(['legs'], 'Leg ids must be unique.');

  const stageIds = new Set(b.stages.map((s) => s.id));
  b.legs.forEach((l, i) => {
    if (!stageIds.has(l.fromStageId)) bad(['legs', i, 'fromStageId'], 'This leg starts at a stage that does not exist.');
    if (!stageIds.has(l.toStageId)) bad(['legs', i, 'toStageId'], 'This leg ends at a stage that does not exist.');
  });
  b.stages.forEach((s, i) => {
    if (s.organizationKind === 'business' && s.organizationId !== 'biz') bad(['stages', i, 'organizationId'], 'A business stage must use the account owner.');
  });
});
