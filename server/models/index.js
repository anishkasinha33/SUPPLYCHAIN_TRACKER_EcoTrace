// Rows keep the string ids the frontend already uses ('pr-001', 's1', ...) as _id,
// so references between collections stay readable and match the seed data.
import mongoose from 'mongoose';

function rowSchema(fields, { stringId = true } = {}) {
  return new mongoose.Schema(stringId ? { _id: { type: String, required: true }, ...fields } : fields, { versionKey: false });
}

/** Lean document -> the plain row shape the client expects ({ id, ... }). */
export const toRow = ({ _id, ...rest }) => ({ id: _id, ...rest });

export const Certification = mongoose.model('Certification', rowSchema({
  name: { type: String, required: true },
  issuerProviderId: { type: String, required: true },
  scope: String,
}));

export const Provider = mongoose.model('Provider', rowSchema({
  name: { type: String, required: true },
  type: { type: String, enum: ['transport', 'logistics', 'certification-body', 'verification-org'], required: true },
  location: String,
  services: [String],
}));

export const Supplier = mongoose.model('Supplier', rowSchema({
  name: { type: String, required: true },
  type: { type: String, enum: ['material', 'manufacturer'], required: true },
  location: String,
  verificationStatus: { type: String, enum: ['verified', 'pending', 'needs-review'] },
  fairLabor: { type: String, enum: ['certified', 'self-declared', 'not-assessed'] },
  rating: Number,
  since: Number,
  about: String,
}));

export const Material = mongoose.model('Material', rowSchema({
  name: { type: String, required: true },
  category: String,
  origin: String,
  supplierId: { type: String, required: true, index: true },
  recycledPercentage: { type: Number, min: 0, max: 100, default: 0 },
  certificationIds: [String],
  fairTrade: Boolean,
  tier: { type: String, enum: ['strong', 'moderate', 'weak'] },
  co2ePerKg: Number,
  waterLPerKg: Number,
  endOfLifePct: Number,
}));

export const Product = mongoose.model('Product', rowSchema({
  traceId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  category: String,
  batchNumber: String,
  origin: String,
  status: { type: String, enum: ['planned', 'in-production', 'in-transit', 'in-warehouse', 'on-sale'], default: 'planned' },
  manufacturerId: String,
  unitsInBatch: { type: Number, min: 0 },
  shipmentTonnes: { type: Number, min: 0 },
  startDate: String, // ISO date (YYYY-MM-DD), kept as a string to match the client
  story: String,
  isSeed: { type: Boolean, default: false }, // sample products can be edited but not deleted
  ownerId: { type: String, default: null },
}));

export const ProductMaterial = mongoose.model('ProductMaterial', rowSchema({
  productId: { type: String, required: true, index: true },
  materialId: { type: String, required: true },
  quantityKg: { type: Number, required: true, min: 0 },
}, { stringId: false }));

export const PipelineStage = mongoose.model('PipelineStage', rowSchema({
  productId: { type: String, required: true, index: true },
  order: { type: Number, required: true },
  stageName: { type: String, enum: ['source', 'supplier', 'processing', 'manufacturing', 'transportation', 'warehouse', 'retail'], required: true },
  location: String,
  organizationKind: { type: String, enum: ['supplier', 'provider', 'business'] },
  organizationId: String,
  date: String,
  durationDays: Number,
}));

export const TransportLeg = mongoose.model('TransportLeg', rowSchema({
  productId: { type: String, required: true, index: true },
  fromStageId: { type: String, required: true },
  toStageId: { type: String, required: true },
  distanceKm: { type: Number, min: 0 },
  mode: { type: String, enum: ['road', 'rail', 'sea', 'air'] },
  providerId: String,
  co2eOverride: Number,
}));

export const User = mongoose.model('User', rowSchema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  phoneDigits: { type: String, index: true, default: '' },
  businessName: { type: String, trim: true, default: '' },
  industry: { type: String, default: '' },
  location: { type: String, default: '' },
  passwordHash: { type: String, required: true, select: false },
}));

/** Public profile fields (never the password hash). */
export const publicUser = (u) => ({
  id: u._id, name: u.name, email: u.email, phone: u.phone, businessName: u.businessName, industry: u.industry, location: u.location,
});
