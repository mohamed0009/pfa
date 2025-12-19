import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/models/learning_module.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_card.dart';
import '../../../../core/di/dependency_injection.dart';
import '../../../../core/services/learning_service.dart';
import 'lesson_viewer_screen.dart';

class ModuleDetailsScreen extends StatelessWidget {
  final LearningModule module;

  const ModuleDetailsScreen({super.key, required this.module});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                ),
                child: Center(
                  child: Icon(Icons.school_rounded, size: 80, color: Colors.white.withOpacity(0.3)),
                ),
              ),
              title: Text(
                module.title,
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'À propos',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    module.description,
                    style: TextStyle(color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 24),
                  Row(
                     mainAxisAlignment: MainAxisAlignment.spaceAround,
                     children: [
                        _buildInfoItem(Icons.timer, '${module.estimatedDuration} min', 'Durée'),
                        _buildInfoItem(Icons.signal_cellular_alt, 'Niveau ${module.level}', 'Difficulté'),
                        _buildInfoItem(Icons.topic, '${module.topics.length} sujets', 'Contenu'),
                     ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Contenu du module',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  if (module.contents.isEmpty)
                    const Center(child: Text('Aucun contenu disponible pour le moment.'))
                  else
                    ...module.contents.asMap().entries.map((entry) {
                      final index = entry.key;
                      final content = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: CustomCard(
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                _getContentIcon(content.type),
                                color: AppTheme.primaryColor,
                              ),
                            ),
                            title: Text(content.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(content.type.toString().split('.').last.toUpperCase()),
                            trailing: const Icon(Icons.play_arrow_rounded, color: AppTheme.primaryColor),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => LessonViewerScreen(content: content, moduleTitle: module.title),
                                ),
                              );
                            },
                          ),
                        ).animate().fadeIn(delay: (index * 100).ms).slideX(),
                      );
                    }),

                  if (module.progress != null && module.progress! >= 0.5) // Mock >0.5 for testing, usually 1.0
                    Padding(
                      padding: const EdgeInsets.only(top: 24, bottom: 32),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () async {
                              final service = getIt<LearningService>();
                              try {
                                await service.downloadCertificate('Student Name', module.title);
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Certificat téléchargé !')),
                                  );
                                }
                              } catch (e) {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Erreur: $e')),
                                  );
                                }
                              }
                          },
                          icon: const Icon(Icons.workspace_premium),
                          label: const Text('Télécharger mon Certificat'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.all(16),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: AppTheme.primaryColor),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        Text(label, style: TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
      ],
    );
  }

  IconData _getContentIcon(ContentType type) {
    switch (type) {
      case ContentType.video: return Icons.play_circle_outline;
      case ContentType.quiz: return Icons.quiz_outlined;
      case ContentType.text: return Icons.article_outlined;
      default: return Icons.circle;
    }
  }
}
