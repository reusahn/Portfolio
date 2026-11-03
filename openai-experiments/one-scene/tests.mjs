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
console.log(count,"narrative contract checks passed");
