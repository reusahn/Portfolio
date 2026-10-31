using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Networking;

namespace ResearchSamples
{
    [Serializable] public class EmotionIndex
    {
        public int anger;
        public int happy;
        public int sadness;
        public int fear;
        public int despair;
    }

    [Serializable] public class MotorCue
    {
        public float speed;
        public float power;
        public float phase;
        public float light;
    }

    [Serializable] public class TextEvent : UnityEvent<string> { }
    [Serializable] public class FloatEvent : UnityEvent<float> { }
    [Serializable] public class ChatMessage
    {
        public string role;
        public string content;
        public ChatMessage(string role, string content) { this.role = role; this.content = content; }
    }
    [Serializable] public class ChatRequest
    {
        public string model;
        public ChatMessage[] messages;
    }
    [Serializable] public class ChatChoice
    {
        public string finish_reason;
        public ChatMessage message;
    }
    [Serializable] public class ChatResponse { public ChatChoice[] choices; }
    [Serializable] public class VoiceSettings
    {
        public float speed;
        public float stability = 0.5f;
        public float similarity_boost = 0.75f;
    }
    [Serializable] public class VoiceRequest
    {
        public string text;
        public string model_id = "eleven_multilingual_v2";
        public VoiceSettings voice_settings;
    }

    public sealed class AiZooAffectRouter : MonoBehaviour
    {
        [SerializeField] private string chatModel = "gpt-4.1-mini";
        [SerializeField] private string voiceId = "";
        [SerializeField] private string motorRelayUrl = "http://127.0.0.1:8765/cue";
        [SerializeField] private AudioSource voiceSource;
        [SerializeField] private TextEvent onReply = new TextEvent();
        [SerializeField] private TextEvent onError = new TextEvent();
        [SerializeField] private FloatEvent onLight = new FloatEvent();
        [SerializeField, Range(0f, 30f)] private float handFearGain = 12f;

        private const string instruction = "You are a digital human inside AI ZOO. Reply in 1-3 short sentences. Do not claim consciousness. Append exactly one final line: [[EMOTION|anger=0|happy=0|sadness=0|fear=0|despair=0]]. Replace each 0 with an integer from 0 to 100. These are performance controls, not measured feelings. Write nothing after this line.";
        private static readonly Regex emotionLine = new Regex(@"^\[\[EMOTION\|anger=(\d{1,3})\|happy=(\d{1,3})\|sadness=(\d{1,3})\|fear=(\d{1,3})\|despair=(\d{1,3})\]\]$", RegexOptions.CultureInvariant);
        private readonly List<ChatMessage> history = new List<ChatMessage>();
        private EmotionIndex emotion = new EmotionIndex();
        private MotorCue motor = new MotorCue();
        private bool waitingForChat;
        private bool motorSending;
        private int encounter;
        private int voiceRequest;

        private void OnEnable() { StartCoroutine(motorLoop()); }

        private void OnDisable()
        {
            StopAllCoroutines();
            waitingForChat = false;
            motorSending = false;
        }

        public void submitTurn(string typedText)
        {
            string input = typedText == null ? "" : typedText.Trim();
            if (waitingForChat || input.Length == 0 || input.Length > 500) return;
            StartCoroutine(requestReply(input, encounter));
        }

        public void onLeapContact(float normalizedContact)
        {
            if (float.IsNaN(normalizedContact) || float.IsInfinity(normalizedContact)) return;
            emotion.fear = Mathf.Clamp(Mathf.RoundToInt(emotion.fear + Mathf.Clamp01(normalizedContact) * handFearGain), 0, 100);
            updateOutputs();
        }

        public void resetEncounter()
        {
            encounter++;
            waitingForChat = false;
            history.Clear();
            emotion = new EmotionIndex();
            motor = new MotorCue();
            voiceRequest++;
            if (voiceSource != null) voiceSource.Stop();
            onLight.Invoke(0f);
        }

        private IEnumerator requestReply(string input, int requestEncounter)
        {
            waitingForChat = true;
            string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            if (string.IsNullOrWhiteSpace(key))
            {
                waitingForChat = false;
                onError.Invoke("OPENAI_API_KEY is missing.");
                yield break;
            }

            var messages = new List<ChatMessage> { new ChatMessage("system", instruction) };
            messages.AddRange(history);
            messages.Add(new ChatMessage("user", input));
            var body = new ChatRequest { model = chatModel, messages = messages.ToArray() };
            using (var request = new UnityWebRequest("https://api.openai.com/v1/chat/completions", "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(JsonUtility.ToJson(body)));
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.SetRequestHeader("Authorization", "Bearer " + key);
                request.timeout = 25;
                yield return request.SendWebRequest();
                if (requestEncounter != encounter) yield break;
                waitingForChat = false;
                if (request.result != UnityWebRequest.Result.Success)
                {
                    onError.Invoke("Chat request failed: " + request.responseCode);
                    yield break;
                }

                ChatResponse response;
                try { response = JsonUtility.FromJson<ChatResponse>(request.downloadHandler.text); }
                catch (ArgumentException)
                {
                    onError.Invoke("Chat response is invalid JSON.");
                    yield break;
                }
                if (response == null || response.choices == null || response.choices.Length == 0 ||
                    response.choices[0].finish_reason != "stop" || response.choices[0].message == null)
                {
                    onError.Invoke("Chat reply is incomplete.");
                    yield break;
                }
                string spoken;
                EmotionIndex next;
                if (!parseReply(response.choices[0].message.content, out spoken, out next))
                {
                    onError.Invoke("Chat reply has no valid emotion line.");
                    yield break;
                }

                emotion = next;
                updateOutputs();
                history.Add(new ChatMessage("user", input));
                history.Add(new ChatMessage("assistant", spoken));
                if (history.Count > 8) history.RemoveRange(0, history.Count - 8);
                onReply.Invoke(spoken);
                int currentVoiceRequest = ++voiceRequest;
                StartCoroutine(speak(spoken, voiceSpeed(emotion), voiceVolume(emotion), requestEncounter, currentVoiceRequest));
            }
        }

        public static bool parseReply(string content, out string spoken, out EmotionIndex score)
        {
            spoken = null;
            score = null;
            if (string.IsNullOrEmpty(content)) return false;
            string trimmed = content.TrimEnd();
            int lastLine = trimmed.LastIndexOf('\n');
            if (lastLine < 1) return false;
            Match match = emotionLine.Match(trimmed.Substring(lastLine + 1).TrimEnd('\r'));
            if (!match.Success) return false;
            var values = new int[5];
            for (int i = 0; i < values.Length; i++)
            {
                if (!int.TryParse(match.Groups[i + 1].Value, NumberStyles.None, CultureInfo.InvariantCulture, out values[i]) || values[i] > 100)
                    return false;
            }
            spoken = trimmed.Substring(0, lastLine).Trim();
            if (spoken.Length == 0 || spoken.Length > 500) return false;
            score = new EmotionIndex { anger = values[0], happy = values[1], sadness = values[2], fear = values[3], despair = values[4] };
            return true;
        }

        private void updateOutputs()
        {
            motor = mapMotor(emotion);
            onLight.Invoke(motor.light);
        }

        public static MotorCue mapMotor(EmotionIndex score)
        {
            float anger = Mathf.Clamp01(score.anger / 100f);
            float happy = Mathf.Clamp01(score.happy / 100f);
            float sadness = Mathf.Clamp01(score.sadness / 100f);
            float fear = Mathf.Clamp01(score.fear / 100f);
            float fade = 1f - Mathf.Clamp01(score.despair / 100f);
            return new MotorCue
            {
                speed = Mathf.Clamp01((anger * 0.8f + happy * 0.35f + sadness * 0.12f + fear * 0.55f) * fade),
                power = Mathf.Clamp01((anger * 0.85f + happy * 0.25f + sadness * 0.22f + fear * 0.45f) * fade),
                phase = Mathf.Clamp01(anger * 0.8f + fear * 0.4f),
                light = Mathf.Clamp01(happy * 0.35f + anger * 0.55f + fear * 0.4f + sadness * 0.12f)
            };
        }

        public static float voiceSpeed(EmotionIndex score)
        {
            float arousal = Mathf.Clamp01((score.anger * 0.8f + score.happy * 0.4f + score.fear * 0.65f) / 100f);
            return Mathf.Clamp(0.94f + arousal * 0.25f - score.sadness / 100f * 0.12f - score.despair / 100f * 0.12f, 0.7f, 1.2f);
        }

        public static float voiceVolume(EmotionIndex score)
        {
            float arousal = Mathf.Clamp01((score.anger * 0.8f + score.happy * 0.4f + score.fear * 0.65f) / 100f);
            return Mathf.Clamp01(0.5f + arousal * 0.45f - score.despair / 100f * 0.3f);
        }

        private IEnumerator speak(string text, float speed, float volume, int requestEncounter, int currentVoiceRequest)
        {
            string key = Environment.GetEnvironmentVariable("ELEVENLABS_API_KEY");
            if (voiceSource == null || string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(voiceId))
            {
                onError.Invoke("Voice output is not configured.");
                yield break;
            }
            var body = new VoiceRequest { text = text, voice_settings = new VoiceSettings { speed = speed } };
            string url = "https://api.elevenlabs.io/v1/text-to-speech/" + UnityWebRequest.EscapeURL(voiceId) + "?output_format=mp3_44100_128";
            using (var request = new UnityWebRequest(url, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(JsonUtility.ToJson(body)));
                request.downloadHandler = new DownloadHandlerAudioClip(url, AudioType.MPEG);
                request.SetRequestHeader("Content-Type", "application/json");
                request.SetRequestHeader("xi-api-key", key);
                request.timeout = 25;
                yield return request.SendWebRequest();
                if (requestEncounter != encounter || currentVoiceRequest != voiceRequest) yield break;
                if (request.result != UnityWebRequest.Result.Success)
                {
                    onError.Invoke("Voice request failed: " + request.responseCode);
                    yield break;
                }
                AudioClip clip = DownloadHandlerAudioClip.GetContent(request);
                if (clip == null)
                {
                    onError.Invoke("Voice audio could not be decoded.");
                    yield break;
                }
                voiceSource.Stop();
                voiceSource.clip = clip;
                voiceSource.volume = volume;
                voiceSource.Play();
            }
        }

        private IEnumerator motorLoop()
        {
            var interval = new WaitForSecondsRealtime(0.25f);
            while (true)
            {
                if (!motorSending && !string.IsNullOrWhiteSpace(motorRelayUrl)) StartCoroutine(sendMotor(motor));
                yield return interval;
            }
        }

        private IEnumerator sendMotor(MotorCue cue)
        {
            motorSending = true;
            using (var request = new UnityWebRequest(motorRelayUrl, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(JsonUtility.ToJson(cue)));
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.timeout = 2;
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success) onError.Invoke("Motor relay unavailable.");
            }
            motorSending = false;
        }
    }
}
