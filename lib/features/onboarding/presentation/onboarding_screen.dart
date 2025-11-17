import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_button.dart';
import 'dart:ui';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  late AnimationController _floatingController;

  final List<OnboardingItem> _pages = [
    OnboardingItem(
      title: 'AI-Powered Learning',
      description: 'Get personalized learning paths powered by advanced AI that adapts to your pace and style.',
      icon: Icons.psychology_rounded,
      color: Color(0xFF6366F1),
      lottieAsset: 'assets/animations/learning.json',
    ),
    OnboardingItem(
      title: 'Interactive Coaching',
      description: 'Chat with your AI coach anytime, anywhere. Get instant answers and guidance on your journey.',
      icon: Icons.chat_bubble_rounded,
      color: Color(0xFF8B5CF6),
      lottieAsset: 'assets/animations/chat.json',
    ),
    OnboardingItem(
      title: 'Track Your Progress',
      description: 'Monitor your achievements with beautiful analytics and stay motivated with milestone rewards.',
      icon: Icons.trending_up_rounded,
      color: Color(0xFF06B6D4),
      lottieAsset: 'assets/animations/progress.json',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _floatingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _floatingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              _pages[_currentPage].color.withOpacity(0.05),
              _pages[_currentPage].color.withOpacity(0.02),
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              // Animated background circles
              ...List.generate(3, (index) {
                return Positioned(
                  top: 100.0 + (index * 150),
                  right: -50.0 - (index * 30),
                  child: AnimatedBuilder(
                    animation: _floatingController,
                    builder: (context, child) {
                      return Transform.translate(
                        offset: Offset(
                          0,
                          30 * _floatingController.value * (index % 2 == 0 ? 1 : -1),
                        ),
                        child: Container(
                          width: 200 - (index * 30),
                          height: 200 - (index * 30),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: RadialGradient(
                              colors: [
                                _pages[_currentPage].color.withOpacity(0.1),
                                _pages[_currentPage].color.withOpacity(0.02),
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
              Column(
                children: [
                  // Header with Skip button
                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: _pages[_currentPage].color.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${_currentPage + 1}/${_pages.length}',
                            style: TextStyle(
                              color: _pages[_currentPage].color,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.pushReplacementNamed(context, AppRoutes.login);
                          },
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          ),
                          child: Text(
                            'Skip',
                            style: TextStyle(
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Page view
                  Expanded(
                    child: PageView.builder(
                      controller: _pageController,
                      onPageChanged: (index) {
                        setState(() {
                          _currentPage = index;
                        });
                      },
                      itemCount: _pages.length,
                      itemBuilder: (context, index) {
                        return _buildPage(_pages[index], index);
                      },
                    ),
                  ),

                  // Page indicator with modern design
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: _pages[_currentPage].color.withOpacity(0.2),
                          blurRadius: 20,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: SmoothPageIndicator(
                      controller: _pageController,
                      count: _pages.length,
                      effect: ExpandingDotsEffect(
                        dotColor: AppTheme.borderColor,
                        activeDotColor: _pages[_currentPage].color,
                        dotHeight: 8,
                        dotWidth: 8,
                        expansionFactor: 4,
                        spacing: 6,
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Navigation buttons
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: Row(
                      children: [
                        if (_currentPage > 0)
                          Expanded(
                            child: CustomButton(
                              text: 'Back',
                              onPressed: () {
                                _pageController.previousPage(
                                  duration: const Duration(milliseconds: 400),
                                  curve: Curves.easeInOutCubic,
                                );
                              },
                              isOutlined: true,
                              backgroundColor: _pages[_currentPage].color,
                            ),
                          ),
                        if (_currentPage > 0) const SizedBox(width: 16),
                        Expanded(
                          flex: _currentPage == 0 ? 1 : 2,
                          child: CustomButton(
                            text: _currentPage == _pages.length - 1 ? 'Get Started' : 'Continue',
                            onPressed: () {
                              if (_currentPage == _pages.length - 1) {
                                Navigator.pushReplacementNamed(context, AppRoutes.login);
                              } else {
                                _pageController.nextPage(
                                  duration: const Duration(milliseconds: 400),
                                  curve: Curves.easeInOutCubic,
                                );
                              }
                            },
                            useGradient: true,
                            icon: _currentPage == _pages.length - 1 
                                ? Icons.rocket_launch_rounded 
                                : Icons.arrow_forward_rounded,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPage(OnboardingItem item, int index) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            const SizedBox(height: 40),
            
            // Icon container with modern design
            AnimatedBuilder(
              animation: _floatingController,
              builder: (context, child) {
                return Transform.translate(
                  offset: Offset(0, 15 * _floatingController.value),
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          item.color.withOpacity(0.2),
                          item.color.withOpacity(0.05),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    child: Center(
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              item.color,
                              item.color.withOpacity(0.8),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: [
                            BoxShadow(
                              color: item.color.withOpacity(0.4),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Icon(
                          item.icon,
                          size: 60,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                );
              },
            )
                .animate()
                .fadeIn(duration: 600.ms, delay: 100.ms)
                .scale(duration: 600.ms, delay: 100.ms, curve: Curves.elasticOut),

            const SizedBox(height: 40),

            // Title with gradient
            ShaderMask(
              shaderCallback: (bounds) => LinearGradient(
                colors: [
                  item.color,
                  item.color.withOpacity(0.7),
                ],
              ).createShader(bounds),
              child: Text(
                item.title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: -0.5,
                  height: 1.2,
                ),
              ),
            )
                .animate()
                .fadeIn(duration: 600.ms, delay: 300.ms)
                .slideY(begin: 0.3, end: 0, duration: 600.ms, delay: 300.ms),

            const SizedBox(height: 16),

            // Description
            Text(
              item.description,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: AppTheme.textSecondary,
                height: 1.5,
                letterSpacing: 0.2,
              ),
            )
                .animate()
                .fadeIn(duration: 600.ms, delay: 500.ms)
                .slideY(begin: 0.2, end: 0, duration: 600.ms, delay: 500.ms),

            const SizedBox(height: 32),

            // Feature highlights
            _buildFeatureHighlights(item)
                .animate()
                .fadeIn(duration: 600.ms, delay: 700.ms)
                .slideY(begin: 0.2, end: 0, duration: 600.ms, delay: 700.ms),
                
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureHighlights(OnboardingItem item) {
    final features = [
      if (_currentPage == 0) ...[
        'Personalized AI',
        'Adaptive Learning',
        'Smart Recommendations',
      ],
      if (_currentPage == 1) ...[
        '24/7 AI Support',
        'Instant Responses',
        'Context-Aware',
      ],
      if (_currentPage == 2) ...[
        'Visual Analytics',
        'Achievements',
        'Progress Insights',
      ],
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: features.map((feature) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: item.color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: item.color.withOpacity(0.3),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.check_circle_rounded,
                size: 14,
                color: item.color,
              ),
              const SizedBox(width: 6),
              Text(
                feature,
                style: TextStyle(
                  color: item.color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class OnboardingItem {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final String? lottieAsset;

  OnboardingItem({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    this.lottieAsset,
  });
}

