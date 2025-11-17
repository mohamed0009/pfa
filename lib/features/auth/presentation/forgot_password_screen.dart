import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_dimensions.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';
import '../../../widgets/custom_card.dart';
import 'dart:ui';
import 'reset_password_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _emailSent = false;
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
    _emailController.dispose();
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
          _emailSent = true;
        });
        _successController.forward();

        // Navigate to reset password screen after showing success
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => ResetPasswordScreen(
                email: _emailController.text.trim(),
              ),
            ),
          );
        }
      }
    }
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.error_outline, color: Colors.white),
            SizedBox(width: 12),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppTheme.errorColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Animated gradient background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
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
              top: -100 + (index * 250),
              right: -80 + (index * 60),
              child: AnimatedBuilder(
                animation: _backgroundController,
                builder: (context, child) {
                  return Transform.rotate(
                    angle: _backgroundController.value * 2 * 3.14159,
                    child: Container(
                      width: 200 - (index * 20),
                      height: 200 - (index * 20),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            AppTheme.accentColor.withOpacity(0.08),
                            AppTheme.primaryColor.withOpacity(0.02),
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
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                gradient: _emailSent 
                                    ? LinearGradient(
                                        colors: [
                                          AppTheme.successColor,
                                          AppTheme.successColor.withOpacity(0.7),
                                        ],
                                      )
                                    : AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(30),
                                boxShadow: [
                                  BoxShadow(
                                    color: (_emailSent ? AppTheme.successColor : AppTheme.primaryColor)
                                        .withOpacity(0.3),
                                    blurRadius: 20,
                                    offset: Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Icon(
                                _emailSent ? Icons.check_circle_rounded : Icons.lock_reset_rounded,
                                size: 60,
                                color: Colors.white,
                              ),
                            ),
                          )
                              .animate(
                                target: _emailSent ? 1 : 0,
                                controller: _successController,
                              )
                              .scale(delay: 100.ms, duration: 600.ms, curve: Curves.elasticOut)
                              .fadeIn(duration: 600.ms)
                              .rotate(begin: 0, end: _emailSent ? 0.1 : 0, duration: 600.ms),

                          const SizedBox(height: 32),

                          // Title with gradient
                          ShaderMask(
                            shaderCallback: (bounds) => (_emailSent 
                                ? LinearGradient(
                                    colors: [AppTheme.successColor, AppTheme.successColor.withOpacity(0.7)]
                                  ) 
                                : AppTheme.primaryGradient
                            ).createShader(bounds),
                            child: Text(
                              _emailSent ? 'Email Sent!' : 'Forgot Password?',
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
                            _emailSent 
                                ? 'We\'ve sent a verification code to your email. Please check your inbox.'
                                : 'No worries! Enter your email and we\'ll send you a reset code.',
                            style: TextStyle(
                              fontSize: 15,
                              color: AppTheme.textSecondary,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          )
                              .animate()
                              .fadeIn(delay: 300.ms, duration: 600.ms),

                          const SizedBox(height: 48),

                          if (!_emailSent) ...[
                            // Glass card container for form
                            CustomCard(
                              useGlassmorphism: true,
                              padding: EdgeInsets.all(28),
                              child: Column(
                                children: [
                                  // Email field
                                  CustomTextField(
                                    controller: _emailController,
                                    label: 'Email Address',
                                    hint: 'your.email@example.com',
                                    keyboardType: TextInputType.emailAddress,
                                    prefixIcon: Icons.email_rounded,
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Please enter your email';
                                      }
                                      if (!value.contains('@')) {
                                        return 'Please enter a valid email';
                                      }
                                      return null;
                                    },
                                  )
                                      .animate()
                                      .fadeIn(delay: 400.ms, duration: 600.ms)
                                      .slideX(begin: -0.2, end: 0, duration: 600.ms),

                                  const SizedBox(height: 28),

                                  // Send Code button
                                  CustomButton(
                                    text: 'Send Reset Code',
                                    onPressed: _handleResetPassword,
                                    isLoading: _isLoading,
                                    useGradient: true,
                                    icon: Icons.send_rounded,
                                    width: double.infinity,
                                  )
                                      .animate()
                                      .fadeIn(delay: 500.ms, duration: 600.ms)
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
                                    padding: EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: AppTheme.successColor.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.email_rounded,
                                          color: AppTheme.successColor,
                                          size: 24,
                                        ),
                                        SizedBox(width: 12),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Sent to:',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: AppTheme.textSecondary,
                                                ),
                                              ),
                                              SizedBox(height: 4),
                                              Text(
                                                _emailController.text,
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
                                  ),
                                  SizedBox(height: 20),
                                  Text(
                                    'Redirecting to reset page...',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                  SizedBox(height: 12),
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

                          const SizedBox(height: 32),

                          // Back to login link
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.arrow_back_rounded,
                                size: 16,
                                color: AppTheme.primaryColor,
                              ),
                              SizedBox(width: 8),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                },
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.symmetric(horizontal: 8),
                                ),
                                child: Text(
                                  'Back to Sign In',
                                  style: TextStyle(
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15,
                                  ),
                                ),
                              ),
                            ],
                          )
                              .animate()
                              .fadeIn(delay: 600.ms, duration: 600.ms),

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
