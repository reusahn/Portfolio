#pragma once
#include "Animation/AnimInstance.h"
#include "AnimRuntimeBridgeInstance.generated.h"

UENUM(BlueprintType)
enum class EReviewLocomotion : uint8 { Idle, Walk, Run, Air };

// Parent C++ AnimInstance for ABP_ReviewCharacter. Blueprint is responsible for
// Blend Space sampling, state machine transitions, slots, layered blending & IK.
UCLASS(Blueprintable, BlueprintType)
class ANIMBRIDGE_API UAnimRuntimeBridgeInstance : public UAnimInstance {
    GENERATED_BODY()
public:
    virtual void NativeInitializeAnimation() override;
    virtual void NativeUpdateAnimation(float DeltaSeconds) override;

    UPROPERTY(BlueprintReadOnly, Category="Review|Locomotion") float GroundSpeed = 0.0f;
    UPROPERTY(BlueprintReadOnly, Category="Review|Locomotion") float SpeedNormalized = 0.0f;
    UPROPERTY(BlueprintReadOnly, Category="Review|Locomotion") bool bIsFalling = false;
    UPROPERTY(BlueprintReadOnly, Category="Review|Locomotion") bool bHasAcceleration = false;
    UPROPERTY(BlueprintReadOnly, Category="Review|Locomotion") EReviewLocomotion Locomotion = EReviewLocomotion::Idle;

    UFUNCTION(BlueprintCallable, Category="Review|Animation") bool TryPlayGesture(UAnimMontage* GestureMontage, float PlayRate = 1.0f);
};