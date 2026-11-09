/** Shot provenance: a cut may emphasize evidence, but an insert is not proof of motive.
 * All descriptions are authored editorial metadata, not AI observations.
 */
import {FACTS, SHOTS} from "./story.mjs";

export const SHOT_PROVENANCE=Object.freeze({
  hand:Object.freeze({kind:"observed",factIds:Object.freeze([2]),note:"The hand touches the envelope. It does not establish why the person leaves."}),
  door:Object.freeze({kind:"observed",factIds:Object.freeze([4]),note:"A person leaves. The doorway does not establish their intention."}),
  chair:Object.freeze({kind:"observed",factIds:Object.freeze([5]),note:"One person remains at the table. The empty chair does not establish abandonment."}),
  envelope:Object.freeze({kind:"observed",factIds:Object.freeze([1,5]),note:"The sealed envelope remains. Its contents are unknown."}),
  clock:Object.freeze({kind:"context",factIds:Object.freeze([]),note:"The clock is an editorial insert. No evidence says the person was late."}),
  window:Object.freeze({kind:"context",factIds:Object.freeze([]),note:"The window is an editorial insert. Outside activity is not evidence of motive."})
});

export function shotProvenance(shotId){
  if(!Object.hasOwn(SHOTS,shotId) || !Object.hasOwn(SHOT_PROVENANCE,shotId)) throw new Error("Unknown shot");
  return SHOT_PROVENANCE[shotId];
}
export function validateProvenance(){
  const errors=[];
  for(const id of Object.keys(SHOTS)){
    const entry=SHOT_PROVENANCE[id];
    if(!entry){errors.push("Missing provenance: "+id);continue}
    if(!["observed","context"].includes(entry.kind))errors.push("Invalid provenance kind: "+id);
    if(!Array.isArray(entry.factIds)||entry.factIds.some(n=>!Number.isInteger(n)||n<0||n>=FACTS.length))errors.push("Invalid fact reference: "+id);
    if(entry.kind==="context" && entry.factIds.length)errors.push("Context cannot assert event facts: "+id);
    if(typeof entry.note!=="string"||entry.note.length<10)errors.push("Missing provenance note: "+id);
  }
  if(Object.keys(SHOT_PROVENANCE).some(id=>!Object.hasOwn(SHOTS,id)))errors.push("Provenance for unknown shot");
  return {valid:errors.length===0,errors};
}
