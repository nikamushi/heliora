import 'package:flutter/material.dart';
import '../../../../theme/tokens.dart';

/// Progress step bar matching Figma node 70:395 (Mobile/StepBar).
class StepBar extends StatelessWidget {
  const StepBar({
    super.key,
    required this.currentStep,
    this.totalSteps = 3,
  }) : assert(currentStep >= 1 && currentStep <= totalSteps);

  final int currentStep;
  final int totalSteps;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(totalSteps, (index) {
        final stepIndex = index + 1;
        final isCompletedOrCurrent = stepIndex <= currentStep;

        return Expanded(
          child: Container(
            height: 4.0,
            margin: EdgeInsets.only(
              right: index < totalSteps - 1 ? 8.0 : 0.0,
            ),
            decoration: BoxDecoration(
              color: isCompletedOrCurrent
                  ? HelioraTokens.primary
                  : const Color(0xFFDEE5E1),
              borderRadius: BorderRadius.circular(6.0),
            ),
          ),
        );
      }),
    );
  }
}
