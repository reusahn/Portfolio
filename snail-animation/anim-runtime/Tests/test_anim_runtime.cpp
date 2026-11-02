#include "../Core/AnimRuntimeCore.h"
#include <cassert>
#include <cmath>
#include <iostream>
#include <limits>
using namespace AnimRuntime;
int main() {
  const Config c{};
  assert(ValidConfig(c));
  assert(!ValidConfig(Config{15, 20, 330, 285}));
  State s = Step(State::Idle, 0, false, c);
  assert(s == State::Idle);
  s = Step(s, 100, false, c); assert(s == State::Walk);
  s = Step(s, 350, false, c); assert(s == State::Run);
  s = Step(s, 310, false, c); assert(s == State::Run);
  s = Step(s, 270, false, c); assert(s == State::Walk);
  s = Step(s, 10, false, c); assert(s == State::Walk);
  s = Step(s, 8, false, c); assert(s == State::Idle);
  s = Step(s, 100, true, c); assert(s == State::Air);
  s = Step(s, 100, false, c); assert(s == State::Walk);
  s = Step(s, 0, false, c); assert(s == State::Idle);
  assert(Step(State::Idle, -100, false, c) == State::Idle);
  assert(Step(State::Idle, std::numeric_limits<float>::quiet_NaN(), false, c) == State::Idle);
  assert(NormalizedSpeed(10000, c) == 1.0f);
  assert(NormalizedSpeed(-5, c) == 0.0f);
  std::cout << "14 checks passed: transitions, hysteresis, air recovery, invalid input, blend normalization.\n";
}