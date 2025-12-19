import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/di/dependency_injection.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_card.dart';
import '../../../widgets/stat_card.dart';
import 'models/admin_models.dart';
import '../services/admin_service.dart';
import 'pages/user_management_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  final AdminService _adminService = getIt<AdminService>();
  UserStats? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    final stats = await _adminService.getUserStats();
    if (mounted) {
      setState(() {
        _stats = stats;
        _isLoading = false;
      });
    }
  }

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
                  if (_isLoading)
                     const Center(child: CircularProgressIndicator())
                  else
                    Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: StatCard(
                                title: 'Total utilisateurs',
                                value: '${_stats?.total ?? 0}',
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
                                value: '${_stats?.trainers ?? 0}',
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
                                value: '${_stats?.learners ?? 0}',
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
                                title: 'Actifs',
                                value: '${_stats?.active ?? 0}',
                                icon: Icons.check_circle_outline,
                                color: AppTheme.successColor,
                              )
                                  .animate()
                                  .fadeIn(delay: 500.ms)
                                  .slideX(begin: 0.2, end: 0),
                            ),
                          ],
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
                        () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const UserManagementScreen(),
                            ),
                          );
                        },
                      )
                          .animate()
                          .fadeIn(delay: 700.ms)
                          .scale(),
                      _buildActionCard(
                        context,
                        'Gestion contenus',
                        Icons.library_books_outlined,
                        AppTheme.secondaryColor,
                        () {
                           // TODO: Admin content management
                           ScaffoldMessenger.of(context).showSnackBar(
                             const SnackBar(content: Text('Bientôt disponible')),
                           );
                        },
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
