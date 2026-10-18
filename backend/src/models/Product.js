import mongoose from 'mongoose';
import { newId, TRACE_ID_PATTERN } from '../utils/ids.js';

export const STATUSES = ['planned', 'in-production', 'in-transit', 'in-warehouse', 'on-sale'];
export const STAGE_NAMES = ['source', 'supplier', 'processing', 'manufacturing', 'transportation', 'warehouse', 'retail'];
export const MODES = ['road', 'rail', 'sea', 'air'];

const materialLine = new mongoose.Schema({
  materialId: { type: String, required: true },
  quantityKg: { type: Number, required: true, min: 0 },
}, { _id: false });

const stage = new mongoose.Schema({
  id: { type: String, required: true },
  order: { type: Number, required: true },
  stageName: { type: String, enum: STAGE_NAMES, required: true },
  location: { type: String, required: true },
  organizationKind: { type: String, enum: ['supplier', 'provider', 'business'], required: true },
  organizationId: { type: String, required: true },
  date: { type: String, required: true },
  durationDays: { type: Number, required: true, min: 0 },
}, { _id: false });

const leg = new mongoose.Schema({
  id: { type: String, required: true },
  fromStageId: { type: String, required: true },
  toStageId: { type: String, required: true },
  distanceKm: { type: Number, required: true, min: 0 },
  mode: { type: String, enum: MODES, required: true },
  providerId: { type: String, required: true },
  co2eOverride: { type: Number, min: 0 },
}, { _id: false });

// A product is saved and read as one bundle (the 5-step form), so its materials, stages and legs are embedded.
const productSchema = new mongoose.Schema({
  _id: { type: String, default: () => newId('pr') },
  ownerId: { type: String, default: null }, // null = shared sample template (copied to every new account)
  isSample: { type: Boolean, default: false },
  traceId: { type: String, required: true, unique: true, match: TRACE_ID_PATTERN },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  batchNumber: { type: String, required: true, trim: true, maxlength: 40 },
  origin: { type: String, required: true, trim: true, maxlength: 120 },
  status: { type: String, enum: STATUSES, required: true },
  manufacturerId: { type: String, required: true },
  unitsInBatch: { type: Number, required: true, min: 1 },
  shipmentTonnes: { type: Number, required: true, min: 0 },
  startDate: { type: String, required: true },
  story: { type: String, default: '', maxlength: 1000 },
  materialLines: [materialLine],
  stages: [stage],
  legs: [leg],
}, { timestamps: true, versionKey: false });

// One batch number per account. Also serves every "my products" query (ownerId is the index prefix).
productSchema.index({ ownerId: 1, batchNumber: 1 }, { unique: true });

export const Product = mongoose.model('Product', productSchema);
