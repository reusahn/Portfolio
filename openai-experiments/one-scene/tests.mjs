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


import {PACE_MS,shotDuration,nextShotIndex} from "./playback.mjs";
ok("all authored pace values resolve to finite durations",()=>Object.keys(PACE_MS).forEach(p=>assert.ok(Number.isFinite(shotDuration(p))&&shotDuration(p)>0)));
ok("pacing order matches the cinematic labels",()=>assert.ok(shotDuration("linger")>shotDuration("measured")&&shotDuration("measured")>shotDuration("brisk")));
ok("unrecognized playback pace is rejected",()=>assert.throws(()=>shotDuration("instant")));
ok("shot advancement stays within a finite cut",()=>{assert.equal(nextShotIndex(0,4),1);assert.equal(nextShotIndex(3,4),null)});
ok("invalid shot positions are rejected",()=>{assert.throws(()=>nextShotIndex(-1,4));assert.throws(()=>nextShotIndex(4,4));assert.throws(()=>nextShotIndex(0,0))});

console.log(count,"narrative and playback contract checks passed");

import {SHOT_PROVENANCE,shotProvenance,validateProvenance} from "./evidence.mjs";
ok("every shot has provenance",()=>assert.equal(validateProvenance().valid,true));
ok("all contextual inserts have no canonical fact claims",()=>Object.values(SHOT_PROVENANCE).filter(x=>x.kind==="context").forEach(x=>assert.deepEqual(x.factIds,[])));
ok("the clock is not evidence of lateness",()=>{assert.equal(shotProvenance("clock").kind,"context");assert.match(shotProvenance("clock").note,/not|no evidence/i)});
ok("the sealed envelope links only to existing events",()=>shotProvenance("envelope").factIds.forEach(n=>assert.ok(FACTS[n])));
ok("unknown provenance shot is rejected",()=>assert.throws(()=>shotProvenance("dragon")));

console.log(count,"narrative contract checks passed");


import {auditVisibleEvidence} from "./coverage.mjs";
ok("not every locked fact is visible in a cut",()=>assert.deepEqual(auditVisibleEvidence(["chair","door","envelope","hand"],SHOT_PROVENANCE,6).notShown,[0,3]));
ok("context inserts never create observed facts",()=>assert.deepEqual(auditVisibleEvidence(["clock","window"],SHOT_PROVENANCE,6).shown,[]));
ok("shot reordering does not fabricate evidence",()=>assert.deepEqual(auditVisibleEvidence(["hand","door"],SHOT_PROVENANCE,6).shown,auditVisibleEvidence(["door","hand"],SHOT_PROVENANCE,6).shown));
ok("contextual shots are separately reported",()=>assert.deepEqual(auditVisibleEvidence(["clock","door","window"],SHOT_PROVENANCE,6).contextual,["clock","window"]));
ok("repeated shot does not inflate evidence coverage",()=>assert.deepEqual(auditVisibleEvidence(["hand","hand"],SHOT_PROVENANCE,6).shown,[2]));
ok("unknown evidence shot is rejected",()=>assert.throws(()=>auditVisibleEvidence(["invented"],SHOT_PROVENANCE,6)));
ok("out of range fact reference is rejected",()=>assert.throws(()=>auditVisibleEvidence(["bad"],{bad:{kind:"observed",factIds:[6]}},6)));
ok("context cannot claim an event",()=>assert.throws(()=>auditVisibleEvidence(["bad"],{bad:{kind:"context",factIds:[2]}},6)));
ok("invalid evidence input is rejected",()=>assert.throws(()=>auditVisibleEvidence("hand",SHOT_PROVENANCE,6)));
ok("coverage result arrays are immutable",()=>assert.ok(Object.isFrozen(auditVisibleEvidence(["hand"],SHOT_PROVENANCE,6).shown)));
console.log(count,"total narrative, playback, provenance and evidence coverage checks registered");
