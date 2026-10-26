using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Jonghoon.ContextGate
{
    [RequireComponent(typeof(ExperimentRunner))]
    public sealed class ContextGateDemo : MonoBehaviour
    {
        ExperimentRunner runner;
        readonly List<GameObject> owned = new List<GameObject>();
        readonly List<Material> materials = new List<Material>();
        readonly Transform[] tokens = new Transform[3];
        int selected;
        bool built;

        Vector3 Slot(int i) => new Vector3(1.2f + (i % 3 - 1) * 1.25f, 0, (0.5f - i / 3) * 1.6f);

        void Start()
        {
            runner = GetComponent<ExperimentRunner>();
            BuildWorld();
        }

        Material MakeMaterial(Color color)
        {
            string name = GraphicsSettings.currentRenderPipeline == null ? "Unlit/Color" : "Universal Render Pipeline/Unlit";
            var shader = Shader.Find(name);
            if (shader == null) { Debug.LogError("Demo supports Built-in or URP. Missing shader: " + name); return null; }
            var m = new Material(shader);
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", color);
            if (m.HasProperty("_Color")) m.SetColor("_Color", color);
            materials.Add(m);
            return m;
        }

        GameObject Primitive(string name, PrimitiveType type, Vector3 position, Vector3 scale, Material material)
        {
            var go = GameObject.CreatePrimitive(type);
            go.name = name; go.transform.SetParent(transform);
            go.transform.position = position; go.transform.localScale = scale;
            if (material != null) go.GetComponent<Renderer>().sharedMaterial = material;
            owned.Add(go); return go;
        }

        void BuildWorld()
        {
            if (built) return;
            built = true;
            var cameraObject = new GameObject("ContextGate Camera");
            owned.Add(cameraObject);
            var camera = cameraObject.AddComponent<Camera>();
            cameraObject.tag = "MainCamera";
            camera.transform.position = new Vector3(0, 5, -7);
            camera.transform.LookAt(new Vector3(0, 0, 0));
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.91f, 0.92f, 0.89f);
            camera.fieldOfView = 46;
            var slab = MakeMaterial(new Color(0.72f, 0.77f, 0.73f));
            for (int i = 0; i < 6; i++)
                Primitive("Slot " + (i + 1), PrimitiveType.Cube, Slot(i) - Vector3.up * 0.2f,
                    new Vector3(1.1f, 0.12f, 1.15f), slab);
            Color[] colors = { new Color(0.75f, 0.25f, 0.12f), new Color(0.12f, 0.37f, 0.45f), new Color(0.64f, 0.49f, 0.10f) };
            for (int i = 0; i < 3; i++)
                tokens[i] = Primitive(((char)('A' + i)).ToString(), PrimitiveType.Cube, Slot(i + 3) + Vector3.up * 0.2f,
                    Vector3.one * 0.55f, MakeMaterial(colors[i])).transform;
        }

        void Update()
        {
            if (runner == null) return;
            var positions = runner.Positions;
            if (positions == null) return;
            for (int i = 0; i < tokens.Length; i++)
                if (tokens[i] != null) tokens[i].position = Slot(positions[i]) + Vector3.up * 0.2f;
        }

        void OnGUI()
        {
            if (runner == null) return;
            GUI.skin.label.wordWrap = true;
            GUILayout.BeginArea(new Rect(16, 16, Mathf.Min(390, Screen.width - 32), Screen.height - 32), GUI.skin.box);
            GUILayout.Label("CONTEXT GATE / Unity source prototype");
            GUILayout.Label("Place A in slot 1, B in slot 2, C in slot 3. Top row: slots 1–3. Bottom row: slots 4–6.");
            GUILayout.Label("Colors: A red, B blue, C ochre. Scripted guidance. No model API or XR input is connected.");
            GUILayout.Space(8);
            GUILayout.Label("State: " + runner.State + "   revision: " + runner.Revision);
            if (runner.State == RunState.Ready || runner.State == RunState.Complete || runner.State == RunState.Faulted)
                if (GUILayout.Button("Start a new session")) runner.BeginSession();
            if (runner.CurrentTrial != null)
                GUILayout.Label("Trial " + runner.TrialNumber + "/" + runner.TrialCount + "   " + runner.CurrentTrial.policy +
                    "   correct: " + runner.Score + "/3   remaining: " + runner.SecondsLeft.ToString("F1") + " s");
            bool active = runner.State == RunState.Running;
            GUI.enabled = active;
            GUILayout.Label("Select a token, then a destination:");
            GUILayout.BeginHorizontal();
            for (int i = 0; i < 3; i++)
                if (GUILayout.Toggle(selected == i, ((char)('A' + i)).ToString(), GUI.skin.button)) selected = i;
            GUILayout.EndHorizontal();
            for (int row = 0; row < 2; row++)
            {
                GUILayout.BeginHorizontal();
                for (int col = 0; col < 3; col++)
                { int slot = row * 3 + col; if (GUILayout.Button("Slot " + (slot + 1))) runner.Move(selected, slot); }
                GUILayout.EndHorizontal();
            }
            if (GUILayout.Button(runner.WaitingForHint ? "Guidance pending…" : "Request delayed guidance")) runner.RequestHint();
            if (GUILayout.Button("Inject a request timeout (QA)")) runner.RequestHint(ProviderFault.Timeout);
            if (GUILayout.Button("Inject a malformed response (QA)")) runner.RequestHint(ProviderFault.Malformed);
            GUI.enabled = true;
            if (runner.VisibleHint != null)
            {
                var h = runner.VisibleHint;
                GUILayout.Label("GUIDANCE: Move " + (char)('A' + h.token) + " from slot " + (h.from + 1) + " to slot " + (h.to + 1));
            }
            else GUILayout.Label("No guidance shown.");
            if (active && GUILayout.Button("Pause")) runner.Pause();
            if (runner.State == RunState.Paused && GUILayout.Button("Resume")) runner.Resume();
            if ((active || runner.State == RunState.Paused) && GUILayout.Button("Reset this trial (logged)")) runner.ResetTrial();
            if (runner.State == RunState.BetweenTrials && GUILayout.Button("Next trial / finish session")) runner.NextTrial();
            if ((active || runner.State == RunState.Paused || runner.State == RunState.BetweenTrials) && GUILayout.Button("Abort and export")) runner.Abort();
            GUILayout.Label("Last event: " + runner.LastEvent);
            if (runner.LastError.Length > 0) GUILayout.Label("ERROR: " + runner.LastError);
            if (runner.OutputPath.Length > 0) GUILayout.Label("Files: " + runner.OutputPath);
            GUILayout.EndArea();
        }

        void OnDestroy()
        {
            foreach (var go in owned) if (go != null) Destroy(go);
            foreach (var m in materials) if (m != null) Destroy(m);
        }
    }
}
