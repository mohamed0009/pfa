import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/di/dependency_injection.dart';
import '../../../../core/services/trainer_service.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_card.dart';
import '../models/trainer_models.dart';
import 'create_formation_screen.dart';

class TrainerContentScreen extends StatefulWidget {
  const TrainerContentScreen({super.key});

  @override
  State<TrainerContentScreen> createState() => _TrainerContentScreenState();
}

class _TrainerContentScreenState extends State<TrainerContentScreen> {
  final TrainerService _trainerService = getIt<TrainerService>();
  bool _isLoading = true;
  List<TrainerFormation> _formations = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFormations();
  }

  Future<void> _loadFormations() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });
      final formations = await _trainerService.getFormations();
      setState(() {
        _formations = formations;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Impossible de charger les formations';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestion du contenu'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: AppTheme.errorColor),
                      const SizedBox(height: 16),
                      Text(_error!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadFormations,
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : _formations.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.library_books_outlined, size: 64, color: Colors.grey),
                          const SizedBox(height: 16),
                          const Text('Aucune formation trouvée'),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () {
                              // TODO: Navigate to create formation screen
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Création bientôt disponible')),
                              );
                            },
                            icon: const Icon(Icons.add),
                            label: const Text('Créer une formation'),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _formations.length,
                      itemBuilder: (context, index) {
                        final formation = _formations[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: CustomCard(
                            child: ListTile(
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(Icons.school, color: AppTheme.primaryColor),
                              ),
                              title: Text(
                                formation.title,
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text(
                                    formation.description ?? '',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      _buildStatusBadge(formation.status),
                                      const SizedBox(width: 8),
                                      Icon(Icons.people_outline, size: 16, color: Colors.grey[600]),
                                      const SizedBox(width: 4),
                                      Text('${formation.enrolledStudents}'),
                                    ],
                                  ),
                                ],
                              ),
                              onTap: () {
                                // TODO: Navigate to details/modules
                              },
                              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                            ),
                          ).animate().fadeIn(delay: (index * 100).ms).slideX(),
                        );
                      },
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
           final result = await Navigator.push(
             context,
             MaterialPageRoute(builder: (_) => const CreateFormationScreen()),
           );
           if (result == true) {
             _loadFormations(); // Refresh list
           }
        },
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildStatusBadge(ContentStatus status) {
    Color color;
    String label;

    switch (status) {
      case ContentStatus.draft:
        color = Colors.grey;
        label = 'Brouillon';
        break;
      case ContentStatus.pending:
        color = AppTheme.warningColor;
        label = 'En attente';
        break;
      case ContentStatus.approved:
        color = AppTheme.successColor;
        label = 'Approuvé';
        break;
      case ContentStatus.published:
        color = AppTheme.primaryColor;
        label = 'Publié';
        break;
      case ContentStatus.rejected:
        color = AppTheme.errorColor;
        label = 'Rejeté';
        break;
      case ContentStatus.archived:
        color = Colors.blueGrey;
        label = 'Archivé';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500),
      ),
    );
  }
}
