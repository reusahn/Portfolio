// Independent portfolio example. This is not recovered AI ZOO production source.
// Unity compilation and physical actuation have not yet been verified.
using System;
using UnityEngine;

namespace ResearchSamples
{
    [Serializable]
    public struct AffectVector
    {
        public float anger;
        public float sadness;
        public float fear;
        public float despair;

        public void Clamp()
        {
            anger = Mathf.Clamp01(anger);
            sadness = Mathf.Clamp01(sadness);
            fear = Mathf.Clamp01(fear);
            despair = Mathf.Clamp01(despair);
        }
    }

    // The downstream hardware adapter must enforce calibrated angles and an emergency stop.
    // These values describe expressive intent, not servo degrees or a production serial protocol.
    public struct MotionIntent
    {
        public float speed;       // 0..1
        public float power;       // 0..1
        public float phaseSpread; // 0..1 across three motors
        public float light;       // 0..1
        public float voiceTension; // 0..1; map only to supported TTS controls
    }

    public sealed class AiZooAffectRouter : MonoBehaviour
    {
        [SerializeField, Range(0f, 1f)] private float handWeight = 0.15f;
        [SerializeField, Min(0.01f)] private float decayPerSecond = 0.08f;
        [SerializeField, Min(0.01f)] private float publishInterval = 0.1f;

        public event Action<MotionIntent> IntentReady;
        private AffectVector state;
        private float nextPublish;

        // Call this with structured affect data returned by an LLM adapter for a typed turn.
        // Treat the model's numbers as performance controls, never as measured emotion.
        public bool TryApplyTypedTurn(string affectJson)
        {
            if (string.IsNullOrWhiteSpace(affectJson)) return false;
            try
            {
                var value = JsonUtility.FromJson<AffectVector>(affectJson);
                if (!Finite(value.anger) || !Finite(value.sadness) ||
                    !Finite(value.fear) || !Finite(value.despair)) return false;
                value.Clamp();
                state.anger = Mathf.Max(state.anger, value.anger);
                state.sadness = Mathf.Max(state.sadness, value.sadness);
                state.fear = Mathf.Max(state.fear, value.fear);
                state.despair = Mathf.Max(state.despair, value.despair);
                return true;
            }
            catch (ArgumentException) { return false; }
        }

        // A Leap Motion adapter supplies calibrated contact intensity, independent of text.
        public void ApplyHandContact(float normalizedIntensity)
        {
            if (!Finite(normalizedIntensity)) return;
            state.fear = Mathf.Clamp01(state.fear +
                Mathf.Clamp01(normalizedIntensity) * handWeight);
        }

        private void Update()
        {
            float delta = decayPerSecond * Time.deltaTime;
            state.anger = Mathf.MoveTowards(state.anger, 0f, delta);
            state.sadness = Mathf.MoveTowards(state.sadness, 0f, delta);
            state.fear = Mathf.MoveTowards(state.fear, 0f, delta);
            state.despair = Mathf.MoveTowards(state.despair, 0f, delta);
            if (Time.unscaledTime < nextPublish) return;
            nextPublish = Time.unscaledTime + publishInterval;
            IntentReady?.Invoke(Map(state));
        }

        public void ResetEncounter()
        {
            state = default(AffectVector);
            IntentReady?.Invoke(Map(state));
        }

        public static MotionIntent Map(AffectVector a)
        {
            a.Clamp();
            // Despair attenuates motion; anger increases speed and spread.
            float attenuation = 1f - a.despair;
            return new MotionIntent
            {
                speed = Mathf.Clamp01((a.anger * 0.75f + a.fear * 0.25f + a.sadness * 0.15f) * attenuation),
                power = Mathf.Clamp01((a.anger * 0.8f + a.sadness * 0.3f + a.fear * 0.1f) * attenuation),
                phaseSpread = Mathf.Clamp01(a.anger * 0.85f),
                light = Mathf.Clamp01(0.25f + a.fear * 0.5f + a.anger * 0.25f),
                voiceTension = Mathf.Clamp01(a.anger * 0.65f + a.fear * 0.35f)
            };
        }

        private static bool Finite(float value) => !float.IsNaN(value) && !float.IsInfinity(value);
    }
}
