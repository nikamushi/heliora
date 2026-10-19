import 'package:flutter/material.dart';

import '../../../../theme/tokens.dart';

/// Reusable confirmation dialog conforming strictly to Figma `Mobile/Dialog` (node 81:1363).
/// Features a 24px corner border radius, full-width vertical action stack,
/// and distinct semantic styling for destructive vs standard actions.
class HelioraConfirmationDialog extends StatelessWidget {
  const HelioraConfirmationDialog({
    super.key,
    required this.title,
    required this.content,
    this.confirmLabel,
    this.cancelLabel = 'Batal',
    this.isDestructive = false,
    this.isLoading = false,
    this.onConfirm,
    this.onCancel,
  });

  final String title;
  final String content;
  final String? confirmLabel;
  final String cancelLabel;
  final bool isDestructive;
  final bool isLoading;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(HelioraTokens.radius2xl),
        side: const BorderSide(color: HelioraTokens.border, width: 1.0),
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: HelioraTokens.foreground,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                content,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 14,
                  color: HelioraTokens.secondaryForeground,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),
              if (confirmLabel != null) ...[
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : onConfirm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDestructive
                          ? HelioraTokens.rose700
                          : HelioraTokens.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(HelioraTokens.radiusXl),
                      ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Text(
                            confirmLabel!,
                            style: const TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              SizedBox(
                height: 48,
                child: OutlinedButton(
                  onPressed: isLoading ? null : onCancel,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: HelioraTokens.foreground,
                    side: const BorderSide(
                        color: HelioraTokens.border, width: 1.0),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(HelioraTokens.radiusXl),
                    ),
                  ),
                  child: Text(
                    cancelLabel,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
