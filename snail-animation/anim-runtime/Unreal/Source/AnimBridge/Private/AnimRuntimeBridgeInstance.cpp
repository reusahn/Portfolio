#include "AnimRuntimeBridgeInstance.h"
#include "Animation/AnimMontage.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "AnimRuntimeCore.h"

namespace {
EReviewLocomotion Convert(AnimRuntime::State S) {
    switch (S) {
      case AnimRuntime::State::Walk: return EReviewLocomotion::Walk;
      case AnimRuntime::State::Run: return EReviewLocomotion::Run;
      case AnimRuntime::State::Air: return EReviewLocomotion::Air;
      default: return EReviewLocomotion::Idle;
    }
}
AnimRuntime::State ToCore(EReviewLocomotion S) {
    switch (S) {
      case EReviewLocomotion::Walk: return AnimRuntime::State::Walk;
      case EReviewLocomotion::Run: return AnimRuntime::State::Run;
      case EReviewLocomotion::Air: return AnimRuntime::State::Air;
      default: return AnimRuntime::State::Idle;
    }
}
}
void UAnimRuntimeBridgeInstance::NativeInitializeAnimation() {
    Super::NativeInitializeAnimation();
    Locomotion = EReviewLocomotion::Idle;
}
void UAnimRuntimeBridgeInstance::NativeUpdateAnimation(float DeltaSeconds) {
    Super::NativeUpdateAnimation(DeltaSeconds);
    const APawn* Owner = TryGetPawnOwner();
    const ACharacter* Character = Cast<ACharacter>(Owner);
    const UCharacterMovementComponent* Move = Character ? Character->GetCharacterMovement() : nullptr;
    if (!Character || !Move) {
        GroundSpeed = 0.0f; SpeedNormalized = 0.0f;
        bIsFalling = false; bHasAcceleration = false;
        Locomotion = EReviewLocomotion::Idle;
        return;
    }
    const FVector Velocity = Character->GetVelocity();
    GroundSpeed = FVector(Velocity.X, Velocity.Y, 0.0f).Size();
    bIsFalling = Move->IsFalling();
    bHasAcceleration = Move->GetCurrentAcceleration().SizeSquared2D() > KINDA_SMALL_NUMBER;
    const AnimRuntime::Config Config{};
    SpeedNormalized = AnimRuntime::NormalizedSpeed(GroundSpeed, Config);
    Locomotion = Convert(AnimRuntime::Step(ToCore(Locomotion), GroundSpeed, bIsFalling, Config));
}
bool UAnimRuntimeBridgeInstance::TryPlayGesture(UAnimMontage* GestureMontage, float PlayRate) {
    return GestureMontage && PlayRate > 0.0f && !Montage_IsPlaying(GestureMontage)
        && Montage_Play(GestureMontage, PlayRate) > 0.0f;
}