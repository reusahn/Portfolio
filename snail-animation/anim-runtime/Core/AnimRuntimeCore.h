#pragma once
// Engine-independent, deterministic locomotion decisions.
// Does not animate skeletal meshes: feeds an Unreal Animation Blueprint.
#include <algorithm>
#include <cmath>
#include <cstdint>
namespace AnimRuntime {
enum class State : std::uint8_t { Idle, Walk, Run, Air };
struct Config {
  float walkEnter = 15.0f;
  float walkExit = 9.0f;
  float runEnter = 330.0f;
  float runExit = 285.0f;
};
inline float SafeSpeed(float speed) {
  return std::isfinite(speed) && speed > 0.0f ? speed : 0.0f;
}
inline State Step(State previous, float groundSpeed, bool isFalling,
                  const Config& config = Config{}) {
  if (isFalling) return State::Air;
  const float s = SafeSpeed(groundSpeed);
  if (previous == State::Run && s >= config.runExit) return State::Run;
  if (s >= config.runEnter) return State::Run;
  if (previous == State::Walk && s > config.walkExit) return State::Walk;
  if (previous == State::Run && s > config.walkExit) return State::Walk;
  if (previous == State::Air && s > config.walkEnter) return State::Walk;
  if (s >= config.walkEnter) return State::Walk;
  return State::Idle;
}
inline float NormalizedSpeed(float groundSpeed, const Config& config = Config{}) {
  return std::clamp(SafeSpeed(groundSpeed) / config.runEnter, 0.0f, 1.0f);
}
inline bool ValidConfig(const Config& c) {
  return std::isfinite(c.walkExit) && std::isfinite(c.walkEnter) &&
         std::isfinite(c.runExit) && std::isfinite(c.runEnter) &&
         c.walkExit >= 0.0f && c.walkEnter > c.walkExit &&
         c.runExit > c.walkEnter && c.runEnter > c.runExit;
}
} // namespace AnimRuntime