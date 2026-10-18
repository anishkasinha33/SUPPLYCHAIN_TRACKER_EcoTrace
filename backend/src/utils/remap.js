/** Gives every stage and leg an id derived from the product id and links the legs to the renamed stages. */
export function remapIds({ stages, legs }, productId) {
  const idMap = new Map();
  const newStages = stages.map((s) => {
    const id = `${productId}-st${s.order}`;
    idMap.set(s.id, id);
    return {
      id, order: s.order, stageName: s.stageName, location: s.location, organizationKind: s.organizationKind,
      organizationId: s.organizationId, date: s.date, durationDays: s.durationDays,
    };
  });
  const newLegs = legs.map((l, n) => ({
    id: `${productId}-lg${n}`, fromStageId: idMap.get(l.fromStageId), toStageId: idMap.get(l.toStageId),
    distanceKm: l.distanceKm, mode: l.mode, providerId: l.providerId,
    ...(l.co2eOverride != null ? { co2eOverride: l.co2eOverride } : {}),
  }));
  return { stages: newStages, legs: newLegs };
}
