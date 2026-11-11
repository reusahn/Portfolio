/** A cut's locked ledger is not the same as what its shots actually show.
 * Pure, deterministic calculation. Provenance is authored, not machine vision.
 */
export function auditVisibleEvidence(shotOrder, provenance, factCount) {
  if (!Array.isArray(shotOrder) || !Number.isInteger(factCount) || factCount < 1 ||
      !provenance || typeof provenance !== 'object') throw new Error('Invalid evidence audit input');
  const visible = new Set();
  const contextual = [];
  for (const id of shotOrder) {
    if (typeof id !== 'string' || !Object.hasOwn(provenance, id)) throw new Error('Unknown shot provenance');
    const shot = provenance[id];
    if (!Array.isArray(shot.factIds) || !['observed','context'].includes(shot.kind)) throw new Error('Invalid provenance');
    if (shot.kind === 'context') {
      if (shot.factIds.length) throw new Error('Context cannot assert event facts');
      contextual.push(id);
    }
    for (const index of shot.factIds) {
      if (!Number.isInteger(index) || index < 0 || index >= factCount) throw new Error('Invalid fact reference');
      visible.add(index);
    }
  }
  const shown = [...visible].sort((a,b) => a-b);
  const notShown = Array.from({length:factCount},(_,i)=>i).filter(i=>!visible.has(i));
  return Object.freeze({shown:Object.freeze(shown),notShown:Object.freeze(notShown),
    contextual:Object.freeze(contextual),factCount});
}

/** Compare what two cuts reveal without treating a reordering as new evidence. */
export function compareVisibleEvidence(beforeShots, afterShots, provenance, factCount) {
  const before=auditVisibleEvidence(beforeShots,provenance,factCount);
  const after=auditVisibleEvidence(afterShots,provenance,factCount);
  const prior=new Set(before.shown);
  const current=new Set(after.shown);
  return Object.freeze({
    newlyShown:Object.freeze(after.shown.filter(id=>!prior.has(id))),
    newlyHidden:Object.freeze(before.shown.filter(id=>!current.has(id))),
    unchangedShown:Object.freeze(before.shown.filter(id=>current.has(id))),
    before,
    after
  });
}
