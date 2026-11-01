// Editor utility. Creates the complete minimalist gameplay scene without manual prefabs.
using System.IO;
using Relay02;
using Unity.Netcode;
using Unity.Netcode.Transports.UTP;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Relay02.Editor
{
    public static class RelaySceneBuilder
    {
        [MenuItem("RELAY 02 / Build Demo Scene")]
        public static void Build()
        {
            if (!EditorUtility.DisplayDialog("RELAY 02", "Create a fresh RELAY 02 demo scene? Save any unsaved changes first.", "Create", "Cancel")) return;
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            var network = new GameObject("NetworkManager");
            UnityTransport transport = network.AddComponent<UnityTransport>();
            NetworkManager manager = network.AddComponent<NetworkManager>();
            manager.NetworkConfig.NetworkTransport = transport;
            manager.NetworkConfig.EnableSceneManagement = true;
            manager.NetworkConfig.TickRate = (uint)RelayMatch.TickRate;
            manager.NetworkConfig.PlayerPrefab = null;
            var arena = new GameObject("RELAY_02_SceneNetworkObject");
            arena.AddComponent<NetworkObject>();
            arena.AddComponent<RelayMatch>();
            arena.AddComponent<RelayUI>();
            Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, "Assets/Scenes/RelayArena.unity");
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene("Assets/Scenes/RelayArena.unity",true) };
            Debug.Log("RELAY 02 scene generated. Press Play and HOST. Build standalone client to JOIN 127.0.0.1.");
        }
    }
}
