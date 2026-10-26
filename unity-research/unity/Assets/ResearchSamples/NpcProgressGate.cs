using System;
using UnityEngine;
using UnityEngine.Events;

namespace Jonghoon.ResearchSamples
{
    // Independent example. It does not describe the private Escape Metro implementation.
    public sealed class NpcProgressGate : MonoBehaviour
    {
        [Serializable] public sealed class Reply { public string text, cue; public int turn, epoch; }
        [Serializable] public sealed class TextEvent : UnityEvent<string> { }
        [SerializeField] string puzzleCode = "DEMO-42";
        [SerializeField] TextEvent onText = new TextEvent();
        [SerializeField] UnityEvent onUnlocked = new UnityEvent();
        bool evidenceFound, unlocked, awaiting;
        int turn, epoch;
        double deadline;

        public int BeginTurn()
        {
            awaiting = true; deadline = Time.realtimeSinceStartupAsDouble + 15;
            return ++turn;
        }
        public int Epoch => epoch;
        public void RegisterPuzzleEvidence() { evidenceFound = true; }

        public bool AcceptReply(string json)
        {
            if (!awaiting || Time.realtimeSinceStartupAsDouble >= deadline) return false;
            Reply reply;
            try { reply = JsonUtility.FromJson<Reply>(json); } catch { return false; }
            if (reply == null || reply.turn != turn || reply.epoch != epoch ||
                string.IsNullOrWhiteSpace(reply.text) || reply.text.Length > 4000) return false;
            // Only presentation cues are allowed. A model cannot emit an unlock command.
            if (reply.cue != "speak" && reply.cue != "hint") return false;
            awaiting = false; onText.Invoke(reply.text); return true;
        }

        public bool EnterCode(string input)
        {
            if (unlocked || !evidenceFound || !string.Equals(input, puzzleCode, StringComparison.Ordinal)) return false;
            unlocked = true; onUnlocked.Invoke(); return true;
        }
        public void ResetPuzzle()
        {
            epoch++; awaiting = false; evidenceFound = false; unlocked = false;
        }
    }
}
