/* Browser concept model. This is not a Unity build or a port verified against Unity. */
(function (root) {
  "use strict";
  class Board {
    constructor(initial = [3, 4, 5], slots = 6) {
      if (!Array.isArray(initial) || !initial.length || initial.length > slots ||
          initial.some(x => !Number.isInteger(x) || x < 0 || x >= slots) ||
          new Set(initial).size !== initial.length) throw new Error("Invalid layout");
      this.positions = initial.slice();
      this.slots = slots;
      this.revision = 0;
    }
    snapshot() { return this.positions.slice(); }
    solved() { return this.positions.every((x, i) => x === i); }
    move(token, to) {
      if (!Number.isInteger(token) || !Number.isInteger(to) || token < 0 ||
          token >= this.positions.length || to < 0 || to >= this.slots) return { ok: false, reason: "out_of_range" };
      if (this.positions[token] === to) return { ok: false, reason: "no_change" };
      if (this.positions.includes(to)) return { ok: false, reason: "destination_occupied" };
      this.positions[token] = to;
      this.revision++;
      return { ok: true, reason: "moved" };
    }
    hint(requestId, epoch) {
      if (this.solved()) return null;
      let token = this.positions.findIndex((p, i) => p !== i && !this.positions.includes(i));
      let to = token;
      if (token < 0) {
        token = this.positions.findIndex((p, i) => p !== i);
        to = Array.from({ length: this.slots }, (_, i) => i)
          .find(s => s >= this.positions.length && !this.positions.includes(s));
      }
      if (token < 0 || to === undefined) return null;
      return { requestId, epoch, token, from: this.positions[token], to, revision: this.revision };
    }
    wellFormed(h) {
      return !!h && !!h.requestId && Number.isInteger(h.token) && Number.isInteger(h.from) &&
        Number.isInteger(h.to) && h.token >= 0 && h.token < this.positions.length &&
        h.from >= 0 && h.from < this.slots && h.to >= 0 && h.to < this.slots && h.from !== h.to;
    }
    applicable(h) {
      if (!this.wellFormed(h)) return { ok: false, reason: "malformed" };
      if (this.positions[h.token] !== h.from) return { ok: false, reason: "source_changed" };
      if (this.positions.includes(h.to)) return { ok: false, reason: "destination_occupied" };
      return { ok: true, reason: "preconditions_hold" };
    }
  }
  root.ContextGateModel = { Board };
})(typeof window !== "undefined" ? window : globalThis);
