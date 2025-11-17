import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class GradientBackground extends StatelessWidget {
  final Widget child;
  final List<Color>? colors;
  final AlignmentGeometry begin;
  final AlignmentGeometry end;

  const GradientBackground({
    super.key,
    required this.child,
    this.colors,
    this.begin = Alignment.topLeft,
    this.end = Alignment.bottomRight,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: begin,
          end: end,
          colors: colors ??
              [
                AppTheme.primaryColor.withOpacity(0.1),
                AppTheme.secondaryColor.withOpacity(0.05),
                AppTheme.accentColor.withOpacity(0.1),
              ],
        ),
      ),
      child: child,
    );
  }
}
