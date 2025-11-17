import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import 'package:flutter_animate/flutter_animate.dart';

class CustomButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final bool useGradient;
  final IconData? icon;
  final Color? backgroundColor;
  final double? width;

  const CustomButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.useGradient = false,
    this.icon,
    this.backgroundColor,
    this.width,
  });

  @override
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final buttonContent = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.isLoading)
          SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(
                widget.isOutlined ? AppTheme.primaryColor : Colors.white,
              ),
            ),
          )
        else ...[
          if (widget.icon != null) ...[
            Icon(
              widget.icon,
              size: 20,
              color: widget.isOutlined
                  ? (widget.backgroundColor ?? AppTheme.primaryColor)
                  : Colors.white,
            ),
            const SizedBox(width: 10),
          ],
          Text(
            widget.text,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 15,
              letterSpacing: 0.3,
              color: widget.isOutlined
                  ? (widget.backgroundColor ?? AppTheme.primaryColor)
                  : Colors.white,
            ),
          ),
        ],
      ],
    );

    if (widget.isOutlined) {
      return MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: widget.width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: widget.backgroundColor ?? AppTheme.primaryColor,
              width: 2,
            ),
            color: _isHovered
                ? (widget.backgroundColor ?? AppTheme.primaryColor)
                    .withOpacity(0.1)
                : Colors.transparent,
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: widget.isLoading ? null : widget.onPressed,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: buttonContent,
              ),
            ),
          ),
        ),
      )
          .animate()
          .fadeIn(duration: 300.ms)
          .slideY(begin: 0.2, end: 0, duration: 300.ms);
    }

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: widget.width,
        transform: Matrix4.identity()
          ..scale(_isHovered ? 1.02 : 1.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: widget.useGradient ? AppTheme.primaryGradient : null,
          color: widget.useGradient
              ? null
              : (widget.backgroundColor ?? AppTheme.primaryColor),
          boxShadow: [
            BoxShadow(
              color: (widget.backgroundColor ?? AppTheme.primaryColor)
                  .withOpacity(_isHovered ? 0.4 : 0.2),
              blurRadius: _isHovered ? 20 : 12,
              offset: Offset(0, _isHovered ? 8 : 4),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: widget.isLoading ? null : widget.onPressed,
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: buttonContent,
            ),
          ),
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 300.ms)
        .slideY(begin: 0.2, end: 0, duration: 300.ms);
  }
}

