// RELAY / 02 — experimental Unity LAN multiplayer implementation.
// Unity 6 + Netcode for GameObjects 2.7.0.
// Code written for this portfolio. Unity compilation and two-client tests pending.
using System;
using Unity.Netcode;
using UnityEngine;

namespace Relay02
{
    [RequireComponent(typeof(NetworkObject))]
    public sealed class RelayMatch : NetworkBehaviour
    {
        public const int TickRate = 20;
        public const float RoundSeconds = 60f;

        public readonly NetworkVariable<float> PilotX = new(0.5f);
        public readonly NetworkVariable<float> PilotY = new(0.5f);
        public readonly NetworkVariable<float> TargetX = new(0.72f);
        public readonly NetworkVariable<float> TargetY = new(0.44f);
        public readonly NetworkVariable<float> DecoyX = new(0.2f);
        public readonly NetworkVariable<float> DecoyY = new(0.82f);
        public readonly NetworkVariable<float> Seconds = new(RoundSeconds);
        public readonly NetworkVariable<int> Score = new(0);
        public readonly NetworkVariable<int> Combo = new(1);
        public readonly NetworkVariable<int> Phase = new(0); // 0 waiting, 1 playing, 2 paused, 3 over

        private float _remoteVertical;
        private float _hold;
        private float _cooldown;
        private float _tickAccumulator;
        private float _inputAccumulator;
        private int _seed = 97;
        private ulong _guestId = ulong.MaxValue;

        private static float ClampAxis(float input) => (!float.IsNaN(input) && !float.IsInfinity(input)) ? Mathf.Clamp(input, -1f, 1f) : 0f;

        public override void OnNetworkSpawn()
        {
            if (!IsServer) return;
            NetworkManager.OnClientConnectedCallback += ClientJoined;
            NetworkManager.OnClientDisconnectCallback += ClientLeft;
            RefreshPair();
        }

        public override void OnNetworkDespawn()
        {
            if (!IsServer || NetworkManager == null) return;
            NetworkManager.OnClientConnectedCallback -= ClientJoined;
            NetworkManager.OnClientDisconnectCallback -= ClientLeft;
        }

        private void ClientJoined(ulong _) => RefreshPair();
        private void ClientLeft(ulong _)
        {
            _remoteVertical = 0f;
            RefreshPair();
        }

        private void RefreshPair()
        {
            if (!IsServer) return;
            _guestId = ulong.MaxValue;
            foreach (var clientId in NetworkManager.ConnectedClientsIds)
            {
                if (clientId == NetworkManager.ServerClientId) continue;
                _guestId = clientId;
                break;
            }

            if (_guestId == ulong.MaxValue)
            {
                // A guest may rejoin. Scores persist, but no gameplay advances alone.
                if (Phase.Value == 1) Phase.Value = 2;
                return;
            }

            if (Phase.Value == 0 || Phase.Value == 2) ResetRound();
        }

        public void ResetRound()
        {
            if (!IsServer) return;
            _seed = 97;
            _hold = 0f;
            _cooldown = 0f;
            _remoteVertical = 0f;
            PilotX.Value = PilotY.Value = 0.5f;
            Score.Value = 0;
            Combo.Value = 1;
            Seconds.Value = RoundSeconds;
            SpawnSignal();
            Phase.Value = _guestId != ulong.MaxValue ? 1 : 0;
        }

        private float NextRandom()
        {
            unchecked { _seed = _seed * 1664525 + 1013904223; }
            // Deterministic unsigned RNG, not a security primitive.
            return (uint)_seed / (float)uint.MaxValue;
        }

        private void SpawnSignal()
        {
            TargetX.Value = .16f + NextRandom() * .68f;
            TargetY.Value = .15f + NextRandom() * .68f;
            DecoyX.Value = .16f + NextRandom() * .68f;
            DecoyY.Value = .15f + NextRandom() * .68f;
        }

        private void Update()
        {
            if (!IsSpawned || NetworkManager == null) return;

            // Guest sends input at 20 Hz; server validates sender + clamps range.
            if (IsClient && !IsServer)
            {
                _inputAccumulator += Time.unscaledDeltaTime;
                if (_inputAccumulator >= 1f / TickRate)
                {
                    _inputAccumulator = 0f;
                    float direction = (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow) ? 1f : 0f)
                                    - (Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow) ? 1f : 0f);
                    SubmitVerticalRpc(direction);
                }
            }

            if (!IsServer || Phase.Value != 1) return;
            _tickAccumulator += Mathf.Min(Time.unscaledDeltaTime, .1f);
            int safety = 0;
            while (_tickAccumulator >= 1f / TickRate && safety++ < 4)
            {
                _tickAccumulator -= 1f / TickRate;
                ServerTick(1f / TickRate);
            }
        }

        [Rpc(SendTo.Server, RequireOwnership = false)]
        private void SubmitVerticalRpc(float axis, RpcParams rpcParams = default)
        {
            if (!IsServer) return;
            if (rpcParams.Receive.SenderClientId != _guestId) return;
            _remoteVertical = ClampAxis(axis);
        }

        private void ServerTick(float dt)
        {
            if (_guestId == ulong.MaxValue) { Phase.Value = 2; return; }
            float horizontal = (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow) ? 1f : 0f)
                               - (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow) ? 1f : 0f);
            PilotX.Value = Mathf.Clamp(PilotX.Value + horizontal * dt * .58f, .06f, .94f);
            PilotY.Value = Mathf.Clamp(PilotY.Value + _remoteVertical * dt * .58f, .07f, .93f);
            Seconds.Value = Mathf.Max(0f, Seconds.Value - dt);
            _cooldown = Mathf.Max(0f, _cooldown - dt);

            Vector2 reticle = new(PilotX.Value, PilotY.Value);
            Vector2 target = new(TargetX.Value, TargetY.Value);
            Vector2 decoy = new(DecoyX.Value, DecoyY.Value);
            if (Vector2.Distance(reticle, decoy) <= .09f && _cooldown <= 0f)
            {
                Combo.Value = 1;
                _hold = 0f;
                _cooldown = 1f;
            }
            else if (_cooldown <= 0f && Vector2.Distance(reticle, target) <= .075f)
            {
                _hold += dt;
                if (_hold >= .25f)
                {
                    Score.Value += 100 * Combo.Value;
                    Combo.Value = Mathf.Min(9, Combo.Value + 1);
                    _hold = 0f;
                    SpawnSignal();
                }
            }
            else _hold = 0f;
            if (Seconds.Value <= 0f) Phase.Value = 3;
        }
    }
}
