using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Jonghoon.ContextGate
{
    public sealed class ExperimentRunner : MonoBehaviour
    {
        public ExperimentSettings settings;
        public RunState State { get; private set; } = RunState.Ready;
        public string LastError { get; private set; } = "";
        public string OutputPath { get; private set; } = "";
        public string LastEvent { get; private set; } = "";
        public PlacementHint VisibleHint { get; private set; }
        public TrialSpec CurrentTrial => trials != null && index >= 0 && index < trials.Count ? trials[index] : null;
        public int Score => board == null ? 0 : board.CorrectCount;
        public int TrialNumber => index + 1;
        public int TrialCount => trials == null ? 0 : trials.Count;
        public int[] Positions => board == null ? null : board.CopyPositions();
        public int Revision => board == null ? 0 : board.Revision;
        public bool WaitingForHint => pending != null;
        public double SecondsLeft => journal == null ? 0 :
            Math.Max(0, trialDeadline - (State == RunState.Paused ? pausedAt : journal.Elapsed));

        sealed class Pending
        {
            public PlacementHint hint;
            public double due, deadline;
            public ProviderFault fault;
        }
        SessionConfig config;
        List<TrialSpec> trials;
        BoardState board;
        EventJournal journal;
        Pending pending;
        int index = -1, epoch, requestNumber;
        double trialDeadline, pausedAt;
        bool closed = true;

        public void BeginSession() => Guard(() =>
        {
            if (State == RunState.Running || State == RunState.Paused || State == RunState.BetweenTrials) return;
            if (settings == null) throw new InvalidOperationException("Assign ExperimentSettings.");
            config = settings.Freeze();
            trials = SessionDesign.Build(config);
            board = null; index = -1; epoch = 0; requestNumber = 0; pending = null; VisibleHint = null;
            LastError = "";
            journal = new EventJournal(Path.Combine(Application.persistentDataPath, "ContextGate"), config, trials);
            OutputPath = journal.DirectoryPath;
            closed = false;
            Emit("session_start");
            BeginTrial(0);
        });

        void BeginTrial(int next)
        {
            index = next; epoch++;
            board = BoardState.Create(CurrentTrial.boardSeed);
            pending = null; VisibleHint = null;
            trialDeadline = journal.Elapsed + config.trialTimeoutSeconds;
            State = RunState.Running;
            Emit("trial_start", reason: "targets_A1_B2_C3");
        }

        public void Move(int token, int destination) => Guard(() =>
        {
            if (State != RunState.Running) return;
            int from = board.SlotOf(token);
            string reason;
            if (!board.Move(token, destination, out reason))
            { Emit("move_rejected", token: token, from: from, to: destination, reason: reason); return; }
            Emit("object_moved", token: token, from: from, to: destination, reason: reason);
            // Both conditions clear visible help on the next user move.
            if (VisibleHint != null) { Emit("hint_cleared", VisibleHint, "user_move"); VisibleHint = null; }
            if (board.Solved) EndTrial("completed");
        });

        public void RequestHint(ProviderFault fault = ProviderFault.None) => Guard(() =>
        {
            if (State != RunState.Running) return;
            if (pending != null) { Emit("request_rejected", reason: "busy"); return; }
            var hint = board.Plan("r" + (++requestNumber), epoch);
            if (hint == null) { Emit("request_rejected", reason: "no_legal_hint"); return; }
            double now = journal.Elapsed;
            pending = new Pending { hint = hint, fault = fault,
                due = now + (fault == ProviderFault.Timeout ? config.requestTimeoutSeconds + 1 : config.responseDelaySeconds),
                deadline = now + config.requestTimeoutSeconds };
            Emit("hint_requested", hint, "scripted_provider", fault: fault);
        });

        void Update()
        {
            if (State != RunState.Running || closed) return;
            Guard(() =>
            {
                double now = journal.Elapsed;
                if (now >= trialDeadline) { EndTrial("trial_timeout"); return; }
                if (pending == null) return;
                if (now >= pending.deadline)
                { Emit("hint_timeout", pending.hint, "request_deadline", fault: pending.fault); pending = null; return; }
                if (now < pending.due) return;
                var p = pending; pending = null;
                if (p.hint.epoch != epoch) { Emit("hint_cancelled", p.hint, "epoch_changed"); return; }
                if (p.fault == ProviderFault.Malformed) p.hint.to = 999;
                if (!board.WellFormed(p.hint))
                { Emit("provider_error", p.hint, "malformed_payload", fault: p.fault); return; }
                string reason;
                bool applicable = board.Applicable(p.hint, out reason);
                Emit("hint_received", p.hint, reason, applicable: applicable ? 1 : 0, fault: p.fault);
                if (CurrentTrial.policy == HintPolicy.Revalidate && !applicable)
                { Emit("hint_discarded", p.hint, reason, applicable: 0); return; }
                VisibleHint = p.hint;
                Emit("hint_displayed", p.hint, reason, applicable: applicable ? 1 : 0);
            });
        }

        public void Pause() => Guard(() =>
        {
            if (State != RunState.Running) return;
            CancelPending("paused");
            VisibleHint = null;
            pausedAt = journal.Elapsed;
            State = RunState.Paused;
            Emit("trial_paused");
        });

        public void Resume() => Guard(() =>
        {
            if (State != RunState.Paused) return;
            trialDeadline += journal.Elapsed - pausedAt;
            State = RunState.Running;
            Emit("trial_resumed");
        });

        // A reset restarts this trial's layout and cancels work from its previous epoch.
        // Analysis must flag or exclude reset trials; the event is never hidden.
        public void ResetTrial() => Guard(() =>
        {
            if (State != RunState.Running && State != RunState.Paused) return;
            CancelPending("reset");
            Emit("trial_reset");
            BeginTrial(index);
        });

        void CancelPending(string reason)
        {
            if (pending != null) Emit("hint_cancelled", pending.hint, reason, fault: pending.fault);
            pending = null;
        }

        void EndTrial(string reason)
        {
            CancelPending("trial_ended");
            VisibleHint = null;
            Emit("trial_end", reason: reason);
            State = RunState.BetweenTrials;
        }

        public void NextTrial() => Guard(() =>
        {
            if (State != RunState.BetweenTrials) return;
            if (index + 1 < trials.Count) { BeginTrial(index + 1); return; }
            Emit("session_end", reason: "completed");
            journal.Finish("completed"); closed = true; State = RunState.Complete;
        });

        public void Abort() => Guard(() =>
        {
            if (closed || journal == null) return;
            CancelPending("session_aborted");
            Emit("session_end", reason: "aborted");
            journal.Finish("aborted"); closed = true; State = RunState.Complete;
        });

        void Emit(string name, PlacementHint hint = null, string reason = "",
            int token = -1, int from = -1, int to = -1, int applicable = -1, ProviderFault fault = ProviderFault.None)
        {
            LastEvent = name + (reason.Length > 0 ? ": " + reason : "");
            journal.Write(new ResearchEvent { trialId = CurrentTrial == null ? "" : CurrentTrial.id,
                policy = CurrentTrial == null ? "" : CurrentTrial.policy.ToString(), epoch = epoch,
                revision = Revision, snapshotRevision = hint == null ? -1 : hint.revision,
                boardSeed = CurrentTrial == null ? -1 : CurrentTrial.boardSeed,
                eventName = name, requestId = hint == null ? "" : hint.requestId,
                token = hint == null ? token : hint.token, from = hint == null ? from : hint.from,
                to = hint == null ? to : hint.to, applicable = applicable, reason = reason,
                providerFault = fault.ToString(), positions = Positions ?? new int[0] });
        }

        void Guard(Action action)
        {
            try { action(); }
            catch (Exception e)
            {
                LastError = e.GetType().Name + ": " + e.Message;
                State = RunState.Faulted; pending = null; VisibleHint = null;
                try { if (!closed && journal != null) Emit("session_fault", reason: LastError); } catch { }
                try { if (journal != null) journal.Dispose(); } catch { }
                closed = true;
                Debug.LogException(e, this);
            }
        }
        void OnApplicationFocus(bool focused) { if (!focused) Pause(); }
        void OnApplicationPause(bool paused) { if (paused) Pause(); }
        void OnDisable() { Abort(); }
    }
}
