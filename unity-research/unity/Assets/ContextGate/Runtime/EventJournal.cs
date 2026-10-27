using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEngine;

namespace Jonghoon.ContextGate
{
    [Serializable]
    public sealed class ResearchEvent
    {
        public string sessionId, trialId, policy, utc, eventName, requestId, reason, providerFault;
        public int sequence, frame, epoch, revision, snapshotRevision, token, from, to, applicable, boardSeed;
        public double elapsedSeconds;
        public int[] positions;
    }

    [Serializable]
    public sealed class SessionReport
    {
        public string schemaVersion = "1.0";
        public string codeVersion = "context-gate-0.1.1";
        public string sessionId, startedUtc, unityVersion, platform, endedReason;
        public SessionConfig config;
        public List<TrialSpec> trials;
        public List<ResearchEvent> events = new List<ResearchEvent>();
    }

    // Discrete events are flushed immediately. These are application timestamps, not display-onset measurements.
    public sealed class EventJournal : IDisposable
    {
        readonly Stopwatch clock = Stopwatch.StartNew();
        readonly StreamWriter jsonl, csv;
        readonly SessionReport report;
        bool disposed;
        public string DirectoryPath { get; }
        public double Elapsed => clock.Elapsed.TotalSeconds;
        public string Id => report.sessionId;

        public EventJournal(string parent, SessionConfig config, List<TrialSpec> trials)
        {
            report = new SessionReport { sessionId = Guid.NewGuid().ToString("N"),
                startedUtc = DateTime.UtcNow.ToString("O"), unityVersion = Application.unityVersion,
                platform = Application.platform.ToString(), config = config, trials = trials };
            DirectoryPath = Path.Combine(parent, report.sessionId);
            Directory.CreateDirectory(DirectoryPath);
            // Metadata exists before the first trial even if the run later stops unexpectedly.
            File.WriteAllText(Path.Combine(DirectoryPath, "metadata.json"), JsonUtility.ToJson(report, true), Encoding.UTF8);
            StreamWriter openedJsonl = null, openedCsv = null;
            try
            {
                openedJsonl = NewWriter("events.jsonl");
                openedCsv = NewWriter("events.csv");
                openedCsv.WriteLine("sequence,sessionId,trialId,policy,utc,elapsedSeconds,frame,epoch,revision,snapshotRevision,boardSeed,eventName,requestId,token,from,to,applicable,providerFault,reason,positions");
                openedCsv.Flush();
                jsonl = openedJsonl;
                csv = openedCsv;
            }
            catch
            {
                // A failed constructor has no caller-owned instance to dispose.
                CloseAfterFailure(openedCsv);
                CloseAfterFailure(openedJsonl);
                throw;
            }
        }

        StreamWriter NewWriter(string name)
        {
            var stream = new FileStream(Path.Combine(DirectoryPath, name), FileMode.CreateNew, FileAccess.Write, FileShare.Read);
            try { return new StreamWriter(stream, new UTF8Encoding(false)); }
            catch { CloseAfterFailure(stream); throw; }
        }

        static void CloseAfterFailure(IDisposable resource)
        {
            // Preserve the original I/O failure if cleanup also fails.
            try { resource?.Dispose(); } catch { }
        }

        public void Write(ResearchEvent e)
        {
            if (disposed) throw new ObjectDisposedException(nameof(EventJournal));
            e.sequence = report.events.Count;
            e.sessionId = Id;
            e.utc = DateTime.UtcNow.ToString("O");
            e.elapsedSeconds = Elapsed;
            e.frame = Time.frameCount;
            report.events.Add(e);
            jsonl.WriteLine(JsonUtility.ToJson(e));
            jsonl.Flush();
            object[] fields = { e.sequence, e.sessionId, e.trialId, e.policy, e.utc,
                e.elapsedSeconds.ToString("R", CultureInfo.InvariantCulture), e.frame, e.epoch,
                e.revision, e.snapshotRevision, e.boardSeed, e.eventName, e.requestId,
                e.token, e.from, e.to, e.applicable, e.providerFault, e.reason, string.Join(";", e.positions ?? new int[0]) };
            csv.WriteLine(string.Join(",", Array.ConvertAll(fields, Escape)));
            csv.Flush();
        }

        static string Escape(object value) => "\"" +
            Convert.ToString(value, CultureInfo.InvariantCulture).Replace("\"", "\"\"") + "\"";

        public void Finish(string reason)
        {
            if (disposed) return;
            report.endedReason = reason;
            string temp = Path.Combine(DirectoryPath, "session.json.tmp");
            File.WriteAllText(temp, JsonUtility.ToJson(report, true), Encoding.UTF8);
            File.Move(temp, Path.Combine(DirectoryPath, "session.json"));
            Dispose();
        }

        public void Dispose()
        {
            if (disposed) return;
            disposed = true;
            try { jsonl.Dispose(); } finally { csv.Dispose(); }
        }
    }
}
