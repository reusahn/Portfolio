using UnrealBuildTool;
using System.Collections.Generic;
public class AnimBridgeTarget : TargetRules {
  public AnimBridgeTarget(TargetInfo Target) : base(Target) {
    Type = TargetType.Game;
    DefaultBuildSettings = BuildSettingsVersion.V5;
    ExtraModuleNames.Add("AnimBridge");
  }
}