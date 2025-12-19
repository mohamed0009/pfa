import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_card.dart';
import '../../models/ai_models.dart';
import '../../services/ai_supervision_service.dart';

class ConfigurationTab extends StatefulWidget {
  const ConfigurationTab({super.key});

  @override
  State<ConfigurationTab> createState() => _ConfigurationTabState();
}

class _ConfigurationTabState extends State<ConfigurationTab> {
  final AISupervisionService _aiService = AISupervisionService();
  
  AIConfiguration? _config;
  bool _isLoading = true;
  bool _isEditing = false;
  bool _isSaving = false;

  // Form controllers
  String? _selectedLanguage;
  AITone? _selectedTone;
  AIDetailLevel? _selectedDetailLevel;
  double _maxResponseLength = 500;
  bool _enableQuiz = true;
  bool _enableExercise = true;
  bool _enableSummary = true;
  bool _enablePersonalization = true;

  @override
  void initState() {
    super.initState();
    _loadConfiguration();
  }

  Future<void> _loadConfiguration() async {
    final config = await _aiService.getConfiguration();
    if (mounted) {
      setState(() {
        _config = config;
        _selectedLanguage = config.language;
        _selectedTone = config.tone;
        _selectedDetailLevel = config.detailLevel;
        _maxResponseLength = config.maxResponseLength.toDouble();
        _enableQuiz = config.enableQuizGeneration;
        _enableExercise = config.enableExerciseGeneration;
        _enableSummary = config.enableSummaryGeneration;
        _enablePersonalization = config.enablePersonalization;
        _isLoading = false;
      });
    }
  }

  Future<void> _saveConfiguration() async {
    setState(() => _isSaving = true);
    
    final newConfig = AIConfiguration(
      language: _selectedLanguage!,
      tone: _selectedTone!,
      detailLevel: _selectedDetailLevel!,
      maxResponseLength: _maxResponseLength.toInt(),
      enableQuizGeneration: _enableQuiz,
      enableExerciseGeneration: _enableExercise,
      enableSummaryGeneration: _enableSummary,
      enablePersonalization: _enablePersonalization,
    );

    await _aiService.updateConfiguration(newConfig);
    
    if (mounted) {
      setState(() {
        _config = newConfig;
        _isEditing = false;
        _isSaving = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Configuration mise à jour avec succès'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    }
  }

  void _cancelEditing() {
    setState(() {
      _selectedLanguage = _config!.language;
      _selectedTone = _config!.tone;
      _selectedDetailLevel = _config!.detailLevel;
      _maxResponseLength = _config!.maxResponseLength.toDouble();
      _enableQuiz = _config!.enableQuizGeneration;
      _enableExercise = _config!.enableExerciseGeneration;
      _enableSummary = _config!.enableSummaryGeneration;
      _enablePersonalization = _config!.enablePersonalization;
      _isEditing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          CustomCard(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Paramètres du Coach IA',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Configurez le comportement et les capacités de l\'IA',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (!_isEditing)
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => setState(() => _isEditing = true),
                      color: AppTheme.primaryColor,
                    )
                  else
                    Row(
                      children: [
                        TextButton(
                          onPressed: _isSaving ? null : _cancelEditing,
                          child: const Text('Annuler'),
                        ),
                        const SizedBox(width: 8),
                       FilledButton.icon(
                          onPressed: _isSaving ? null : _saveConfiguration,
                          icon: _isSaving 
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : const Icon(Icons.save, size: 20),
                          label: const Text('Sauvegarder'),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ).animate().fadeIn(delay: 100.ms),
          
          const SizedBox(height: 16),

          // Configuration Form
          CustomCard(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Language
                  _buildDropdownField(
                    'Langue',
                    _selectedLanguage!,
                    ['Français', 'English'],
                    (value) => setState(() => _selectedLanguage = value),
                  ).animate().fadeIn(delay: 200.ms),
                  const SizedBox(height: 16),

                  // Tone
                  _buildDropdownField(
                    'Ton des Réponses',
                    _toneToString(_selectedTone!),
                    AITone.values.map(_toneToString).toList(),
                    (value) => setState(() => 
                      _selectedTone = AITone.values.firstWhere((t) => _toneToString(t) == value)),
                  ).animate().fadeIn(delay: 300.ms),
                  const SizedBox(height: 16),

                  // Detail Level
                  _buildDropdownField(
                    'Niveau de Détail',
                    _detailLevelToString(_selectedDetailLevel!),
                    AIDetailLevel.values.map(_detailLevelToString).toList(),
                    (value) => setState(() => 
                      _selectedDetailLevel = AIDetailLevel.values.firstWhere((d) => _detailLevelToString(d) == value)),
                  ).animate().fadeIn(delay: 400.ms),
                  const SizedBox(height: 16),

                  // Max Response Length
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Longueur Maximale des Réponses',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: Slider(
                              value: _maxResponseLength,
                              min: 100,
                              max: 2000,
                              divisions: 19,
                              label: '${_maxResponseLength.toInt()} caractères',
                              onChanged: _isEditing ? (value) {
                                setState(() => _maxResponseLength = value);
                              } : null,
                            ),
                          ),
                          Text(
                            '${_maxResponseLength.toInt()}',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'caractères',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondaryColor,
                        ),
                      ),
                    ],
                  ).animate().fadeIn(delay: 500.ms),
                  const SizedBox(height: 24),

                  // Toggles Section
                  Text(
                    'Fonctionnalités',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ).animate().fadeIn(delay: 600.ms),
                  const SizedBox(height: 12),

                  _buildToggleOption(
                    'Génération de Quiz',
                    _enableQuiz,
                    (value) => setState(() => _enableQuiz = value),
                    Icons.quiz,
                  ).animate().fadeIn(delay: 700.ms),
                  const Divider(height: 24),

                  _buildToggleOption(
                    'Génération d\'Exercices',
                    _enableExercise,
                    (value) => setState(() => _enableExercise = value),
                    Icons.assignment,
                  ).animate().fadeIn(delay: 800.ms),
                  const Divider(height: 24),

                  _buildToggleOption(
                    'Génération de Résumés',
                    _enableSummary,
                    (value) => setState(() => _enableSummary = value),
                    Icons.summarize,
                  ).animate().fadeIn(delay: 900.ms),
                  const Divider(height: 24),

                  _buildToggleOption(
                    'Personnalisation Avancée',
                    _enablePersonalization,
                    (value) => setState(() => _enablePersonalization = value),
                    Icons.person,
                  ).animate().fadeIn(delay: 1000.ms),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownField(
    String label,
    String value,
    List<String> options,
    Function(String?) onChanged,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          decoration: InputDecoration(
            filled: true,
            fillColor: _isEditing ? Colors.white : AppTheme.backgroundSecondaryColor,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          items: options.map((option) {
            return DropdownMenuItem(
              value: option,
              child: Text(option),
            );
          }).toList(),
          onChanged: _isEditing ? onChanged : null,
        ),
      ],
    );
  }

  Widget _buildToggleOption(
    String label,
    bool value,
    Function(bool) onChanged,
    IconData icon,
  ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: AppTheme.primaryColor, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.titleSmall,
          ),
        ),
        Switch(
          value: value,
          onChanged: _isEditing ? onChanged : null,
          activeColor: AppTheme.primaryColor,
        ),
      ],
    );
  }

  String _toneToString(AITone tone) {
    switch (tone) {
      case AITone.formal:
        return 'Formel';
      case AITone.friendly:
        return 'Amical';
      case AITone.motivating:
        return 'Motivant';
      case AITone.professional:
        return 'Professionnel';
    }
  }

  String _detailLevelToString(AIDetailLevel level) {
    switch (level) {
      case AIDetailLevel.concise:
        return 'Concis';
      case AIDetailLevel.moderate:
        return 'Modéré';
      case AIDetailLevel.detailed:
        return 'Détaillé';
    }
  }
}
