/** Reproducible source-level QA gate. No browser, model, or user-study claims. */
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
const cwd=dirname(fileURLToPath(import.meta.url));
const files=["story.mjs","edit-contract.mjs","playback.mjs","evidence.mjs","coverage.mjs","app.mjs","tests.mjs"];
let failures=0;
for(const file of files){
  const result=spawnSync(process.execPath,["--check",file],{cwd,encoding:"utf8"});
  const passed=result.status===0&&!result.error;
  console.log((passed?"PASS":"FAIL")+" syntax "+file);
  if(!passed){failures++;if(result.error)console.error(String(result.error));if(result.stderr)console.error(result.stderr.trim());}
}
if(failures===0){
  const result=spawnSync(process.execPath,["tests.mjs"],{cwd,encoding:"utf8"});
  if(result.stdout)process.stdout.write(result.stdout);
  if(result.stderr)process.stderr.write(result.stderr);
  if(result.status!==0||result.error){failures++;console.error("FAIL narrative tests; exit status:",result.status,"error:",result.error?String(result.error):"none");}
  else console.log("PASS Node narrative test process (see individual assertions above)");
}else console.error("SKIP narrative tests: syntax gate failed");
console.log("Browser, screen-reader, mobile, model, footage and human-study QA: NOT RUN by this script");
process.exitCode=failures?1:0;
