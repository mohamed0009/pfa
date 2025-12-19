import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_card.dart';
import '../../models/ai_models.dart';
import '../../services/ai_supervision_service.dart';

class InteractionsTab extends StatefulWidget {
  final VoidCallback? onStatsChanged;
  
  const InteractionsTab({super.key, this.onStatsChanged});

  @override
  State<InteractionsTab> createState() => _InteractionsTabState();
}

class _InteractionsTabState extends State<InteractionsTab> {
  final AISupervisionService _aiService = AISupervisionService();
  
  List<AIInteraction> _interactions = [];
  bool _isLoading = true;
  bool _showFlaggedOnly = false;

  @override
  void initState() {
    super.initState();
    _loadInteractions();
  }

  Future<void> _loadInteractions() async {
    setState(() => _isLoading = true);
    final interactions = await _aiService.getInteractions(flaggedOnly: _showFlaggedOnly);
    if (mounted) {
      setState(() {
        _interactions = interactions;
        _isLoading = false;
      });
    }
  }

  Future<void> _flagInteraction(AIInteraction interaction) async {
    final TextEditingController reasonController = TextEditingController();
    
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Signaler l\'interaction'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(
            labelText: 'Raison du signalement',
            hintText: 'Décrivez le problème...',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          FilledButton.icon(
            onPressed: () => Navigator.pop(context, true),
            icon: const Icon(Icons.flag),
            label: const Text('Signaler'),
            style: FilledButton.styleFrom(
              backgroundColor: AppTheme.errorColor,
            ),
          ),
        ],
      ),
    );

    if (result == true && reasonController.text.isNotEmpty) {
      await _aiService.flagInteraction(interaction.id, reasonController.text);
      await _loadInteractions();
      widget.onStatsChanged?.call();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Interaction signalée avec succès'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  Future<void> _unflagInteraction(AIInteraction interaction) async {
    await _aiService.unflagInteraction(interaction.id);
    await _loadInteractions();
    widget.onStatsChanged?.call();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Signalement retiré'),
          backgroundColor: AppTheme.successColor,
        ),
      );
    }
  }

  void _viewInteractionDetails(AIInteraction interaction) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildInteractionDetailsSheet(interaction),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Filter Bar
        Container(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: SegmentedButton<bool>(
                  segments: const [
                    ButtonSegment(
                      value: false,
                      label: Text('Toutes'),
                      icon: Icon(Icons.list),
                    ),
                    ButtonSegment(
                      value: true,
                      label: Text('Signalées'),
                      icon: Icon(Icons.flag),
                    ),
                  ],
                  selected: {_showFlaggedOnly},
                  onSelectionChanged: (Set<bool> selection) {
                    setState(() => _showFlaggedOnly = selection.first);
                    _loadInteractions();
                  },
                ),
              ),
            ],
          ),
        ),

        // Interactions List
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _interactions.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.inbox_outlined,
                            size: 64,
                            color: AppTheme.textSecondaryColor.withOpacity(0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _showFlaggedOnly 
                                ? 'Aucune interaction signalée'
                                : 'Aucune interaction',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: AppTheme.textSecondaryColor,
                            ),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadInteractions,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _interactions.length,
                        itemBuilder: (context, index) {
                          final interaction = _interactions[index];
                          return _buildInteractionCard(interaction, index);
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildInteractionCard(AIInteraction interaction, int index) {
    return CustomCard(
      child: InkWell(
        onTap: () => _viewInteractionDetails(interaction),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          decoration: interaction.flagged
              ? BoxDecoration(
                  border: Border.all(color: AppTheme.errorColor.withOpacity(0.3), width: 2),
                  borderRadius: BorderRadius.circular(16),
                )
              : null,
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  // User Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          interaction.userName,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          interaction.userRole,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Sentiment Badge
                  if (interaction.sentiment != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _getSentimentColor(interaction.sentiment!).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _getSentimentIcon(interaction.sentiment!),
                            size: 16,
                            color: _getSentimentColor(interaction.sentiment!),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              
              // Question
              Text(
                interaction.question,
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              
              // Footer
              Row(
                children: [
                  Icon(Icons.schedule, size: 14, color: AppTheme.textSecondaryColor),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('dd/MM/yy HH:mm').format(interaction.timestamp),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondaryColor,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.speed, size: 14, color: AppTheme.textSecondaryColor),
                  const SizedBox(width: 4),
                  Text(
                    '${interaction.responseTime}ms',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondaryColor,
                    ),
                  ),
                  const Spacer(),
                  // Actions
                  if (interaction.flagged)
                    IconButton(
                      icon: const Icon(Icons.check_circle, color: AppTheme.successColor),
                      onPressed: () => _unflagInteraction(interaction),
                      tooltip: 'Retirer le signalement',
                    )
                  else
                    IconButton(
                      icon: const Icon(Icons.flag_outlined, color: AppTheme.errorColor),
                      onPressed: () => _flagInteraction(interaction),
                      tooltip: 'Signaler',
                    ),
                ],
              ),
              
              // Flag Reason
              if (interaction.flagged && interaction.flagReason != null)
                Container(
                  margin: const EdgeInsets.only(top: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.errorColor.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.errorColor.withOpacity(0.2)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.flag, size: 16, color: AppTheme.errorColor),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          interaction.flagReason!,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.errorColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(delay: (50 * index).ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildInteractionDetailsSheet(AIInteraction interaction) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.all(24),
          child: ListView(
            controller: scrollController,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Title
              Text(
                'Détails de l\'Interaction',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              
              // User Info
              _buildDetailRow('Utilisateur', interaction.userName),
              _buildDetailRow('Rôle', interaction.userRole),
              _buildDetailRow('Catégorie', interaction.category),
              _buildDetailRow('Date', DateFormat('dd MMMM yyyy à HH:mm', 'fr_FR').format(interaction.timestamp)),
              _buildDetailRow('Temps de réponse', '${interaction.responseTime}ms'),
              
              const SizedBox(height: 24),
              
              // Question
              Text(
                'Question',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.backgroundSecondaryColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  interaction.question,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              const SizedBox(height: 24),
              
              // Response
              Text(
                'Réponse de l\'IA',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppTheme.primaryColor.withOpacity(0.2),
                  ),
                ),
                child: Text(
                  interaction.response,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              const SizedBox(height: 24),
              
              // Sentiment
              if (interaction.sentiment != null) ...[
                Text(
                  'Analyse de Sentiment',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _getSentimentColor(interaction.sentiment!).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _getSentimentIcon(interaction.sentiment!),
                        color: _getSentimentColor(interaction.sentiment!),
                        size: 32,
                      ),
                      const SizedBox(width: 12),
                      Text(
                        _getSentimentText(interaction.sentiment!),
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: _getSentimentColor(interaction.sentiment!),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
              
              // Action Buttons
              Row(
                children: [
                  if (interaction.flagged)
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () {
                          _unflagInteraction(interaction);
                          Navigator.pop(context);
                        },
                        icon: const Icon(Icons.check_circle),
                        label: const Text('Retirer le signalement'),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTheme.successColor,
                          padding: const EdgeInsets.all(16),
                        ),
                      ),
                    )
                  else
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _flagInteraction(interaction);
                        },
                        icon: const Icon(Icons.flag),
                        label: const Text('Signaler'),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppTheme.errorColor,
                          padding: const EdgeInsets.all(16),
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppTheme.textSecondaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Color _getSentimentColor(AISentiment sentiment) {
    switch (sentiment) {
      case AISentiment.positive:
        return const Color(0xFF10b981);
      case AISentiment.neutral:
        return const Color(0xFF6b7280);
      case AISentiment.negative:
        return const Color(0xFFdc2626);
    }
  }

  IconData _getSentimentIcon(AISentiment sentiment) {
    switch (sentiment) {
      case AISentiment.positive:
        return Icons.sentiment_satisfied;
      case AISentiment.neutral:
        return Icons.sentiment_neutral;
      case AISentiment.negative:
        return Icons.sentiment_dissatisfied;
    }
  }

  String _getSentimentText(AISentiment sentiment) {
    switch (sentiment) {
      case AISentiment.positive:
        return 'Positif';
      case AISentiment.neutral:
        return 'Neutre';
      case AISentiment.negative:
        return 'Négatif';
    }
  }
}
