import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:ui';
import '../core/theme/app_theme.dart';

class CustomCard extends StatefulWidget {
  final Widget child;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final Color? backgroundColor;
  final VoidCallback? onTap;
  final bool useGlassmorphism;
  final bool showBorder;
  final LinearGradient? gradient;

  const CustomCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.backgroundColor,
    this.onTap,
    this.useGlassmorphism = false,
    this.showBorder = true,
    this.gradient,
  });

  @override
  State<CustomCard> createState() => _CustomCardState();
}

class _CustomCardState extends State<CustomCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (widget.useGlassmorphism) {
      return Container(
        margin: widget.margin,
        child: MouseRegion(
          onEnter: (_) => setState(() => _isHovered = true),
          onExit: (_) => setState(() => _isHovered = false),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            transform: Matrix4.identity()..scale(_isHovered ? 1.02 : 1.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withOpacity(0.2),
                        Colors.white.withOpacity(0.1),
                      ],
                    ),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.2),
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: widget.onTap,
                      borderRadius: BorderRadius.circular(20),
                      child: Padding(
                        padding: widget.padding ?? const EdgeInsets.all(20),
                        child: widget.child,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        )
            .animate()
            .fadeIn(duration: 400.ms)
            .slideY(begin: 0.1, end: 0, duration: 400.ms),
      );
    }

    return Container(
      margin: widget.margin,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          transform: Matrix4.identity()..scale(_isHovered ? 1.01 : 1.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: widget.gradient,
            color: widget.gradient == null
                ? (widget.backgroundColor ??
                    (isDark ? AppTheme.darkSurface : Colors.white))
                : null,
            border: widget.showBorder
                ? Border.all(
                    color: isDark
                        ? AppTheme.darkSurfaceVariant.withOpacity(0.5)
                        : AppTheme.borderColor.withOpacity(0.5),
                    width: 1,
                  )
                : null,
            boxShadow: [
              BoxShadow(
                color: (isDark ? Colors.black : AppTheme.primaryColor)
                    .withOpacity(_isHovered ? 0.15 : 0.08),
                blurRadius: _isHovered ? 20 : 12,
                offset: Offset(0, _isHovered ? 6 : 4),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.onTap,
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: widget.padding ?? const EdgeInsets.all(20),
                child: widget.child,
              ),
            ),
          ),
        ),
      )
          .animate()
          .fadeIn(duration: 400.ms)
          .slideY(begin: 0.1, end: 0, duration: 400.ms),
    );
  }
}
