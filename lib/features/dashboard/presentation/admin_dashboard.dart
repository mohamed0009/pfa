import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_card.dart';
import '../../../widgets/stat_card.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord Administrateur'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.all(24),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // System Overview
                  Text(
                    'Vue d\'ensemble du système',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  )
                      .animate()
                      .fadeIn(delay: 100.ms),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: 'Total utilisateurs',
                          value: '156',
                          icon: Icons.people_outlined,
                          color: AppTheme.primaryColor,
                        )
                            .animate()
                            .fadeIn(delay: 200.ms)
                            .slideX(begin: -0.2, end: 0),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: StatCard(
                          title: 'Formateurs',
                          value: '12',
                          icon: Icons.person_outlined,
                          color: AppTheme.secondaryColor,
                        )
                            .animate()
                            .fadeIn(delay: 300.ms)
                            .slideX(begin: 0.2, end: 0),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: 'Apprenants',
                          value: '144',
                          icon: Icons.school_outlined,
                          color: AppTheme.accentColor,
                        )
                            .animate()
                            .fadeIn(delay: 400.ms)
                            .slideX(begin: -0.2, end: 0),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: StatCard(
                          title: 'Modules',
                          value: '24',
                          icon: Icons.library_books_outlined,
                          color: AppTheme.successColor,
                        )
                            .animate()
                            .fadeIn(delay: 500.ms)
                            .slideX(begin: 0.2, end: 0),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Management Actions
                  Text(
                    'Gestion',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  )
                      .animate()
                      .fadeIn(delay: 600.ms),
                  const SizedBox(height: 16),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 1.5,
                    children: [
                      _buildActionCard(
                        context,
                        'Gestion utilisateurs',
                        Icons.people_outlined,
                        AppTheme.primaryColor,
                        () {},
                      )
                          .animate()
                          .fadeIn(delay: 700.ms)
                          .scale(),
                      _buildActionCard(
                        context,
                        'Gestion contenus',
                        Icons.library_books_outlined,
                        AppTheme.secondaryColor,
                        () {},
                      )
                          .animate()
                          .fadeIn(delay: 800.ms)
                          .scale(),
                      _buildActionCard(
                        context,
                        'Paramètres système',
                        Icons.settings_outlined,
                        AppTheme.accentColor,
                        () {},
                      )
                          .animate()
                          .fadeIn(delay: 900.ms)
                          .scale(),
                      _buildActionCard(
                        context,
                        'Rapports',
                        Icons.assessment_outlined,
                        AppTheme.successColor,
                        () {},
                      )
                          .animate()
                          .fadeIn(delay: 1000.ms)
                          .scale(),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Recent Activity
                  Text(
                    'Activité récente',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  )
                      .animate()
                      .fadeIn(delay: 1100.ms),
                  const SizedBox(height: 16),
                  ...List.generate(5, (index) {
                    return CustomCard(
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                          child: Icon(
                            Icons.notifications_outlined,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        title: Text('Événement ${index + 1}'),
                        subtitle: Text('Il y a ${index + 1} heures'),
                        trailing: Icon(
                          Icons.arrow_forward_ios,
                          size: 16,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    )
                        .animate()
                        .fadeIn(delay: (1200 + index * 100).ms)
                        .slideX(begin: 0.3, end: 0);
                  }),
                  const SizedBox(height: 24),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return CustomCard(
      child: InkWell(
        onTap: onTap,
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
}

