using UnrealBuildTool;
using System.Collections.Generic;
public class AnimBridgeEditorTarget : TargetRules {
  public AnimBridgeEditorTarget(TargetInfo Target) : base(Target) {
    Type = TargetType.Editor;
    DefaultBuildSettings = BuildSettingsVersion.V5;
    ExtraModuleNames.Add("AnimBridge");
  }
}