Shader "Jonghoon/ResponsiveField"
{
    Properties
    {
        _BaseColor("Body", Color) = (0.20,0.29,0.31,1)
        _RimColor("Rim", Color) = (0.80,0.86,0.80,1)
        _RimPower("Rim power", Range(0.5,6)) = 2
        _Amplitude("Displacement", Range(0,0.4)) = 0.12
        _Frequency("Frequency", Float) = 2.1
        _FlowPhase("Integrated flow phase", Vector) = (0,0,0,0)
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" "Queue"="Geometry" "RenderPipeline"="UniversalPipeline" }
        Pass
        {
            Name "UnlitField"
            Tags { "LightMode"="SRPDefaultUnlit" }
            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #pragma multi_compile_instancing
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            CBUFFER_START(UnityPerMaterial)
                half4 _BaseColor, _RimColor;
                float4 _FlowPhase;
                float _Amplitude, _Frequency, _RimPower;
            CBUFFER_END

            float Hash(float3 p) { return frac(sin(dot(p,float3(127.1,311.7,74.7))) * 43758.5453); }
            float Noise(float3 p)
            {
                float3 i=floor(p), f=frac(p); f=f*f*(3-2*f);
                float a=lerp(Hash(i),Hash(i+float3(1,0,0)),f.x);
                float b=lerp(Hash(i+float3(0,1,0)),Hash(i+float3(1,1,0)),f.x);
                float c=lerp(Hash(i+float3(0,0,1)),Hash(i+float3(1,0,1)),f.x);
                float d=lerp(Hash(i+float3(0,1,1)),Hash(i+float3(1,1,1)),f.x);
                return lerp(lerp(a,b,f.y),lerp(c,d,f.y),f.z)*2-1;
            }
            struct Attributes
            {
                float4 positionOS:POSITION;
                float3 normalOS:NORMAL;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };
            struct Varyings
            {
                float4 positionCS:SV_POSITION;
                float3 positionWS:TEXCOORD0;
                half3 normalWS:TEXCOORD1;
                UNITY_VERTEX_OUTPUT_STEREO
            };
            Varyings Vert(Attributes input)
            {
                Varyings o;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o);
                float3 p=input.positionOS.xyz;
                p += input.normalOS * Noise(p*_Frequency + _FlowPhase.xyz) * _Amplitude;
                o.positionWS=TransformObjectToWorld(p);
                o.positionCS=TransformWorldToHClip(o.positionWS);
                o.normalWS=TransformObjectToWorldNormal(input.normalOS);
                return o;
            }
            half4 Frag(Varyings input):SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);
                half3 view=normalize(GetWorldSpaceViewDir(input.positionWS));
                half rim=pow(saturate(1-dot(normalize(input.normalWS),view)),_RimPower);
                return half4(lerp(_BaseColor.rgb,_RimColor.rgb,rim),1);
            }
            ENDHLSL
        }
    }
}
