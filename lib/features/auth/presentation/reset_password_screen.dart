import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_dimensions.dart';
import '../../../core/routes/app_routes.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';
import '../../../widgets/custom_card.dart';
import 'dart:ui';

class ResetPasswordScreen extends StatefulWidget {
  final String email;
  
  const ResetPasswordScreen({
    super.key,
    required this.email,
  });

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;
  bool _resetSuccess = false;
  late AnimationController _backgroundController;
  late AnimationController _successController;

  @override
  void initState() {
    super.initState();
    _backgroundController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
    
    _successController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
  }

  @override
  void dispose() {
    _codeController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _backgroundController.dispose();
    _successController.dispose();
    super.dispose();
  }

  Future<void> _handleResetPassword() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));

      if (mounted) {
        setState(() {
          _isLoading = false;
          _resetSuccess = true;
        });
        _successController.forward();

        // Navigate to login after showing success
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) {
          Navigator.pushNamedAndRemoveUntil(
            context,
            AppRoutes.login,
            (route) => false,
          );
        }
      }
    }
  }

  String _getPasswordStrength(String password) {
    if (password.isEmpty) return '';
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Medium';
    if (password.contains(RegExp(r'[A-Z]')) && 
        password.contains(RegExp(r'[0-9]')) &&
        password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) {
      return 'Strong';
    }
    return 'Medium';
  }

  Color _getPasswordStrengthColor(String strength) {
    switch (strength) {
      case 'Weak':
        return AppTheme.errorColor;
      case 'Medium':
        return Colors.orange;
      case 'Strong':
        return AppTheme.successColor;
      default:
        return Colors.transparent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final passwordStrength = _getPasswordStrength(_passwordController.text);
    
    return Scaffold(
      body: Stack(
        children: [
          // Animated gradient background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF667EEA).withOpacity(0.1),
                  Color(0xFF764BA2).withOpacity(0.05),
                  Colors.white,
                ],
              ),
            ),
          ),

          // Floating circles animation
          ...List.generate(3, (index) {
            return Positioned(
              top: -50 + (index * 200),
              left: -100 + (index * 70),
              child: AnimatedBuilder(
                animation: _backgroundController,
                builder: (context, child) {
                  return Transform.rotate(
                    angle: _backgroundController.value * 2 * 3.14159,
                    child: Container(
                      width: 220 - (index * 30),
                      height: 220 - (index * 30),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            AppTheme.primaryColor.withOpacity(0.08),
                            AppTheme.accentColor.withOpacity(0.02),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          }),

          // Main content
          SafeArea(
            child: Column(
              children: [
                // Custom App Bar
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: Offset(0, 4),
                            ),
                          ],
                        ),
                        child: IconButton(
                          icon: Icon(Icons.arrow_back_rounded, color: AppTheme.primaryColor),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 100.ms, duration: 400.ms),

                // Scrollable content
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Icon with animation
                          Center(
                            child: Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                gradient: _resetSuccess
                                    ? LinearGradient(
                                        colors: [
                                          AppTheme.successColor,
                                          AppTheme.successColor.withOpacity(0.7),
                                        ],
                                      )
                                    : AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(25),
                                boxShadow: [
                                  BoxShadow(
                                    color: (_resetSuccess ? AppTheme.successColor : AppTheme.primaryColor)
                                        .withOpacity(0.3),
                                    blurRadius: 20,
                                    offset: Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Icon(
                                _resetSuccess 
                                    ? Icons.check_circle_rounded 
                                    : Icons.vpn_key_rounded,
                                size: 50,
                                color: Colors.white,
                              ),
                            ),
                          )
                              .animate(
                                target: _resetSuccess ? 1 : 0,
                                controller: _successController,
                              )
                              .scale(delay: 100.ms, duration: 600.ms, curve: Curves.elasticOut)
                              .fadeIn(duration: 600.ms),

                          const SizedBox(height: 32),

                          // Title with gradient
                          ShaderMask(
                            shaderCallback: (bounds) => (_resetSuccess
                                ? LinearGradient(
                                    colors: [AppTheme.successColor, AppTheme.successColor.withOpacity(0.7)]
                                  )
                                : AppTheme.primaryGradient
                            ).createShader(bounds),
                            child: Text(
                              _resetSuccess ? 'Password Reset!' : 'Reset Password',
                              style: TextStyle(
                                fontSize: 36,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                letterSpacing: -0.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          )
                              .animate()
                              .fadeIn(delay: 200.ms, duration: 600.ms)
                              .slideY(begin: -0.3, end: 0, duration: 600.ms),

                          const SizedBox(height: 12),

                          Text(
                            _resetSuccess
                                ? 'Your password has been successfully reset!'
                                : 'Enter the verification code and your new password',
                            style: TextStyle(
                              fontSize: 15,
                              color: AppTheme.textSecondary,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          )
                              .animate()
                              .fadeIn(delay: 300.ms, duration: 600.ms),

                          const SizedBox(height: 32),

                          if (!_resetSuccess) ...[
                            // Email info card
                            CustomCard(
                              useGlassmorphism: true,
                              padding: EdgeInsets.all(16),
                              margin: EdgeInsets.only(bottom: 24),
                              child: Row(
                                children: [
                                  Container(
                                    padding: EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryColor.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Icon(
                                      Icons.email_rounded,
                                      color: AppTheme.primaryColor,
                                      size: 20,
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Code sent to:',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: AppTheme.textSecondary,
                                          ),
                                        ),
                                        SizedBox(height: 2),
                                        Text(
                                          widget.email,
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: AppTheme.textPrimary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            )
                                .animate()
                                .fadeIn(delay: 400.ms, duration: 600.ms)
                                .slideY(begin: 0.2, end: 0, duration: 600.ms),

                            // Glass card container for form
                            CustomCard(
                              useGlassmorphism: true,
                              padding: EdgeInsets.all(28),
                              child: Column(
                                children: [
                                  // Verification code field
                                  CustomTextField(
                                    controller: _codeController,
                                    label: 'Verification Code',
                                    hint: 'Enter 6-digit code',
                                    keyboardType: TextInputType.number,
                                    prefixIcon: Icons.pin_rounded,
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Please enter the verification code';
                                      }
                                      if (value.length != 6) {
                                        return 'Code must be 6 digits';
                                      }
                                      return null;
                                    },
                                    onChanged: (value) => setState(() {}),
                                  )
                                      .animate()
                                      .fadeIn(delay: 500.ms, duration: 600.ms)
                                      .slideX(begin: -0.2, end: 0, duration: 600.ms),

                                  const SizedBox(height: 20),

                                  // New password field with strength indicator
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      CustomTextField(
                                        controller: _passwordController,
                                        label: 'New Password',
                                        hint: 'Enter new password',
                                        obscureText: _obscurePassword,
                                        prefixIcon: Icons.lock_rounded,
                                        suffixIcon: IconButton(
                                          icon: Icon(
                                            _obscurePassword
                                                ? Icons.visibility_rounded
                                                : Icons.visibility_off_rounded,
                                            color: AppTheme.primaryColor,
                                          ),
                                          onPressed: () {
                                            setState(() {
                                              _obscurePassword = !_obscurePassword;
                                            });
                                          },
                                        ),
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return 'Please enter your password';
                                          }
                                          if (value.length < 6) {
                                            return 'Password must be at least 6 characters';
                                          }
                                          return null;
                                        },
                                        onChanged: (value) => setState(() {}),
                                      ),
                                      
                                      // Password strength indicator
                                      if (_passwordController.text.isNotEmpty) ...[
                                        SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Container(
                                                height: 4,
                                                decoration: BoxDecoration(
                                                  color: passwordStrength == 'Weak' || passwordStrength == 'Medium' || passwordStrength == 'Strong'
                                                      ? _getPasswordStrengthColor(passwordStrength)
                                                      : Colors.grey.shade200,
                                                  borderRadius: BorderRadius.circular(2),
                                                ),
                                              ),
                                            ),
                                            SizedBox(width: 4),
                                            Expanded(
                                              child: Container(
                                                height: 4,
                                                decoration: BoxDecoration(
                                                  color: passwordStrength == 'Medium' || passwordStrength == 'Strong'
                                                      ? _getPasswordStrengthColor(passwordStrength)
                                                      : Colors.grey.shade200,
                                                  borderRadius: BorderRadius.circular(2),
                                                ),
                                              ),
                                            ),
                                            SizedBox(width: 4),
                                            Expanded(
                                              child: Container(
                                                height: 4,
                                                decoration: BoxDecoration(
                                                  color: passwordStrength == 'Strong'
                                                      ? _getPasswordStrengthColor(passwordStrength)
                                                      : Colors.grey.shade200,
                                                  borderRadius: BorderRadius.circular(2),
                                                ),
                                              ),
                                            ),
                                            SizedBox(width: 8),
                                            Text(
                                              passwordStrength,
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                                color: _getPasswordStrengthColor(passwordStrength),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ],
                                  )
                                      .animate()
                                      .fadeIn(delay: 600.ms, duration: 600.ms)
                                      .slideX(begin: -0.2, end: 0, duration: 600.ms),

                                  const SizedBox(height: 20),

                                  // Confirm password field
                                  CustomTextField(
                                    controller: _confirmPasswordController,
                                    label: 'Confirm Password',
                                    hint: 'Re-enter new password',
                                    obscureText: _obscureConfirmPassword,
                                    prefixIcon: Icons.lock_rounded,
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscureConfirmPassword
                                            ? Icons.visibility_rounded
                                            : Icons.visibility_off_rounded,
                                        color: AppTheme.primaryColor,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _obscureConfirmPassword = !_obscureConfirmPassword;
                                        });
                                      },
                                    ),
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Please confirm your password';
                                      }
                                      if (value != _passwordController.text) {
                                        return 'Passwords do not match';
                                      }
                                      return null;
                                    },
                                  )
                                      .animate()
                                      .fadeIn(delay: 700.ms, duration: 600.ms)
                                      .slideX(begin: -0.2, end: 0, duration: 600.ms),

                                  const SizedBox(height: 28),

                                  // Reset button
                                  CustomButton(
                                    text: 'Reset Password',
                                    onPressed: _handleResetPassword,
                                    isLoading: _isLoading,
                                    useGradient: true,
                                    icon: Icons.check_circle_rounded,
                                    width: double.infinity,
                                  )
                                      .animate()
                                      .fadeIn(delay: 800.ms, duration: 600.ms)
                                      .slideY(begin: 0.2, end: 0, duration: 600.ms),
                                ],
                              ),
                            ),
                          ] else ...[
                            // Success state
                            CustomCard(
                              useGlassmorphism: true,
                              padding: EdgeInsets.all(28),
                              child: Column(
                                children: [
                                  Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                      color: AppTheme.successColor.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.check_rounded,
                                      size: 40,
                                      color: AppTheme.successColor,
                                    ),
                                  ),
                                  SizedBox(height: 20),
                                  Text(
                                    'All Set!',
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ),
                                  SizedBox(height: 8),
                                  Text(
                                    'You can now sign in with your new password',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: AppTheme.textSecondary,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  SizedBox(height: 20),
                                  SizedBox(
                                    width: 30,
                                    height: 30,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 3,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        AppTheme.successColor,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            )
                                .animate()
                                .fadeIn(duration: 400.ms)
                                .scale(begin: Offset(0.8, 0.8), duration: 400.ms),
                          ],

                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
