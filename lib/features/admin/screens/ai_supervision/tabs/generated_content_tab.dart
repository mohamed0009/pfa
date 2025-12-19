import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_card.dart';
import '../../models/ai_models.dart';
import '../../services/ai_supervision_service.dart';

class GeneratedContentTab extends StatefulWidget {
  final VoidCallback? onStatsChanged;
  
  const GeneratedContentTab({super.key, this.onStatsChanged});

  @override
  State<GeneratedContentTab> createState() => _GeneratedContentTabState();
}

class _GeneratedContentTabState extends State<GeneratedContentTab> {
  final AISupervisionService _aiService = AISupervisionService();
  
  List<AIGeneratedContent> _content = [];
  bool _isLoading = true;
  AIContentType? _selectedType;

  @override
  void initState() {
    super.initState();
    _loadContent();
  }

  Future<void> _loadContent() async {
    setState(() => _isLoading = true);
    final content = await _aiService.getGeneratedContent(type: _selectedType);
    if (mounted) {
      setState(() {
        _content = content;
        _isLoading = false;
      });
    }
  }

  Future<void> _archiveContent(AIGeneratedContent content) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Archiver le contenu'),
        content: Text('Voulez-vous archiver "${content.courseName}" ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: AppTheme.errorColor),
            child: const Text('Archiver'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _aiService.archiveContent(content.id);
      await _loadContent();
      widget.onStatsChanged?.call();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Contenu archivé avec succès'),
            backgroundColor: AppTheme.successColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Filter Bar
        Container(
          padding: const EdgeInsets.all(16),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('Tous', null),
                const SizedBox(width: 8),
                _buildFilterChip('Quiz', AIContentType.quiz),
                const SizedBox(width: 8),
                _buildFilterChip('Exercices', AIContentType.exercise),
                const SizedBox(width: 8),
                _buildFilterChip('R

ésumés', AIContentType.summary),
              ],
            ),
          ),
        ),

        // Content Grid
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _content.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.auto_awesome_outlined,
                            size: 64,
                            color: AppTheme.textSecondaryColor.withOpacity(0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Aucun contenu généré',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppTheme.textSecondaryColor,
                            ),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadContent,
                      child: GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 0.85,
                        ),
                        itemCount: _content.length,
                        itemBuilder: (context, index) {
                          return _buildContentCard(_content[index], index);
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String label, AIContentType? type) {
    final isSelected = _selectedType == type;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() => _selectedType = selected ? type : null);
        _loadContent();
      },
      selectedColor: AppTheme.primaryColor,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppTheme.textSecondaryColor,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }

  Widget _buildContentCard(AIGeneratedContent content, int index) {
    return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Type Icon
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _getTypeColor(content.type).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _getTypeIcon(content.type),
                color: _getTypeColor(content.type),
                size: 32,
              ),
            ),
            const SizedBox(height: 12),
            
            // Type Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.backgroundSecondaryColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _getTypeLabel(content.type),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
            const SizedBox(height: 8),
            
            // Course Name
            Text(
              content.courseName,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const Spacer(),
            
            // Metadata
            Row(
              children: [
                Icon(Icons.people, size: 14, color: AppTheme.textSecondaryColor),
                const SizedBox(width: 4),
                Text(
                  '${content.usedCount}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondaryColor,
                  ),
                ),
                const SizedBox(width: 12),
                if (content.rating != null) ...[
                  const Icon(Icons.star, size: 14, color: Color(0xFFF8B900)),
                  const SizedBox(width: 4),
                  Text(
                    content.rating!.toStringAsFixed(1),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondaryColor,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 4),
            Text(
              DateFormat('dd/MM/yy').format(content.generatedAt),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textSecondaryColor,
                fontSize: 10,
              ),
            ),
            const SizedBox(height: 8),
            
            // Archive Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _archiveContent(content),
                icon: const Icon(Icons.archive, size: 16),
                label: const Text('Archiver'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.errorColor,
                  side: BorderSide(color: AppTheme.errorColor.withOpacity(0.5)),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (50 * index).ms).scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1));
  }

  Color _getTypeColor(AIContentType type) {
    switch (type) {
      case AIContentType.quiz:
        return const Color(0xFF4A90E2);
      case AIContentType.exercise:
        return const Color(0xFF2DD4A4);
      case AIContentType.summary:
        return const Color(0xFFFFB800);
    }
  }

  IconData _getTypeIcon(AIContentType type) {
    switch (type) {
      case AIContentType.quiz:
        return Icons.quiz;
      case AIContentType.exercise:
        return Icons.assignment;
      case AIContentType.summary:
        return Icons.summarize;
    }
  }

  String _getTypeLabel(AIContentType type) {
    switch (type) {
      case AIContentType.quiz:
        return 'QUIZ';
      case AIContentType.exercise:
        return 'EXERCICE';
      case AIContentType.summary:
        return 'RÉSUMÉ';
    }
  }
}
