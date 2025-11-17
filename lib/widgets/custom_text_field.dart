import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme/app_theme.dart';

class CustomTextField extends StatefulWidget {
  final TextEditingController? controller;
  final String label;
  final String hint;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final Function(String)? onChanged;
  final int? maxLines;
  final bool enabled;
  final VoidCallback? onTap;

  const CustomTextField({
    super.key,
    this.controller,
    required this.label,
    required this.hint,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType,
    this.validator,
    this.onChanged,
    this.maxLines = 1,
    this.enabled = true,
    this.onTap,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  bool _isFocused = false;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedDefaultTextStyle(
          duration: const Duration(milliseconds: 200),
          style: Theme.of(context).textTheme.titleMedium!.copyWith(
                fontWeight: FontWeight.w600,
                color: _isFocused
                    ? AppTheme.primaryColor
                    : (isDark
                        ? AppTheme.darkTextPrimary
                        : AppTheme.textPrimary),
              ),
          child: Text(widget.label),
        ),
        const SizedBox(height: 10),
        Focus(
          onFocusChange: (hasFocus) {
            setState(() => _isFocused = hasFocus);
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              boxShadow: _isFocused
                  ? [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.2),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : [],
            ),
            child: TextFormField(
              controller: widget.controller,
              obscureText: widget.obscureText,
              keyboardType: widget.keyboardType,
              validator: widget.validator,
              onChanged: widget.onChanged,
              maxLines: widget.maxLines,
              enabled: widget.enabled,
              onTap: widget.onTap,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: widget.hint,
                hintStyle: TextStyle(
                  color: (isDark
                          ? AppTheme.darkTextSecondary
                          : AppTheme.textSecondary)
                      .withOpacity(0.6),
                ),
                prefixIcon: widget.prefixIcon != null
                    ? Icon(
                        widget.prefixIcon,
                        color: _isFocused
                            ? AppTheme.primaryColor
                            : AppTheme.textSecondary,
                        size: 22,
                      )
                    : null,
                suffixIcon: widget.suffixIcon,
                filled: true,
                fillColor: isDark
                    ? AppTheme.darkSurface
                    : AppTheme.surfaceColor,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 16,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark
                        ? AppTheme.darkSurfaceVariant
                        : AppTheme.borderColor,
                    width: 1.5,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark
                        ? AppTheme.darkSurfaceVariant.withOpacity(0.5)
                        : AppTheme.borderColor,
                    width: 1.5,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: AppTheme.primaryColor,
                    width: 2,
                  ),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: AppTheme.errorColor,
                    width: 1.5,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    )
        .animate()
        .fadeIn(duration: 300.ms)
        .slideX(begin: -0.1, end: 0, duration: 300.ms);
  }
}

