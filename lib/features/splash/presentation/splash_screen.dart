import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _rotateController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    
    _rotateController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
    
    _navigateToNext();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _rotateController.dispose();
    super.dispose();
  }

  _navigateToNext() async {
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      Navigator.pushReplacementNamed(context, AppRoutes.onboarding);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF667EEA),
              Color(0xFF764BA2),
              Color(0xFFF093FB),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Animated background circles
            ...List.generate(3, (index) {
              return Positioned(
                top: 100.0 * index,
                right: -100.0 * index,
                child: AnimatedBuilder(
                  animation: _rotateController,
                  builder: (context, child) {
                    return Transform.rotate(
                      angle: _rotateController.value * 2 * 3.14159,
                      child: Container(
                        width: 300,
                        height: 300,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              Colors.white.withOpacity(0.05),
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
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Animated logo container
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: 1.0 + (_pulseController.value * 0.1),
                        child: Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.white,
                                Colors.white.withOpacity(0.9),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(35),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.3),
                                blurRadius: 30,
                                offset: const Offset(0, 15),
                              ),
                              BoxShadow(
                                color: Colors.white.withOpacity(0.3),
                                blurRadius: 20,
                                offset: const Offset(0, -5),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.school_rounded,
                            size: 70,
                            color: Color(0xFF667EEA),
                          ),
                        ),
                      );
                    },
                  )
                      .animate()
                      .scale(delay: 200.ms, duration: 800.ms, curve: Curves.elasticOut)
                      .fadeIn(duration: 600.ms),
                  
                  const SizedBox(height: 40),
                  
                  // App name with gradient
                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [Colors.white, Color(0xFFFFE5FF)],
                    ).createShader(bounds),
                    child: Text(
                      'LearnHub',
                      style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: -1,
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 500.ms, duration: 600.ms)
                      .slideY(begin: 0.3, end: 0, duration: 600.ms),
                  
                  const SizedBox(height: 12),
                  
                  Text(
                    'Your Personal Learning Assistant',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white.withOpacity(0.9),
                      letterSpacing: 0.5,
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 700.ms, duration: 600.ms),
                  
                  const SizedBox(height: 60),
                  
                  // Loading indicator
                  SizedBox(
                    width: 50,
                    height: 50,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Colors.white.withOpacity(0.8),
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 1000.ms, duration: 600.ms)
                      .scale(delay: 1000.ms, duration: 600.ms),
                ],
              ),
            ),
            
            // Version text at bottom
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Text(
                'Version 1.0.0',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 12,
                ),
              )
                  .animate()
                  .fadeIn(delay: 1500.ms, duration: 600.ms),
            ),
          ],
        ),
      ),
    );
  }
}

