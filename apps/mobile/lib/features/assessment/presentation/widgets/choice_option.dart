import 'package:flutter/material.dart';
import '../../../../theme/icons.dart';
import '../../../../theme/tokens.dart';

/// Single selectable choice option tile matching Figma node 70:308 (Mobile/ChoiceOption).
class ChoiceOption<T> extends StatelessWidget {
  const ChoiceOption({
    super.key,
    required this.value,
    required this.groupValue,
    required this.label,
    required this.onChanged,
    this.subtitle,
    this.width = double.infinity,
  });

  final T value;
  final T? groupValue;
  final String label;
  final ValueChanged<T> onChanged;
  final String? subtitle;
  final double? width;

  bool get isSelected => value == groupValue;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeInOut,
        width: width,
        constraints: const BoxConstraints(minHeight: 48.0),
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFDCFCE9) : Colors.white,
          border: Border.all(
            color: isSelected ? HelioraTokens.primary : const Color(0xFFDEE5E1),
            width: isSelected ? 2.0 : 1.0,
          ),
          borderRadius: BorderRadius.circular(HelioraTokens.radiusXl),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: [
            if (isSelected) ...[
              const HelioraIcon(
                HelioraIcons.check,
                size: 16,
                color: HelioraTokens.primary,
              ),
              const SizedBox(width: 8),
            ],
            Flexible(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: subtitle != null
                    ? CrossAxisAlignment.start
                    : CrossAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    label,
                    textAlign: subtitle != null ? TextAlign.left : TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 14.0,
                      fontWeight: FontWeight.w500,
                      color: isSelected
                          ? HelioraTokens.primary
                          : HelioraTokens.foreground,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      textAlign: TextAlign.left,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 12.0,
                        color: isSelected
                            ? HelioraTokens.primary.withValues(alpha: 0.8)
                            : HelioraTokens.mutedForeground,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
