import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_card.dart';
import '../../../widgets/custom_button.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        // Profile Header
        SliverAppBar(
          expandedHeight: 180,
          floating: false,
          pinned: true,
          backgroundColor: Colors.transparent,
          elevation: 0,
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppTheme.primaryColor,
                    AppTheme.secondaryColor,
                  ],
                ),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 30),
                    Hero(
                      tag: 'profile_avatar',
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          border: Border.all(
                            color: Colors.white,
                            width: 3,
                          ),
                        ),
                        child: const Icon(
                          Icons.person,
                          size: 45,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    )
                        .animate()
                        .scale(delay: 100.ms, duration: 600.ms)
                        .fadeIn(duration: 600.ms),
                    const SizedBox(height: 12),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        'John Doe',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        textAlign: TextAlign.center,
                      ),
                    )
                        .animate()
                        .fadeIn(delay: 200.ms, duration: 600.ms),
                    const SizedBox(height: 4),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        'john.doe@example.com',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 13,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                        textAlign: TextAlign.center,
                      ),
                    )
                        .animate()
                        .fadeIn(delay: 300.ms, duration: 600.ms),
                  ],
                ),
              ),
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: Colors.white),
              onPressed: () {},
            ),
            const SizedBox(width: 8),
          ],
        ),

        // Profile Content
        SliverPadding(
          padding: const EdgeInsets.all(24),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // Edit Profile Button
              CustomButton(
                text: 'Edit Profile',
                onPressed: () {},
                icon: Icons.edit,
                isOutlined: true,
              )
                  .animate()
                  .fadeIn(delay: 400.ms, duration: 600.ms)
                  .slideY(begin: 0.3, end: 0, duration: 600.ms),
              const SizedBox(height: 24),

              // Stats Row
              Row(
                children: [
                  Expanded(
                    child: _buildStatItem('Tasks', '24', context),
                  ),
                  Expanded(
                    child: _buildStatItem('Completed', '18', context),
                  ),
                  Expanded(
                    child: _buildStatItem('Goals', '12', context),
                  ),
                ],
              )
                  .animate()
                  .fadeIn(delay: 500.ms, duration: 600.ms),
              const SizedBox(height: 32),

              // Menu Items
              Text(
                'Account',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              )
                  .animate()
                  .fadeIn(delay: 600.ms),
              const SizedBox(height: 16),
              ..._buildMenuItems([
                _MenuItem(
                  icon: Icons.person_outline,
                  title: 'Personal Information',
                  onTap: () {},
                ),
                _MenuItem(
                  icon: Icons.security_outlined,
                  title: 'Privacy & Security',
                  onTap: () {},
                ),
                _MenuItem(
                  icon: Icons.notifications_outlined,
                  title: 'Notifications',
                  onTap: () {},
                ),
              ], 700)
                  .animate(delay: 700.ms)
                  .fadeIn(duration: 600.ms)
                  .slideX(begin: 0.3, end: 0, duration: 600.ms),
              const SizedBox(height: 32),

              Text(
                'Settings',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              )
                  .animate()
                  .fadeIn(delay: 1000.ms),
              const SizedBox(height: 16),
              ..._buildMenuItems([
                _MenuItem(
                  icon: Icons.settings_outlined,
                  title: 'App Settings',
                  onTap: () {
                    Navigator.pushNamed(context, AppRoutes.settings);
                  },
                ),
                _MenuItem(
                  icon: Icons.help_outline,
                  title: 'Help & Support',
                  onTap: () {},
                ),
                _MenuItem(
                  icon: Icons.info_outline,
                  title: 'About',
                  onTap: () {},
                ),
              ], 1100)
                  .animate(delay: 1100.ms)
                  .fadeIn(duration: 600.ms)
                  .slideX(begin: 0.3, end: 0, duration: 600.ms),
              const SizedBox(height: 32),

              // Logout Button
              CustomButton(
                text: 'Logout',
                onPressed: () {
                  Navigator.pushReplacementNamed(context, AppRoutes.login);
                },
                backgroundColor: AppTheme.errorColor,
                icon: Icons.logout,
              )
                  .animate()
                  .fadeIn(delay: 1400.ms, duration: 600.ms)
                  .slideY(begin: 0.3, end: 0, duration: 600.ms),
              const SizedBox(height: 24),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textSecondary,
              ),
        ),
      ],
    );
  }

  List<Widget> _buildMenuItems(List<_MenuItem> items, int startDelay) {
    return items.map((item) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: CustomCard(
          child: ListTile(
            leading: Icon(item.icon, color: AppTheme.primaryColor),
            title: Text(item.title),
            trailing: const Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: AppTheme.textSecondary,
            ),
            onTap: item.onTap,
          ),
        ),
      );
    }).toList();
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  _MenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });
}

