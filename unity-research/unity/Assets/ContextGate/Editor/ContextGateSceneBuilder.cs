using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Jonghoon.ContextGate.Editor
{
    public static class ContextGateSceneBuilder
    {
        [MenuItem("Tools/Jonghoon Research/Create Context Gate Demo")]
        public static void Create()
        {
            if (!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) return;
            const string directory = "Assets/ContextGate/Generated";
            Directory.CreateDirectory(directory);
            var settings = AssetDatabase.LoadAssetAtPath<ExperimentSettings>(directory + "/Settings.asset");
            if (settings == null)
            {
                settings = ScriptableObject.CreateInstance<ExperimentSettings>();
                AssetDatabase.CreateAsset(settings, directory + "/Settings.asset");
            }
            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var root = new GameObject("Context Gate");
            root.AddComponent<ExperimentRunner>().settings = settings;
            root.AddComponent<ContextGateDemo>();
            EditorSceneManager.SaveScene(scene, directory + "/ContextGate.unity");
            AssetDatabase.SaveAssets();
            Selection.activeGameObject = root;
            Debug.Log("Scene generated. Open Settings.asset, then press Play and Start a new session. Add this scene to Build Settings for a desktop build.");
        }
    }
}
