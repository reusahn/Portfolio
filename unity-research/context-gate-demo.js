"use strict";
(function () {
  var container = document.getElementById("cg-demo");
  if (!container || !window.ContextGateModel) return;
  var byId = id => document.getElementById(id);
  var policy = byId("cg-policy"), delay = byId("cg-delay"), grid = byId("cg-board");
  var hintBox = byId("cg-hint"), logBox = byId("cg-log"), state = byId("cg-state");
  var board, selected = 0, epoch = 0, requestNo = 0, pending = null, events = [];
  var start = performance.now();
  var sessionId = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : "browser-" + Date.now();
  function record(eventName, detail) {
    var e = Object.assign({ sequence: events.length, kind: "browser-concept", sessionId,
      trialId: "concept-" + epoch, epoch, policy: policy.value, utc: new Date().toISOString(),
      elapsedSeconds: (performance.now() - start) / 1000, eventName, revision: board ? board.revision : 0,
      positions: board ? board.snapshot() : [] }, detail || {});
    events.push(e);
    logBox.textContent = events.slice(-35).map(x =>
      x.elapsedSeconds.toFixed(3) + "  " + x.eventName + (x.reason ? " / " + x.reason : "")).join("\n");
    logBox.scrollTop = logBox.scrollHeight;
  }
  function clearPending(reason) {
    if (!pending) return;
    clearTimeout(pending.delivery);
    clearTimeout(pending.timeout);
    record("hint_cancelled", { requestId: pending.hint.requestId, reason });
    pending = null;
  }
  function begin() {
    clearPending("trial_reset");
    epoch++;
    board = new window.ContextGateModel.Board();
    selected = 0;
    hintBox.textContent = "No hint shown. Select an object, then an empty slot.";
    hintBox.dataset.kind = "";
    record("trial_start", { responseDelaySeconds: Number(delay.value) });
    render();
  }
  function render() {
    grid.replaceChildren();
    for (let slot = 0; slot < 6; slot++) {
      var button = document.createElement("button");
      button.className = "slot";
      button.type = "button";
      button.dataset.label = "SLOT " + (slot + 1) + (slot < 3 ? " / " + "ABC"[slot] + " TARGET" : " / BUFFER");
      var token = board.positions.indexOf(slot);
      button.setAttribute("aria-label", token < 0 ? "Move selected object " + "ABC"[selected] + " to empty slot " + (slot + 1) :
        "Select object " + "ABC"[token] + " in slot " + (slot + 1));
      if (token >= 0) {
        var badge = document.createElement("span");
        badge.className = "token " + "abc"[token] + (selected === token ? " selected" : "");
        badge.textContent = "ABC"[token];
        button.append(badge);
      }
      button.addEventListener("click", function () {
        var tokenAtSlot = board.positions.indexOf(slot);
        if (tokenAtSlot >= 0) { selected = tokenAtSlot; render(); }
        else move(selected, slot);
      });
      grid.append(button);
    }
    state.textContent = "Trial " + epoch + " · revision " + board.revision + " · " + policy.options[policy.selectedIndex].text +
      " · selected " + "ABC"[selected] + (board.solved() ? " · all targets reached" : "");
    byId("cg-request").disabled = !!pending || board.solved();
    byId("cg-change").disabled = !pending;
    byId("cg-timeout").disabled = !!pending || board.solved();
  }
  function move(token, to) {
    var from = board.positions[token], result = board.move(token, to);
    record(result.ok ? "object_moved" : "move_rejected", { token, from, to, reason: result.reason });
    if (result.ok) { hintBox.textContent = pending ? "The world changed. The pending hint still uses its original snapshot." : "Object moved. Request another hint."; hintBox.dataset.kind = ""; }
    render();
  }
  function request(injectTimeout) {
    if (pending) return;
    var hint = board.hint("r" + (++requestNo), epoch);
    if (!hint) return;
    record("hint_requested", { requestId: hint.requestId, token: hint.token, from: hint.from, to: hint.to,
      snapshotRevision: hint.revision, providerFault: injectTimeout ? "Timeout" : "None" });
    hintBox.textContent = "Hint requested from revision " + hint.revision + ". Keep moving, or move the suggested object early.";
    var work = { hint, delivery: null, timeout: null };
    pending = work;
    work.timeout = setTimeout(function () {
      if (pending !== work) return;
      clearTimeout(work.delivery);
      record("hint_timeout", { requestId: hint.requestId, reason: "request_deadline" });
      pending = null; hintBox.textContent = "Request timed out. The board is still usable."; render();
    }, 5000);
    work.delivery = setTimeout(function () {
      if (pending !== work || hint.epoch !== epoch) return;
      clearTimeout(work.timeout); pending = null;
      var validity = board.applicable(hint);
      record("hint_received", { requestId: hint.requestId, snapshotRevision: hint.revision,
        token: hint.token, from: hint.from, to: hint.to, applicable: validity.ok, reason: validity.reason });
      var discard = policy.value === "Revalidate" && !validity.ok;
      record(discard ? "hint_discarded" : "hint_displayed", { requestId: hint.requestId,
        token: hint.token, from: hint.from, to: hint.to, snapshotRevision: hint.revision,
        applicable: validity.ok, reason: validity.reason });
      hintBox.dataset.kind = discard ? "discard" : "";
      hintBox.textContent = discard ?
        "Hint withheld: " + validity.reason.replaceAll("_", " ") + ". The full event remains in the log." :
        "Move " + "ABC"[hint.token] + " from slot " + (hint.from + 1) + " to slot " + (hint.to + 1) +
        (validity.ok ? ". Preconditions still hold." : ". This advice is now inapplicable.");
      render();
    }, injectTimeout ? 6000 : Number(delay.value) * 1000);
    render();
  }
  byId("cg-request").addEventListener("click", () => request(false));
  byId("cg-timeout").addEventListener("click", () => request(true));
  byId("cg-change").addEventListener("click", function () {
    if (!pending) return;
    var h = pending.hint;
    var dest = board.positions.includes(h.to) ? [0,1,2,3,4,5].find(s => !board.positions.includes(s)) : h.to;
    if (dest !== undefined) move(h.token, dest);
  });
  byId("cg-reset").addEventListener("click", begin);
  policy.addEventListener("change", begin);
  delay.addEventListener("change", begin);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && pending) { clearPending("page_hidden"); hintBox.textContent = "Pending hint cancelled when the page was hidden."; render(); }
  });
  function download(name, type, data) {
    var url = URL.createObjectURL(new Blob([data], { type }));
    var a = document.createElement("a"); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  byId("cg-json").addEventListener("click", () => download("browser_concept_events.json", "application/json",
    JSON.stringify({ kind: "browser-concept", warning: "Browser interaction log. Not Unity execution or study data.", events }, null, 2)));
  byId("cg-csv").addEventListener("click", function () {
    var fields = ["sequence","kind","sessionId","trialId","policy","utc","elapsedSeconds","eventName","revision","requestId","snapshotRevision","token","from","to","applicable","reason","positions"];
    var quote = x => '"' + String(x == null ? "" : Array.isArray(x) ? x.join(";") : x).replaceAll('"', '""') + '"';
    download("browser_concept_events.csv", "text/csv", fields.join(",") + "\r\n" +
      events.map(e => fields.map(k => quote(e[k])).join(",")).join("\r\n") + "\r\n");
  });
  begin();
})();
