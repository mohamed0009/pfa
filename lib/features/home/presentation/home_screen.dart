import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/user_provider.dart';
import '../../../core/models/user_model.dart';
import '../../../widgets/custom_card.dart';
import '../../../widgets/stat_card.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../dashboard/presentation/trainer_dashboard.dart';
import '../../dashboard/presentation/admin_dashboard.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.currentUser;

    // Redirect based on role
    if (user != null) {
      if (user.role == UserRole.learner) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          Navigator.pushReplacementNamed(context, AppRoutes.learnerDashboard);
        });
        return const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        );
      } else if (user.role == UserRole.trainer) {
        return const TrainerDashboard();
      } else if (user.role == UserRole.admin) {
        return const AdminDashboard();
      }
    }

    return Scaffold(
      body: SafeArea(
        child: _buildCurrentPage(),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
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
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search_outlined),
              activeIcon: Icon(Icons.search),
              label: 'Explore',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.favorite_outline),
              activeIcon: Icon(Icons.favorite),
              label: 'Favorites',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentPage() {
    switch (_currentIndex) {
      case 0:
        return _buildHomePage();
      case 1:
        return _buildExplorePage();
      case 2:
        return _buildFavoritesPage();
      case 3:
        return const ProfileScreen();
      default:
        return _buildHomePage();
    }
  }

  Widget _buildHomePage() {
    return CustomScrollView(
      slivers: [
        // App Bar
        SliverAppBar(
          expandedHeight: 120,
          floating: false,
          pinned: true,
          backgroundColor: Colors.transparent,
          elevation: 0,
          flexibleSpace: FlexibleSpaceBar(
            title: Text(
              'Welcome Back!',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            titlePadding: const EdgeInsets.only(left: 24, bottom: 16),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.settings_outlined),
              onPressed: () {
                Navigator.pushNamed(context, AppRoutes.settings);
              },
            ),
            const SizedBox(width: 8),
          ],
        ),

        // Content
        SliverPadding(
          padding: const EdgeInsets.all(24),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // Stats Section
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      title: 'Total Tasks',
                      value: '24',
                      icon: Icons.task_outlined,
                      color: AppTheme.primaryColor,
                    )
                        .animate()
                        .fadeIn(delay: 100.ms)
                        .slideX(begin: -0.2, end: 0),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: StatCard(
                      title: 'Completed',
                      value: '18',
                      icon: Icons.check_circle_outline,
                      color: AppTheme.successColor,
                    )
                        .animate()
                        .fadeIn(delay: 200.ms)
                        .slideX(begin: 0.2, end: 0),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: StatCard(
                      title: 'In Progress',
                      value: '6',
                      icon: Icons.hourglass_empty_outlined,
                      color: AppTheme.warningColor,
                    )
                        .animate()
                        .fadeIn(delay: 300.ms)
                        .slideX(begin: -0.2, end: 0),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: StatCard(
                      title: 'Goals',
                      value: '12',
                      icon: Icons.flag_outlined,
                      color: AppTheme.accentColor,
                    )
                        .animate()
                        .fadeIn(delay: 400.ms)
                        .slideX(begin: 0.2, end: 0),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Quick Actions
              Text(
                'Quick Actions',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              )
                  .animate()
                  .fadeIn(delay: 500.ms),
              const SizedBox(height: 16),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.5,
                children: [
                  _buildQuickActionCard(
                    'New Task',
                    Icons.add_task,
                    AppTheme.primaryColor,
                  )
                      .animate()
                      .fadeIn(delay: 600.ms)
                      .scale(),
                  _buildQuickActionCard(
                    'Analytics',
                    Icons.analytics_outlined,
                    AppTheme.secondaryColor,
                  )
                      .animate()
                      .fadeIn(delay: 700.ms)
                      .scale(),
                  _buildQuickActionCard(
                    'Projects',
                    Icons.folder_outlined,
                    AppTheme.accentColor,
                  )
                      .animate()
                      .fadeIn(delay: 800.ms)
                      .scale(),
                  _buildQuickActionCard(
                    'Team',
                    Icons.people_outline,
                    AppTheme.successColor,
                  )
                      .animate()
                      .fadeIn(delay: 900.ms)
                      .scale(),
                ],
              ),
              const SizedBox(height: 32),

              // Recent Activity
              Text(
                'Recent Activity',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              )
                  .animate()
                  .fadeIn(delay: 1000.ms),
              const SizedBox(height: 16),
              ...List.generate(5, (index) {
                return CustomCard(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                      child: Icon(
                        Icons.check_circle,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                    title: Text('Task ${index + 1} completed'),
                    subtitle: Text('${index + 1} hours ago'),
                    trailing: Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                )
                    .animate()
                    .fadeIn(delay: (1100 + index * 100).ms)
                    .slideX(begin: 0.3, end: 0);
              }),
              const SizedBox(height: 24),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(String title, IconData icon, Color color) {
    return CustomCard(
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildExplorePage() {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          title: const Text('Explore'),
          floating: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {},
            ),
          ],
        ),
        SliverPadding(
          padding: const EdgeInsets.all(24),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                return CustomCard(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppTheme.primaryColor.withOpacity(0.8),
                          AppTheme.secondaryColor.withOpacity(0.8),
                        ],
                      ),
                    ),
                    child: Center(
                      child: Text(
                        'Item ${index + 1}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                )
                    .animate()
                    .fadeIn(delay: (index * 100).ms)
                    .scale();
              },
              childCount: 10,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFavoritesPage() {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          title: const Text('Favorites'),
          floating: true,
        ),
        SliverPadding(
          padding: const EdgeInsets.all(24),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: CustomCard(
                    child: ListTile(
                      leading: const Icon(
                        Icons.favorite,
                        color: AppTheme.accentColor,
                      ),
                      title: Text('Favorite Item ${index + 1}'),
                      subtitle: const Text('This is a favorite item'),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    ),
                  )
                      .animate()
                      .fadeIn(delay: (index * 100).ms)
                      .slideX(begin: 0.3, end: 0),
                );
              },
              childCount: 8,
            ),
          ),
        ),
      ],
    );
  }
}

