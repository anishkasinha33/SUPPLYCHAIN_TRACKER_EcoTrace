import { Certification, Material, Provider, Supplier, toRow } from '../models/Catalog.js';

const inOrder = (Model, filter = {}) => Model.find(filter).sort({ seq: 1 }).lean();

/** Public viewers get no supplier ratings or SDG audit data, and internal review status is shown as "pending". */
const scrubSupplier = ({ rating, sdgChecks, ...rest }) => ({
  ...rest,
  verificationStatus: rest.verificationStatus === 'needs-review' ? 'pending' : rest.verificationStatus,
});

export async function loadAllCatalogs() {
  const [certifications, providers, suppliers, materials] = await Promise.all([
    inOrder(Certification), inOrder(Provider), inOrder(Supplier), inOrder(Material),
  ]);
  return {
    certifications: certifications.map(toRow),
    providers: providers.map(toRow),
    suppliers: suppliers.map(toRow),
    materials: materials.map(toRow),
  };
}

/** Only the catalog rows that the given products actually use, scrubbed for public viewing. */
export async function loadPublicCatalogsFor(products) {
  const materialIds = new Set();
  const supplierIds = new Set();
  const providerIds = new Set();
  for (const p of products) {
    p.materialLines.forEach((l) => materialIds.add(l.materialId));
    supplierIds.add(p.manufacturerId);
    p.stages.forEach((s) => {
      if (s.organizationKind === 'supplier') supplierIds.add(s.organizationId);
      if (s.organizationKind === 'provider') providerIds.add(s.organizationId);
    });
    p.legs.forEach((l) => providerIds.add(l.providerId));
  }

  const materials = await inOrder(Material, { _id: { $in: [...materialIds] } });
  const certificationIds = new Set();
  materials.forEach((m) => {
    supplierIds.add(m.supplierId);
    (m.certificationIds || []).forEach((c) => certificationIds.add(c));
  });
  const certifications = await inOrder(Certification, { _id: { $in: [...certificationIds] } });
  certifications.forEach((c) => providerIds.add(c.issuerProviderId));
  const [suppliers, providers] = await Promise.all([
    inOrder(Supplier, { _id: { $in: [...supplierIds] } }),
    inOrder(Provider, { _id: { $in: [...providerIds] } }),
  ]);

  return {
    certifications: certifications.map(toRow),
    providers: providers.map(toRow),
    suppliers: suppliers.map(toRow).map(scrubSupplier),
    materials: materials.map(toRow),
  };
}
