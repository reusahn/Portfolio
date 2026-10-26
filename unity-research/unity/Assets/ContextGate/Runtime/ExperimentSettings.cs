using System;
using System.Collections.Generic;
using UnityEngine;

namespace Jonghoon.ContextGate
{
    public enum HintPolicy { DeliverAll, Revalidate }
    public enum RunState { Ready, Running, Paused, BetweenTrials, Complete, Faulted }
    public enum ProviderFault { None, Timeout, Malformed }

    [Serializable]
    public sealed class SessionConfig
    {
        public int seed, pairs;
        public float responseDelaySeconds, requestTimeoutSeconds, trialTimeoutSeconds;
        public bool reverseFirstPolicy;
    }

    [CreateAssetMenu(menuName = "Jonghoon Research/Context Gate Settings")]
    public sealed class ExperimentSettings : ScriptableObject
    {
        public int seed = 2401;
        [Range(1, 12)] public int pairs = 3;
        [Min(0)] public float responseDelaySeconds = 1.5f;
        [Min(0.1f)] public float requestTimeoutSeconds = 5f;
        [Min(1f)] public float trialTimeoutSeconds = 90f;
        public bool reverseFirstPolicy;

        public SessionConfig Freeze()
        {
            if (pairs < 1 || pairs > 12 || !Finite(responseDelaySeconds) ||
                !Finite(requestTimeoutSeconds) || !Finite(trialTimeoutSeconds) ||
                responseDelaySeconds < 0 || requestTimeoutSeconds <= 0 || trialTimeoutSeconds <= 0)
                throw new ArgumentException("Invalid experiment settings.");
            return new SessionConfig { seed = seed, pairs = pairs, responseDelaySeconds = responseDelaySeconds,
                requestTimeoutSeconds = requestTimeoutSeconds, trialTimeoutSeconds = trialTimeoutSeconds,
                reverseFirstPolicy = reverseFirstPolicy };
        }
        static bool Finite(float v) => !float.IsNaN(v) && !float.IsInfinity(v);
    }

    [Serializable]
    public sealed class TrialSpec
    {
        public string id;
        public int boardSeed;
        public HintPolicy policy;
    }

    public static class SessionDesign
    {
        public static List<TrialSpec> Build(SessionConfig config)
        {
            var trials = new List<TrialSpec>();
            var random = new System.Random(config.seed);
            for (int pair = 0; pair < config.pairs; pair++)
            {
                int boardSeed = random.Next();
                bool gateFirst = ((pair + (config.reverseFirstPolicy ? 1 : 0)) % 2) == 1;
                for (int half = 0; half < 2; half++)
                {
                    bool gated = half == 0 ? gateFirst : !gateFirst;
                    trials.Add(new TrialSpec { id = "pair-" + pair + (gated ? "-gate" : "-all"),
                        boardSeed = boardSeed, policy = gated ? HintPolicy.Revalidate : HintPolicy.DeliverAll });
                }
            }
            return trials;
        }
    }
}
