import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/models/learning_module.dart';
import '../../../core/services/learning_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_card.dart';
import '../../../core/di/dependency_injection.dart';
import 'dart:ui';

class LearningModulesScreen extends StatefulWidget {
  const LearningModulesScreen({super.key});

  @override
  State<LearningModulesScreen> createState() => _LearningModulesScreenState();
}

class _LearningModulesScreenState extends State<LearningModulesScreen> {
  late final LearningService _learningService;
  List<LearningModule> _modules = [];
  bool _isLoading = true;
  String? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _learningService = getIt<LearningService>();
    _loadModules();
  }

  Future<void> _loadModules() async {
    setState(() => _isLoading = true);
    final modules = await _learningService.getModules();
    setState(() {
      _modules = modules;
      _isLoading = false;
    });
  }

  List<String> get _categories {
    final categories = _modules.map((m) => m.category ?? 'Tous').toSet().toList();
    categories.insert(0, 'Tous');
    return categories;
  }

  List<LearningModule> get _filteredModules {
    if (_selectedCategory == null || _selectedCategory == 'Tous') {
      return _modules;
    }
    return _modules.where((m) => m.category == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Gradient background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppTheme.primaryColor.withOpacity(0.08),
                  AppTheme.accentColor.withOpacity(0.05),
                  Colors.white,
                ],
              ),
            ),
          ),
          
          // Main content
          SafeArea(
            child: Column(
              children: [
                // Modern App Bar with glassmorphism
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Colors.white.withOpacity(0.9),
                        Colors.white.withOpacity(0.7),
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.arrow_back, color: Colors.white),
                                onPressed: () => Navigator.pop(context),
                              ),
                            ).animate().scale(delay: 100.ms, duration: 400.ms),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'Modules d\'Apprentissage',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.textPrimary,
                                    ),
                                  ).animate().fadeIn(delay: 200.ms),
                                  Text(
                                    '${_modules.length} modules disponibles',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ).animate().fadeIn(delay: 300.ms),
                                ],
                              ),
                            ),
                            Container(
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
                                icon: const Icon(Icons.search, color: AppTheme.primaryColor),
                                onPressed: () {},
                              ),
                            ).animate().scale(delay: 400.ms, duration: 400.ms),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                
                _isLoading
                    ? Expanded(
                        child: Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Chargement des modules...',
                                style: TextStyle(color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      )
                    : Expanded(
                        child: Column(
                          children: [
                            // Category filter
                            Container(
                              height: 60,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                itemCount: _categories.length,
                                itemBuilder: (context, index) {
                                  final category = _categories[index];
                                  final isSelected = _selectedCategory == category ||
                                      (_selectedCategory == null && index == 0);
                                  return Padding(
                                    padding: const EdgeInsets.only(right: 8),
                                    child: FilterChip(
                                      label: Text(
                                        category,
                                        style: TextStyle(
                                          color: isSelected ? Colors.white : AppTheme.primaryColor,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      selected: isSelected,
                                      onSelected: (selected) {
                                        setState(() {
                                          _selectedCategory = selected ? category : 'Tous';
                                        });
                                      },
                                      backgroundColor: Colors.white,
                                      selectedColor: AppTheme.primaryColor,
                                      checkmarkColor: Colors.white,
                                      side: BorderSide(
                                        color: isSelected ? AppTheme.primaryColor : AppTheme.borderColor,
                                        width: 1.5,
                                      ),
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    ).animate().fadeIn(delay: (index * 50).ms).scale(delay: (index * 50).ms),
                                  );
                                },
                              ),
                            ),

                            // Modules list
                            Expanded(
                              child: ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: _filteredModules.length,
                                itemBuilder: (context, index) {
                                  final module = _filteredModules[index];
                                  return _buildModuleCard(module, index);
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModuleCard(LearningModule module, int index) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: CustomCard(
        onTap: () {
          // Navigate to module details
        },
        gradient: module.isCompleted
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppTheme.successColor.withOpacity(0.1),
                  AppTheme.successColor.withOpacity(0.05),
                ],
              )
            : null,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Icon container with gradient
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: module.isCompleted
                        ? LinearGradient(
                            colors: [AppTheme.successColor, AppTheme.successColor.withOpacity(0.7)],
                          )
                        : AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: (module.isCompleted ? AppTheme.successColor : AppTheme.primaryColor)
                            .withOpacity(0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(
                    module.isCompleted ? Icons.check_circle : Icons.school_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        module.title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        module.description,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (module.isCompleted)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.successColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppTheme.successColor.withOpacity(0.3),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.verified_rounded,
                          color: AppTheme.successColor,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Terminé',
                          style: TextStyle(
                            color: AppTheme.successColor,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildInfoChip(
                  Icons.schedule_rounded,
                  '${module.estimatedDuration} min',
                  AppTheme.primaryColor,
                ),
                _buildInfoChip(
                  Icons.signal_cellular_alt_rounded,
                  'Niveau ${module.level}',
                  AppTheme.accentColor,
                ),
                if (module.category != null)
                  _buildInfoChip(
                    Icons.folder_rounded,
                    module.category!,
                    const Color(0xFF06B6D4),
                  ),
              ],
            ),
            if (module.progress! > 0) ...[
              const SizedBox(height: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Progression',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                      Text(
                        '${(module.progress! * 100).toInt()}%',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: module.progress,
                      backgroundColor: AppTheme.borderColor.withOpacity(0.3),
                      valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                      minHeight: 8,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      )
          .animate()
          .fadeIn(delay: (index * 100).ms, duration: 400.ms)
          .slideY(begin: 0.2, end: 0, duration: 400.ms),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

