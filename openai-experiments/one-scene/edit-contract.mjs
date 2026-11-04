/** Strict edit-plan boundary for future model-generated suggestions.
 * This module does NOT call any model. Only structural, bounded directions are accepted.
 * All narrative facts and witness beliefs stay in the authored story.mjs contract.
 */
import {FACTS, SHOTS, PERSPECTIVES} from "./story.mjs";

const KEYS = Object.freeze(["perspective","shot_order","caption_id","pace"]);
const CAPTIONS = Object.freeze({
  friend: Object.freeze({absence:"The space between us was suddenly enormous.",silence:"The chair said nothing."}),
  worker: Object.freeze({routine:"The afternoon kept moving.",clock:"Everyone was somewhere else."}),
  leaver: Object.freeze({hesitation:"I put a sentence on the table and left.",pause:"Some words stay sealed."})
});
const PACES = Object.freeze(["linger","measured","brisk"]);

function plainObject(value) {
  return value !== null && typeof value === "object" &&
    !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

/** Reject rather than silently strip unknown keys: model outputs must not smuggle facts or scripts. */
export function validateEditProposal(input, requestedPerspective) {
  const errors = [];
  if (!PERSPECTIVES[requestedPerspective]) return {valid:false,errors:["Invalid requested perspective"]};
  if (!plainObject(input)) return {valid:false,errors:["Expected a plain object"]};
  const keys=Object.keys(input);
  if (keys.length !== KEYS.length || keys.some(k=>!KEYS.includes(k))) errors.push("Unexpected or missing keys");
  if (input.perspective !== requestedPerspective) errors.push("Perspective mismatch");
  const allowed=Object.keys(SHOTS);
  if (!Array.isArray(input.shot_order) ||
      input.shot_order.length !== 4 ||
      input.shot_order.some(s=>typeof s!=="string"||!allowed.includes(s)) ||
      new Set(input.shot_order).size!==4) errors.push("Invalid shot order");
  if (!Object.hasOwn(CAPTIONS[requestedPerspective],input.caption_id)) errors.push("Unapproved caption");
  if (!PACES.includes(input.pace)) errors.push("Invalid pace");
  return {valid:errors.length===0,errors};
}

/** Only this normalized value should be handed to the renderer. No model-supplied fact or arbitrary text. */
export function acceptEditProposal(input, requestedPerspective) {
  const result=validateEditProposal(input,requestedPerspective);
  if (!result.valid) return {ok:false,errors:result.errors};
  return {ok:true,edit:Object.freeze({
    perspective:requestedPerspective,
    shotOrder:Object.freeze([...input.shot_order]),
    caption:CAPTIONS[requestedPerspective][input.caption_id],
    pace:input.pace,
    facts:FACTS
  })};
}

export const EDIT_PLAN_SCHEMA=Object.freeze({
  type:"object",
  additionalProperties:false,
  required:[...KEYS],
  properties:{
    perspective:{type:"string",enum:Object.keys(PERSPECTIVES)},
    shot_order:{type:"array",items:{type:"string",enum:Object.keys(SHOTS)},minItems:4,maxItems:4,uniqueItems:true},
    caption_id:{type:"string",description:"Must be one of the selected witness's authored caption IDs"},
    pace:{type:"string",enum:[...PACES]}
  }
});
export const CAPTION_IDS=Object.freeze(Object.fromEntries(
  Object.entries(CAPTIONS).map(([k,v])=>[k,Object.freeze(Object.keys(v))])
));
