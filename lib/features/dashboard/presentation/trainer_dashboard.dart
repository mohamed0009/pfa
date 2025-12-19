import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_card.dart';
import '../../../widgets/stat_card.dart';
import '../../learning/presentation/learning_modules_screen.dart';
import 'pages/trainer_content_screen.dart';
import 'pages/trainer_students_screen.dart';
import '../../trainer/screens/ai_assistant/trainer_ai_assistant_screen.dart';


class TrainerDashboard extends StatelessWidget {
  const TrainerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord Formateur'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
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
                  // Overview Stats
                  Text(
                    'Vue d\'ensemble des apprenants',
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
                          title: 'Apprenants',
                          value: '48',
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
                          title: 'Modules actifs',
                          value: '12',
                          icon: Icons.book_outlined,
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
                          title: 'Moyenne globale',
                          value: '82%',
                          icon: Icons.trending_up_outlined,
                          color: AppTheme.successColor,
                        )
                            .animate()
                            .fadeIn(delay: 400.ms)
                            .slideX(begin: -0.2, end: 0),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: StatCard(
                          title: 'Besoin d\'aide',
                          value: '5',
                          icon: Icons.warning_amber_outlined,
                          color: AppTheme.warningColor,
                        )
                            .animate()
                            .fadeIn(delay: 500.ms)
                            .slideX(begin: 0.2, end: 0),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Quick Actions
                  Text(
                    'Actions',
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
                        'Gérer les modules',
                        Icons.library_books_outlined,
                        AppTheme.primaryColor,
                        () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const LearningModulesScreen(),
                            ),
                          );
                        },
                      )
                          .animate()
                          .fadeIn(delay: 700.ms)
                          .scale(),
                      _buildActionCard(
                        context,
                        'Suivi des apprenants',
                        Icons.people_outlined,
                        AppTheme.secondaryColor,
                        () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const TrainerStudentsScreen(),
                            ),
                          );
                        },
                      )
                          .animate()
                          .fadeIn(delay: 800.ms)
                          .scale(),
                      _buildActionCard(
                        context,
                        'Créer du contenu',
                        Icons.add_circle_outline,
                        AppTheme.accentColor,
                        () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const TrainerContentScreen(),
                            ),
                          );
                        },
                      )
                          .animate()
                          .fadeIn(delay: 900.ms)
                          .scale(),
                      _buildActionCard(
                        context,
                        'Assistant IA',
                        Icons.psychology_outlined,
                        const Color(0xFF8B5CF6),
                        () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const TrainerAIAssistantScreen(),
                            ),
                          );
                        },
                      )
                          .animate()
                          .fadeIn(delay: 1000.ms)
                          .scale(),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // Recent Learners Activity
                  Text(
                    'Apprenants nécessitant une attention',
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
                          backgroundColor: AppTheme.warningColor.withOpacity(0.1),
                          child: Icon(
                            Icons.person,
                            color: AppTheme.warningColor,
                          ),
                        ),
                        title: Text('Apprenant ${index + 1}'),
                        subtitle: Text('Performance en baisse • Progression: ${65 - index * 5}%'),
                        trailing: IconButton(
                          icon: const Icon(Icons.arrow_forward_ios, size: 16),
                          onPressed: () {},
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

