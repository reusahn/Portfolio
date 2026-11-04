import {strict as assert} from "node:assert";
import {FACTS,SHOTS,PERSPECTIVES,makeCut,validateCut} from "./story.mjs";

let count=0;
function ok(name,fn){fn();count++;console.log("PASS",name)}
ok("six canonical facts exist",()=>assert.equal(FACTS.length,6));
ok("all perspectives compile",()=>Object.keys(PERSPECTIVES).forEach(p=>assert.equal(validateCut(makeCut(p)).valid,true)));
ok("canonical facts remain invariant in every POV",()=>Object.keys(PERSPECTIVES).forEach(p=>assert.deepEqual(makeCut(p).facts,FACTS)));
ok("a focus change is observable",()=>assert.equal(makeCut("friend","clock").shotOrder[0],"clock"));
ok("focus does not overwrite facts",()=>assert.deepEqual(makeCut("leaver","chair").facts,FACTS));
ok("a focus insert cannot duplicate a shot",()=>assert.equal(new Set(makeCut("worker","clock").shotOrder).size,makeCut("worker","clock").shotOrder.length));
ok("undefined perspective rejected",()=>assert.throws(()=>makeCut("invented")));
ok("unknown focus rejected",()=>assert.throws(()=>makeCut("friend","secret")));
ok("unknown shot rejected",()=>assert.equal(validateCut({...makeCut("friend"),shotOrder:["door","portal","chair"]}).valid,false));
ok("invented fact rejected",()=>assert.equal(validateCut({...makeCut("friend"),facts:[...FACTS,"They were angry."]}).valid,false));
ok("altered fact rejected",()=>assert.equal(validateCut({...makeCut("friend"),facts:FACTS.map((f,i)=>i===0?"Someone threw a letter.":f)}).valid,false));
ok("missing uncertainty rejected",()=>assert.equal(validateCut({...makeCut("friend"),uncertainty:""}).valid,false));
ok("oversized caption rejected",()=>assert.equal(validateCut({...makeCut("friend"),caption:"a".repeat(161)}).valid,false));
ok("shot library includes canonical subjects",()=>["hand","door","chair","clock","envelope"].forEach(id=>assert.ok(SHOTS[id])));

import {acceptEditProposal,validateEditProposal,CAPTION_IDS,EDIT_PLAN_SCHEMA} from "./edit-contract.mjs";
const proposal={perspective:"friend",shot_order:["chair","door","envelope","hand"],caption_id:"absence",pace:"linger"};
ok("valid model edit plan accepted",()=>assert.equal(acceptEditProposal(proposal,"friend").ok,true));
ok("accepted plan preserves canonical ledger",()=>assert.deepEqual(acceptEditProposal(proposal,"friend").edit.facts,FACTS));
ok("accepted plan is immutable",()=>assert.equal(Object.isFrozen(acceptEditProposal(proposal,"friend").edit.shotOrder),true));
ok("model cannot invent event via extra facts field",()=>assert.equal(validateEditProposal({...proposal,facts:["They argued"]},"friend").valid,false));
ok("model cannot inject freeform voiceover",()=>assert.equal(validateEditProposal({...proposal,voiceover:"A new event happened"},"friend").valid,false));
ok("model cannot impersonate another witness",()=>assert.equal(validateEditProposal({...proposal,perspective:"worker"},"friend").valid,false));
ok("model cannot invent a shot",()=>assert.equal(validateEditProposal({...proposal,shot_order:["chair","door","envelope","dragon"]},"friend").valid,false));
ok("model cannot duplicate shots",()=>assert.equal(validateEditProposal({...proposal,shot_order:["chair","chair","envelope","hand"]},"friend").valid,false));
ok("model cannot inject freeform captions",()=>assert.equal(validateEditProposal({...proposal,caption_id:"They were definitely angry"},"friend").valid,false));
ok("model cannot inject unknown pace",()=>assert.equal(validateEditProposal({...proposal,pace:"chaos"},"friend").valid,false));
ok("model cannot submit null or arrays",()=>{assert.equal(validateEditProposal(null,"friend").valid,false);assert.equal(validateEditProposal([],"friend").valid,false)});
ok("model must supply every field",()=>{const {pace,...partial}=proposal;assert.equal(validateEditProposal(partial,"friend").valid,false)});
ok("schema explicitly forbids additional properties",()=>assert.equal(EDIT_PLAN_SCHEMA.additionalProperties,false));
ok("caption IDs are witness-specific",()=>{assert.ok(CAPTION_IDS.friend.includes("absence"));assert.equal(validateEditProposal({...proposal,caption_id:"routine"},"friend").valid,false)});

console.log(count,"narrative contract checks passed");
