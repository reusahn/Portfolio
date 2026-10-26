using UnityEngine;

namespace Jonghoon.ResearchSamples
{
    // Independent illustration of a documented principle. No client production source.
    [RequireComponent(typeof(MeshRenderer))]
    public sealed class ShaderFlowController : MonoBehaviour
    {
        [SerializeField] Vector2 flow = new Vector2(0.35f, 0.1f);
        [SerializeField, Range(0, 0.4f)] float amplitude = 0.12f;
        [SerializeField, Range(0, 1)] float intensity = 0.7f;
        [SerializeField, Min(0.01f)] float frequency = 2.1f;
        static readonly int Phase = Shader.PropertyToID("_FlowPhase");
        static readonly int Amplitude = Shader.PropertyToID("_Amplitude");
        static readonly int Frequency = Shader.PropertyToID("_Frequency");
        MeshRenderer target;
        MaterialPropertyBlock block;
        Bounds originalBounds;
        Vector2 phase;

        void OnEnable()
        {
            target = GetComponent<MeshRenderer>();
            block = new MaterialPropertyBlock();
            originalBounds = target.localBounds;
            var expanded = originalBounds;
            // The maximum Inspector amplitude is 0.4 units in object space.
            expanded.Expand(0.8f);
            target.localBounds = expanded;
        }

        public void SetFlow(Vector2 direction)
        {
            if (!float.IsNaN(direction.x) && !float.IsNaN(direction.y) &&
                !float.IsInfinity(direction.x) && !float.IsInfinity(direction.y))
                flow = Vector2.ClampMagnitude(direction, 1);
        }
        public void SetIntensity(float value)
        {
            if (!float.IsNaN(value) && !float.IsInfinity(value)) intensity = Mathf.Clamp01(value);
        }

        void Update()
        {
            // Integrate the field phase. Changing direction does not teleport the object or reset time.
            phase += flow * Time.deltaTime;
            target.GetPropertyBlock(block);
            block.SetVector(Phase, new Vector4(phase.x, 0, phase.y, 0));
            block.SetFloat(Amplitude, amplitude * intensity);
            block.SetFloat(Frequency, frequency);
            target.SetPropertyBlock(block);
        }

        void OnDisable()
        {
            if (target == null || block == null) return;
            target.GetPropertyBlock(block);
            block.SetFloat(Amplitude, 0);
            target.SetPropertyBlock(block);
            target.localBounds = originalBounds;
        }
    }
}
