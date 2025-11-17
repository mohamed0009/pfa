import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_dimensions.dart';
import '../../../core/providers/user_provider.dart';
import '../../../widgets/custom_card.dart';
import '../../../widgets/stat_card.dart';
import '../../chat/presentation/chat_screen.dart';
import '../../learning/presentation/learning_modules_screen.dart';
import '../../profile/presentation/profile_screen.dart';
import 'dart:ui';

class LearnerDashboard extends StatefulWidget {
  const LearnerDashboard({super.key});

  @override
  State<LearnerDashboard> createState() => _LearnerDashboardState();
}

class _LearnerDashboardState extends State<LearnerDashboard> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.currentUser;

    return Scaffold(
      body: SafeArea(
        child: _buildCurrentPage(user),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              type: BottomNavigationBarType.fixed,
              selectedItemColor: AppTheme.primaryColor,
              unselectedItemColor: AppTheme.textSecondary,
              selectedFontSize: 12,
              unselectedFontSize: 12,
              selectedLabelStyle: TextStyle(fontWeight: FontWeight.w600),
              backgroundColor: Colors.transparent,
              elevation: 0,
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.dashboard_outlined),
                  activeIcon: Icon(Icons.dashboard_rounded),
                  label: 'Dashboard',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.school_outlined),
                  activeIcon: Icon(Icons.school_rounded),
                  label: 'Modules',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.chat_bubble_outline_rounded),
                  activeIcon: Icon(Icons.chat_bubble_rounded),
                  label: 'Coach',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.person_outline_rounded),
                  activeIcon: Icon(Icons.person_rounded),
                  label: 'Profile',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentPage(user) {
    switch (_currentIndex) {
      case 0:
        return _buildDashboard(user);
      case 1:
        return const LearningModulesScreen();
      case 2:
        return const ChatScreen();
      case 3:
        return const ProfileScreen();
      default:
        return _buildDashboard(user);
    }
  }

  Widget _buildDashboard(user) {
    return Stack(
      children: [
        // Gradient background
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppTheme.primaryColor.withOpacity(0.05),
                AppTheme.accentColor.withOpacity(0.02),
                Colors.white,
              ],
            ),
          ),
        ),

        // Main content
        CustomScrollView(
          slivers: [
            // Modern App Bar with glassmorphism
            SliverAppBar(
              expandedHeight: 140,
              floating: false,
              pinned: true,
              backgroundColor: Colors.transparent,
              elevation: 0,
              flexibleSpace: ClipRRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withOpacity(0.9),
                          Colors.white.withOpacity(0.7),
                        ],
                      ),
                    ),
                    child: FlexibleSpaceBar(
                      titlePadding: const EdgeInsets.only(left: 20, bottom: 16, right: 80),
                      title: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hello!',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppTheme.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user?.name ?? "Learner",
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              actions: [
                Padding(
                  padding: const EdgeInsets.only(right: 16, top: 8, bottom: 8),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.notifications_rounded, color: AppTheme.primaryColor),
                      onPressed: () {},
                    ),
                  ),
                ),
              ],
            ),

            SliverPadding(
              padding: const EdgeInsets.all(24),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // Welcome card with gradient
                  CustomCard(
                    useGlassmorphism: true,
                    child: Container(
                      padding: EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Continue Learning',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                SizedBox(height: 8),
                                Text(
                                  'You\'re doing great! Keep it up 🎉',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.rocket_launch_rounded,
                              size: 32,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 200.ms)
                      .slideY(begin: 0.2, end: 0, duration: 600.ms),

                  const SizedBox(height: 32),

                  // Progress Overview Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Your Progress',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () {},
                        icon: Icon(Icons.arrow_forward_rounded, size: 16),
                        label: Text('View All'),
                        style: TextButton.styleFrom(
                          foregroundColor: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  )
                      .animate()
                      .fadeIn(delay: 300.ms),

                  const SizedBox(height: 16),

                  // Stats Grid with modern design
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: 'Modules',
                          value: '12',
                          subtitle: 'Total',
                          icon: Icons.book_rounded,
                          color: AppTheme.primaryColor,
                          onTap: () => setState(() => _currentIndex = 1),
                        )
                            .animate()
                            .fadeIn(delay: 400.ms)
                            .scale(delay: 400.ms, duration: 400.ms),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: StatCard(
                          title: 'Completed',
                          value: '8',
                          subtitle: '67% Done',
                          icon: Icons.check_circle_rounded,
                          color: AppTheme.successColor,
                        )
                            .animate()
                            .fadeIn(delay: 500.ms)
                            .scale(delay: 500.ms, duration: 400.ms),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: 'In Progress',
                          value: '4',
                          subtitle: 'Active now',
                          icon: Icons.hourglass_empty_rounded,
                          color: AppTheme.warningColor,
                        )
                            .animate()
                            .fadeIn(delay: 600.ms)
                            .scale(delay: 600.ms, duration: 400.ms),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: StatCard(
                          title: 'Avg Score',
                          value: '85%',
                          subtitle: '+5% this week',
                          icon: Icons.trending_up_rounded,
                          color: AppTheme.accentColor,
                        )
                            .animate()
                            .fadeIn(delay: 700.ms)
                            .scale(delay: 700.ms, duration: 400.ms),
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Quick Actions Section
                  Text(
                    'Quick Actions',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 800.ms),

                  const SizedBox(height: 16),

                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.4,
                    children: [
                      _buildQuickActionCard(
                        'AI Coach',
                        Icons.smart_toy_rounded,
                        AppTheme.primaryColor,
                        () => setState(() => _currentIndex = 2),
                      )
                          .animate()
                          .fadeIn(delay: 900.ms)
                          .scale(delay: 900.ms),
                      _buildQuickActionCard(
                        'My Modules',
                        Icons.school_rounded,
                        AppTheme.secondaryColor,
                        () => setState(() => _currentIndex = 1),
                      )
                          .animate()
                          .fadeIn(delay: 950.ms)
                          .scale(delay: 950.ms),
                      _buildQuickActionCard(
                        'Analytics',
                        Icons.analytics_rounded,
                        AppTheme.accentColor,
                        () {},
                      )
                          .animate()
                          .fadeIn(delay: 1000.ms)
                          .scale(delay: 1000.ms),
                      _buildQuickActionCard(
                        'Quiz Time',
                        Icons.quiz_rounded,
                        AppTheme.successColor,
                        () {},
                      )
                          .animate()
                          .fadeIn(delay: 1050.ms)
                          .scale(delay: 1050.ms),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Recent Activity Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Activity',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: Text('See All'),
                        style: TextButton.styleFrom(
                          foregroundColor: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  )
                      .animate()
                      .fadeIn(delay: 1100.ms),

                  const SizedBox(height: 16),

                  ...List.generate(3, (index) {
                    final icons = [
                      Icons.check_circle_rounded,
                      Icons.star_rounded,
                      Icons.emoji_events_rounded,
                    ];
                    final titles = [
                      'Module completed',
                      'New achievement unlocked',
                      'Quiz score: 95%',
                    ];
                    final subtitles = [
                      '${index + 1} hours ago',
                      '${index + 2} hours ago',
                      'Yesterday',
                    ];
                    final colors = [
                      AppTheme.successColor,
                      AppTheme.warningColor,
                      AppTheme.accentColor,
                    ];

                    return CustomCard(
                      useGlassmorphism: true,
                      margin: EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                colors[index].withOpacity(0.8),
                                colors[index],
                              ],
                            ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: colors[index].withOpacity(0.3),
                                blurRadius: 8,
                                offset: Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Icon(
                            icons[index],
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        title: Text(
                          titles[index],
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        subtitle: Text(
                          subtitles[index],
                          style: TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 13,
                          ),
                        ),
                        trailing: Icon(
                          Icons.arrow_forward_ios_rounded,
                          size: 16,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    )
                        .animate()
                        .fadeIn(delay: (1200 + index * 100).ms)
                        .slideX(begin: 0.2, end: 0, duration: 400.ms);
                  }),

                  const SizedBox(height: 24),
                ]),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return CustomCard(
      useGlassmorphism: true,
      padding: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                color.withOpacity(0.1),
                color.withOpacity(0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      color.withOpacity(0.8),
                      color,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: color.withOpacity(0.3),
                      blurRadius: 12,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 28),
              ),
              const Spacer(),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              SizedBox(height: 4),
              Row(
                children: [
                  Text(
                    'Tap to open',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(
                    Icons.arrow_forward_rounded,
                    size: 12,
                    color: color,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

