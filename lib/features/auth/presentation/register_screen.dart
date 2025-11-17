import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/user_model.dart';
import '../../../core/providers/user_provider.dart';
import '../../../widgets/custom_button.dart';
import '../../../widgets/custom_text_field.dart';
import '../../../widgets/custom_card.dart';
import 'dart:ui';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _formationController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;
  bool _acceptTerms = false;
  UserRole _selectedRole = UserRole.learner;
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
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _formationController.dispose();
    _backgroundController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final success = await userProvider.register(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name: _nameController.text.trim(),
        role: _selectedRole,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        if (success) {
          Navigator.pushReplacementNamed(context, AppRoutes.home);
        } else {
          _showErrorSnackbar('Registration failed. Please try again.');
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
              left: -80 + (index * 60),
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

                // Scrollable form
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Title with gradient
                          ShaderMask(
                            shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                            child: Text(
                              'Create Account',
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
                            'Sign up to start your learning journey',
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

                          // Glass card container
                          CustomCard(
                            useGlassmorphism: true,
                            padding: EdgeInsets.all(28),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [

                                // Name field
                                CustomTextField(
                                  controller: _nameController,
                                  label: 'Full Name',
                                  hint: 'Enter your full name',
                                  prefixIcon: Icons.person_rounded,
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Please enter your name';
                                    }
                                    return null;
                                  },
                                  onChanged: (value) => setState(() {}),
                                )
                                    .animate()
                                    .fadeIn(delay: 400.ms, duration: 600.ms)
                                    .slideX(begin: -0.2, end: 0, duration: 600.ms),

                                const SizedBox(height: 20),

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
                                    .fadeIn(delay: 500.ms, duration: 600.ms)
                                    .slideX(begin: -0.2, end: 0, duration: 600.ms),

                                const SizedBox(height: 20),

                                // Password field with strength indicator
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    CustomTextField(
                                      controller: _passwordController,
                                      label: 'Password',
                                      hint: 'Enter your password',
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

                                // Role Selection with modern cards
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Account Type',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: _buildRoleCard(
                                            role: UserRole.learner,
                                            icon: Icons.school_rounded,
                                            title: 'Learner',
                                            subtitle: 'Start learning',
                                          ),
                                        ),
                                        SizedBox(width: 12),
                                        Expanded(
                                          child: _buildRoleCard(
                                            role: UserRole.trainer,
                                            icon: Icons.person_rounded,
                                            title: 'Trainer',
                                            subtitle: 'Teach others',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                )
                                    .animate()
                                    .fadeIn(delay: 700.ms, duration: 600.ms)
                                    .slideY(begin: 0.2, end: 0, duration: 600.ms),

                                const SizedBox(height: 20),

                                // Formation field (for learners)
                                if (_selectedRole == UserRole.learner)
                                  CustomTextField(
                                    controller: _formationController,
                                    label: 'Formation',
                                    hint: 'Enter your program/course',
                                    prefixIcon: Icons.school_outlined,
                                  )
                                      .animate()
                                      .fadeIn(delay: 750.ms, duration: 600.ms)
                                      .slideX(begin: -0.2, end: 0, duration: 600.ms),
                                if (_selectedRole == UserRole.learner)
                                  const SizedBox(height: 20),

                                // Confirm Password field
                                CustomTextField(
                                  controller: _confirmPasswordController,
                                  label: 'Confirm Password',
                                  hint: 'Re-enter your password',
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
                                    .fadeIn(delay: 800.ms, duration: 600.ms)
                                    .slideX(begin: -0.2, end: 0, duration: 600.ms),

                                const SizedBox(height: 20),

                                // Terms & Conditions checkbox
                                Row(
                                  children: [
                                    SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: Checkbox(
                                        value: _acceptTerms,
                                        onChanged: (value) {
                                          setState(() {
                                            _acceptTerms = value ?? false;
                                          });
                                        },
                                        activeColor: AppTheme.primaryColor,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                      ),
                                    ),
                                    SizedBox(width: 12),
                                    Expanded(
                                      child: RichText(
                                        text: TextSpan(
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: AppTheme.textSecondary,
                                          ),
                                          children: [
                                            TextSpan(text: 'I agree to the '),
                                            TextSpan(
                                              text: 'Terms & Conditions',
                                              style: TextStyle(
                                                color: AppTheme.primaryColor,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            TextSpan(text: ' and '),
                                            TextSpan(
                                              text: 'Privacy Policy',
                                              style: TextStyle(
                                                color: AppTheme.primaryColor,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                                    .animate()
                                    .fadeIn(delay: 850.ms, duration: 600.ms),

                                const SizedBox(height: 28),

                                // Register button
                                CustomButton(
                                  text: 'Create Account',
                                  onPressed: _acceptTerms ? () => _handleRegister() : null,
                                  isLoading: _isLoading,
                                  useGradient: true,
                                  icon: Icons.arrow_forward_rounded,
                                  width: double.infinity,
                                )
                                    .animate()
                                    .fadeIn(delay: 900.ms, duration: 600.ms)
                                    .slideY(begin: 0.2, end: 0, duration: 600.ms),
                              ],
                            ),
                          ),

                          const SizedBox(height: 32),

                          // Social register divider
                          Row(
                            children: [
                              Expanded(child: Divider(color: AppTheme.borderColor)),
                              Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16),
                                child: Text(
                                  'OR',
                                  style: TextStyle(
                                    color: AppTheme.textSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              Expanded(child: Divider(color: AppTheme.borderColor)),
                            ],
                          )
                              .animate()
                              .fadeIn(delay: 950.ms, duration: 600.ms),

                          const SizedBox(height: 24),

                          // Social register buttons
                          Row(
                            children: [
                              Expanded(
                                child: _buildSocialButton(
                                  icon: Icons.g_mobiledata_rounded,
                                  label: 'Google',
                                  onTap: () {
                                    // Handle Google register
                                  },
                                ),
                              ),
                              SizedBox(width: 16),
                              Expanded(
                                child: _buildSocialButton(
                                  icon: Icons.apple_rounded,
                                  label: 'Apple',
                                  onTap: () {
                                    // Handle Apple register
                                  },
                                ),
                              ),
                            ],
                          )
                              .animate()
                              .fadeIn(delay: 1000.ms, duration: 600.ms),

                          const SizedBox(height: 32),

                          // Login link
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Already have an account? ',
                                style: TextStyle(
                                  color: AppTheme.textSecondary,
                                  fontSize: 15,
                                ),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                },
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.symmetric(horizontal: 8),
                                ),
                                child: Text(
                                  'Sign In',
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
                              .fadeIn(delay: 1100.ms, duration: 600.ms),

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

  Widget _buildRoleCard({
    required UserRole role,
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    final isSelected = _selectedRole == role;
    
    return InkWell(
      onTap: () {
        setState(() {
          _selectedRole = role;
        });
      },
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 300),
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryColor.withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.primaryColor : AppTheme.borderColor,
            width: isSelected ? 2 : 1.5,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: isSelected ? AppTheme.primaryGradient : null,
                color: isSelected ? null : Colors.grey.shade200,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                color: isSelected ? Colors.white : Colors.grey.shade600,
                size: 24,
              ),
            ),
            SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: isSelected ? AppTheme.primaryColor : AppTheme.textPrimary,
              ),
            ),
            SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSocialButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
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
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

