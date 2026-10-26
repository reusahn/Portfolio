function checkModel(Board) {
  let assertions = 0, layouts = 0;
  function ok(value, message) { assertions++; if (!value) throw new Error(message); }
  let b = new Board(), h = b.hint("r", 1);
  b.move(0, 0); ok(!b.applicable(h).ok && b.applicable(h).reason === "source_changed", "Moved source must invalidate advice");
  b = new Board(); h = b.hint("r", 1);
  b.move(1, 1); ok(b.applicable(h).ok && b.revision !== h.revision, "Unrelated move must preserve applicable advice");
  b = new Board(); h = b.hint("r", 1);
  b.move(1, 0); ok(b.applicable(h).reason === "destination_occupied", "Occupied target must invalidate advice");
  ok(!b.applicable({requestId:"bad",token:0,from:3,to:999}).ok, "Malformed destination");
  ok(!b.move(0, 0).ok && b.revision === 1, "Rejected move must not change revision");
  const initial = [3,4,5]; b = new Board(initial); initial[0] = 0;
  const copy = b.snapshot(); copy[1] = 1;
  ok(b.positions[0] === 3 && b.positions[1] === 4, "Snapshot and constructor must copy positions");
  for (let a = 0; a < 6; a++) for (let c = 0; c < 6; c++) for (let d = 0; d < 6; d++) {
    if (new Set([a,c,d]).size !== 3) continue;
    const board = new Board([a,c,d]); layouts++;
    let n = 0;
    while (!board.solved() && n++ < 12) {
      const hint = board.hint("r" + n, 1);
      ok(board.wellFormed(hint) && board.applicable(hint).ok, "Planner must return a legal move");
      ok(board.move(hint.token, hint.to).ok, "Planned move must execute");
      ok(new Set(board.positions).size === 3, "No overlap after move");
    }
    ok(board.solved(), "Layout must reach the goal: " + [a,c,d]);
    ok(board.hint("done", 1) === null, "Solved board must not produce a hint");
  }
  return { result: "passed", layouts, assertions, scope: "JavaScript task model only" };
}
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "context-gate-model.js"), "utf8"), sandbox);
console.log(JSON.stringify(checkModel(sandbox.window.ContextGateModel.Board), null, 2));
