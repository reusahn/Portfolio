/** One Scene, Many Truths — deterministic narrative contract, v0.1
 * The canonical event ledger is read-only. This is an editorial prototype
 * with authored cuts; no AI calls, generative text or observation data.
 */
export const FACTS = Object.freeze([
  "Two people sit near a café window.",
  "A sealed envelope rests on the table.",
  "One person rests a hand on the envelope.",
  "That person gets up from the table.",
  "The person walks away.",
  "The other person stays. The envelope remains."
]);

export const SHOTS = Object.freeze({
  hand: Object.freeze({id:"hand",label:"The hand",detail:"A hand hesitates over the envelope.",symbol:"HAND",beat:2}),
  door: Object.freeze({id:"door",label:"The doorway",detail:"The frame holds on the exit.",symbol:"EXIT",beat:4}),
  chair: Object.freeze({id:"chair",label:"The empty chair",detail:"An empty chair stays in the frame.",symbol:"CHAIR",beat:5}),
  clock: Object.freeze({id:"clock",label:"The clock",detail:"The café clock interrupts our attention.",symbol:"TIME",beat:3}),
  envelope: Object.freeze({id:"envelope",label:"The envelope",detail:"The sealed letter is never opened.",symbol:"LETTER",beat:1}),
  window: Object.freeze({id:"window",label:"The window",detail:"Traffic continues beyond the glass.",symbol:"WINDOW",beat:0})
});

export const PERSPECTIVES = Object.freeze({
  friend: Object.freeze({
    name:"The Friend",role:"The one who stayed",subtitle:"Interprets the departure as distance.",
    quote:"They could have stayed.",
    inference:"The person left because they wanted distance from me.",
    uncertainty:"The friend does not know the reason for leaving.",
    palette:"rose",tempo:"linger",shots:["chair","door","envelope","hand"],
    caption:"The space between us was suddenly enormous.",
    notes:"Hold the absence. The exit sounds louder than the letter."
  }),
  worker: Object.freeze({
    name:"The Worker",role:"From behind the counter",subtitle:"Sees a hurried guest, not the full relationship.",
    quote:"They must have been late.",
    inference:"The departure probably had something to do with time.",
    uncertainty:"The worker cannot hear the conversation or know the person’s intentions.",
    palette:"gold",tempo:"brisk",shots:["clock","window","door","envelope"],
    caption:"The afternoon kept moving.",
    notes:"Cut toward routine. The clock becomes an imagined explanation."
  }),
  leaver: Object.freeze({
    name:"The Leaver",role:"The one who walked away",subtitle:"Remembers a moment of hesitation.",
    quote:"I couldn't say it aloud.",
    inference:"The person describes leaving because they couldn't speak.",
    uncertainty:"The other witnesses do not have access to this interior account; it is still a fictional viewpoint.",
    palette:"blue",tempo:"measured",shots:["hand","envelope","door","chair"],
    caption:"I put a sentence on the table and left.",
    notes:"Let the hand lead. The letter stays just out of reach."
  })
});

export const DEFAULT_FOCUS = "auto";
export const FOCUS_OPTIONS = Object.freeze(["auto","hand","door","chair","clock","envelope","window"]);

export function makeCut(povId="friend", focus="auto"){
  const pov=PERSPECTIVES[povId];
  if(!pov) throw new Error("Unknown perspective");
  if(!FOCUS_OPTIONS.includes(focus)) throw new Error("Invalid focus");
  const shots=[...pov.shots];
  if(focus!=="auto"){
    const index=shots.indexOf(focus);
    if(index!==-1) shots.splice(index,1);
    shots.unshift(focus);
  }
  const cut={
    perspective:povId,
    focus,
    shotOrder:shots,
    caption:pov.caption,
    inference:pov.inference,
    uncertainty:pov.uncertainty,
    facts:[...FACTS]
  };
  const validity=validateCut(cut);
  if(!validity.valid) throw new Error(validity.errors.join("; "));
  return cut;
}

export function validateCut(cut){
  const errors=[];
  if(!PERSPECTIVES[cut?.perspective])errors.push("Unknown perspective");
  if(!Array.isArray(cut?.facts)||cut.facts.length!==FACTS.length||
    !cut.facts.every((f,i)=>f===FACTS[i]))errors.push("Canonical facts must remain unchanged");
  if(!Array.isArray(cut?.shotOrder)||cut.shotOrder.length<3||
    cut.shotOrder.length>6||cut.shotOrder.some(id=>!SHOTS[id])||
    new Set(cut.shotOrder).size!==cut.shotOrder.length)errors.push("Invalid shot order");
  if(!FOCUS_OPTIONS.includes(cut?.focus))errors.push("Unknown focus");
  if(typeof cut?.caption!=="string"||cut.caption.length>160)errors.push("Invalid caption");
  if(typeof cut?.uncertainty!=="string"||cut.uncertainty.length===0)errors.push("Missing uncertainty note");
  return {valid:errors.length===0,errors};
}
