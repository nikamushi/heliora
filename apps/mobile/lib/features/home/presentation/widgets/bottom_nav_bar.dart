import 'package:flutter/material.dart';

import '../../../../theme/components.dart';
import '../../../../theme/tokens.dart';

/// Bottom navigation bar matching Figma component Mobile/BottomNav (Node 70:175).
class HelioraBottomNav extends StatelessWidget {
  const HelioraBottomNav({
    super.key,
    this.currentIndex = 0,
    this.onTap,
  });

  /// The active tab index (0 = Beranda, 1 = Simulasi, 2 = Profil).
  final int currentIndex;

  /// Callback when a tab is tapped.
  final ValueChanged<int>? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: HelioraTokens.border, width: 1.0),
        ),
      ),
      child: Row(
        children: [
          _buildNavItem(
            index: 0,
            iconAsset: HelioraIcons.layoutDashboard,
            label: 'Beranda',
          ),
          _buildNavItem(
            index: 1,
            iconAsset: HelioraIcons.slidersHorizontal,
            label: 'Simulasi',
          ),
          _buildNavItem(
            index: 2,
            iconAsset: HelioraIcons.user,
            label: 'Profil',
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required String iconAsset,
    required String label,
  }) {
    final bool isActive = currentIndex == index;
    final Color color = isActive ? HelioraTokens.primary : HelioraTokens.secondaryForeground;

    return Expanded(
      child: InkWell(
        onTap: () => onTap?.call(index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
              decoration: BoxDecoration(
                color: isActive ? HelioraTokens.primary.withValues(alpha: 0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(16.0),
              ),
              child: HelioraIcon(
                iconAsset,
                size: 20,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
