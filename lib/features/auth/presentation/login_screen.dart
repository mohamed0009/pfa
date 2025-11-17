import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/user_provider.dart';
import '../../../core/models/user_model.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';
import '../../../widgets/custom_card.dart';
import 'forgot_password_screen.dart';
import 'dart:ui';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  late AnimationController _backgroundController;

  @override
  void initState() {
    super.initState();
    _backgroundController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _backgroundController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final success = await userProvider.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        
        if (success) {
          final user = userProvider.currentUser;
          if (user?.role == UserRole.learner) {
            Navigator.pushReplacementNamed(context, AppRoutes.learnerDashboard);
          } else {
            Navigator.pushReplacementNamed(context, AppRoutes.home);
          }
        } else {
          _showErrorSnackbar('Email ou mot de passe incorrect');
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
          ...List.generate(3, (index) {
            return Positioned(
              top: -50 + (index * 200),
              right: -100 + (index * 50),
              child: AnimatedBuilder(
                animation: _backgroundController,
                builder: (context, child) {
                  return Transform.rotate(
                    angle: _backgroundController.value * 2 * 3.14159,
                    child: Container(
                      width: 250 - (index * 30),
                      height: 250 - (index * 30),
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
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SizedBox(height: 40),
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(25),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryColor.withOpacity(0.3),
                            blurRadius: 20,
                            offset: Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Icon(Icons.school_rounded, size: 50, color: Colors.white),
                    ).animate().scale(delay: 100.ms, duration: 600.ms, curve: Curves.elasticOut).fadeIn(duration: 600.ms),
                    SizedBox(height: 32),
                    ShaderMask(
                      shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                      child: Text('Welcome Back!', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: -0.5), textAlign: TextAlign.center),
                    ).animate().fadeIn(delay: 200.ms, duration: 600.ms).slideY(begin: -0.3, end: 0, duration: 600.ms),
                    SizedBox(height: 12),
                    Text('Sign in to continue your learning journey', style: TextStyle(fontSize: 15, color: AppTheme.textSecondary, height: 1.5), textAlign: TextAlign.center).animate().fadeIn(delay: 300.ms, duration: 600.ms),
                    SizedBox(height: 48),
                    CustomCard(
                      useGlassmorphism: true,
                      padding: EdgeInsets.all(28),
                      child: Column(
                        children: [
                          CustomTextField(
                            controller: _emailController,
                            label: 'Email Address',
                            hint: 'your.email@example.com',
                            keyboardType: TextInputType.emailAddress,
                            prefixIcon: Icons.email_rounded,
                            validator: (value) {
                              if (value == null || value.isEmpty) return 'Please enter your email';
                              if (!value.contains('@')) return 'Please enter a valid email';
                              return null;
                            },
                          ).animate().fadeIn(delay: 400.ms, duration: 600.ms).slideX(begin: -0.2, end: 0, duration: 600.ms),
                          SizedBox(height: 20),
                          CustomTextField(
                            controller: _passwordController,
                            label: 'Password',
                            hint: 'Enter your password',
                            obscureText: _obscurePassword,
                            prefixIcon: Icons.lock_rounded,
                            suffixIcon: IconButton(
                              icon: Icon(_obscurePassword ? Icons.visibility_rounded : Icons.visibility_off_rounded, color: AppTheme.primaryColor),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) return 'Please enter your password';
                              if (value.length < 6) return 'Password must be at least 6 characters';
                              return null;
                            },
                          ).animate().fadeIn(delay: 500.ms, duration: 600.ms).slideX(begin: -0.2, end: 0, duration: 600.ms),
                          SizedBox(height: 16),
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => ForgotPasswordScreen())),
                              style: TextButton.styleFrom(padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8)),
                              child: Text('Forgot Password?', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
                            ),
                          ).animate().fadeIn(delay: 600.ms, duration: 600.ms),
                          SizedBox(height: 24),
                          CustomButton(
                            text: 'Sign In',
                            onPressed: _handleLogin,
                            isLoading: _isLoading,
                            useGradient: true,
                            icon: Icons.arrow_forward_rounded,
                            width: double.infinity,
                          ).animate().fadeIn(delay: 700.ms, duration: 600.ms).slideY(begin: 0.2, end: 0, duration: 600.ms),
                        ],
                      ),
                    ),
                    SizedBox(height: 32),
                    Row(
                      children: [
                        Expanded(child: Divider(color: AppTheme.borderColor)),
                        Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text('OR', style: TextStyle(color: AppTheme.textSecondary, fontWeight: FontWeight.w600))),
                        Expanded(child: Divider(color: AppTheme.borderColor)),
                      ],
                    ).animate().fadeIn(delay: 800.ms, duration: 600.ms),
                    SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(child: _buildSocialButton(icon: Icons.g_mobiledata_rounded, label: 'Google', onTap: () {})),
                        SizedBox(width: 16),
                        Expanded(child: _buildSocialButton(icon: Icons.apple_rounded, label: 'Apple', onTap: () {})),
                      ],
                    ).animate().fadeIn(delay: 900.ms, duration: 600.ms),
                    SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("Don't have an account? ", style: TextStyle(color: AppTheme.textSecondary, fontSize: 15)),
                        TextButton(
                          onPressed: () => Navigator.pushNamed(context, AppRoutes.register),
                          style: TextButton.styleFrom(padding: EdgeInsets.symmetric(horizontal: 8)),
                          child: Text('Sign Up', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 15)),
                        ),
                      ],
                    ).animate().fadeIn(delay: 1000.ms, duration: 600.ms),
                    SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSocialButton({required IconData icon, required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.borderColor, width: 1.5),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 24),
            SizedBox(width: 8),
            Text(label, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          ],
        ),
      ),
    );
  }
}
