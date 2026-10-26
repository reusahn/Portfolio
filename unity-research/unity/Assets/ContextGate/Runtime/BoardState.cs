using System;

namespace Jonghoon.ContextGate
{
    [Serializable]
    public sealed class PlacementHint
    {
        public string requestId;
        public int epoch, token, from, to, revision;
    }

    // Pure C#: the task model has no dependency on UnityEngine or input hardware.
    public sealed class BoardState
    {
        readonly int[] positions;
        public int SlotCount { get; }
        public int TokenCount => positions.Length;
        public int Revision { get; private set; }
        public bool Solved => CorrectCount == TokenCount;
        public int CorrectCount
        {
            get { int n = 0; for (int i = 0; i < TokenCount; i++) if (positions[i] == i) n++; return n; }
        }

        public BoardState(int[] initial, int slotCount = 6)
        {
            if (initial == null || initial.Length == 0 || initial.Length > slotCount)
                throw new ArgumentException("Invalid token count.");
            positions = (int[])initial.Clone();
            SlotCount = slotCount;
            for (int i = 0; i < positions.Length; i++)
            {
                if (positions[i] < 0 || positions[i] >= slotCount) throw new ArgumentException("Invalid slot.");
                for (int j = 0; j < i; j++)
                    if (positions[j] == positions[i]) throw new ArgumentException("Slots must be unique.");
            }
        }

        public static BoardState Create(int seed)
        {
            var random = new Random(seed);
            var slots = new[] { 0, 1, 2, 3, 4, 5 };
            for (int i = slots.Length - 1; i > 0; i--)
            {
                int j = random.Next(i + 1);
                int t = slots[i]; slots[i] = slots[j]; slots[j] = t;
            }
            var b = new BoardState(new[] { slots[0], slots[1], slots[2] });
            return b.Solved ? new BoardState(new[] { 3, 4, 5 }) : b;
        }

        public int[] CopyPositions() => (int[])positions.Clone();
        public int SlotOf(int token) => token >= 0 && token < TokenCount ? positions[token] : -1;
        public bool Occupied(int slot) => Array.IndexOf(positions, slot) >= 0;

        public bool Move(int token, int slot, out string reason)
        {
            if (token < 0 || token >= TokenCount || slot < 0 || slot >= SlotCount)
            { reason = "out_of_range"; return false; }
            if (positions[token] == slot) { reason = "no_change"; return false; }
            if (Occupied(slot)) { reason = "destination_occupied"; return false; }
            positions[token] = slot;
            Revision++;
            reason = "moved";
            return true;
        }

        public PlacementHint Plan(string requestId, int epoch)
        {
            if (Solved) return null;
            // Prefer a direct goal move. Otherwise use an empty buffer to break a cycle.
            for (int i = 0; i < TokenCount; i++)
                if (positions[i] != i && !Occupied(i)) return Hint(i, i, requestId, epoch);
            for (int i = 0; i < TokenCount; i++)
            {
                if (positions[i] == i) continue;
                for (int s = TokenCount; s < SlotCount; s++)
                    if (!Occupied(s)) return Hint(i, s, requestId, epoch);
            }
            return null;
        }

        PlacementHint Hint(int token, int to, string id, int epoch) =>
            new PlacementHint { requestId = id, epoch = epoch, token = token,
                from = positions[token], to = to, revision = Revision };

        public bool WellFormed(PlacementHint h) => h != null &&
            h.token >= 0 && h.token < TokenCount &&
            h.from >= 0 && h.from < SlotCount &&
            h.to >= 0 && h.to < SlotCount && h.from != h.to &&
            !string.IsNullOrEmpty(h.requestId);

        public bool Applicable(PlacementHint h, out string reason)
        {
            if (!WellFormed(h)) { reason = "malformed"; return false; }
            if (positions[h.token] != h.from) { reason = "source_changed"; return false; }
            if (Occupied(h.to)) { reason = "destination_occupied"; return false; }
            reason = "preconditions_hold";
            return true;
        }
    }
}
