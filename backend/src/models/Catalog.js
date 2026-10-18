import mongoose from 'mongoose';

const opts = { versionKey: false };

export const Supplier = mongoose.model('Supplier', new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }, // position in the seed list, keeps the original ordering
  name: { type: String, required: true },
  type: { type: String, enum: ['material', 'manufacturer'], required: true },
  location: { type: String, required: true },
  verificationStatus: { type: String, enum: ['verified', 'pending', 'needs-review'], required: true },
  fairLabor: { type: String, enum: ['certified', 'self-declared', 'not-assessed'], required: true },
  rating: Number,
  since: Number,
  about: String,
  sdgChecks: [Boolean], // 20 pass/fail results (SDG 8 then SDG 12)
}, opts));

export const Material = mongoose.model('Material', new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }, // position in the seed list, keeps the original ordering
  name: { type: String, required: true },
  category: String,
  origin: String,
  supplierId: { type: String, required: true },
  recycledPercentage: Number,
  certificationIds: [String],
  fairTrade: Boolean,
  tier: { type: String, enum: ['strong', 'moderate', 'weak'] },
  co2ePerKg: Number,
  waterLPerKg: Number,
  endOfLifePct: Number,
}, opts));

export const Provider = mongoose.model('Provider', new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }, // position in the seed list, keeps the original ordering
  name: { type: String, required: true },
  type: { type: String, enum: ['transport', 'logistics', 'certification-body', 'verification-org'] },
  location: String,
  services: [String],
}, opts));

export const Certification = mongoose.model('Certification', new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }, // position in the seed list, keeps the original ordering
  name: { type: String, required: true },
  issuerProviderId: { type: String, required: true },
  scope: String,
}, opts));

/** Lean catalog document -> the row shape the frontend already uses ({ id, ...fields }). */
export const toRow = (doc) => {
  const { _id, seq, ...rest } = doc;
  return { id: _id, ...rest };
};
