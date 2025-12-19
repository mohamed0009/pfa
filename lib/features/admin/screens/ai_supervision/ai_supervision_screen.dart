import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_card.dart';
import '../models/ai_models.dart';
import '../services/ai_supervision_service.dart';
import 'tabs/configuration_tab.dart';
import 'tabs/interactions_tab.dart';
import 'tabs/generated_content_tab.dart';
import 'tabs/knowledge_base_tab.dart';

class AISupervisionScreen extends StatefulWidget {
  const AISupervisionScreen({super.key});

  @override
  State<AISupervisionScreen> createState() => _AISupervisionScreenState();
}

class _AISupervisionScreenState extends State<AISupervisionScreen> 
    with SingleTickerProviderStateMixin {
  final AISupervisionService _aiService = AISupervisionService();
  late TabController _tabController;
  
  AIStatistics? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadStatistics();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadStatistics() async {
    final stats = await _aiService.getStatistics();
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
        title: const Text('Supervision IA'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(icon: Icon(Icons.settings), text: 'Configuration'),
            Tab(icon: Icon(Icons.forum), text: 'Interactions'),
            Tab(icon: Icon(Icons.auto_awesome), text: 'Contenu Généré'),
            Tab(icon: Icon(Icons.library_books), text: 'Base de Connaissances'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Statistics Cards
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(24.0),
              child: Center(child: CircularProgressIndicator()),
            )
          else
            _buildStatisticsSection(),
          
          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                const ConfigurationTab(),
                InteractionsTab(onStatsChanged: _loadStatistics),
                GeneratedContentTab(onStatsChanged: _loadStatistics),
                KnowledgeBaseTab(onStatsChanged: _loadStatistics),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatisticsSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Statistiques IA',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ).animate().fadeIn(delay: 100.ms),
          const SizedBox(height: 12),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 2.2,
            children: [
              _buildStatCard(
                'Total Interactions',
                '${_stats!.totalInteractions}',
                Icons.forum,
                AppTheme.primaryColor,
                200.ms,
              ),
              _buildStatCard(
                'Temps Moyen',
                '${_stats!.averageResponseTime}ms',
                Icons.speed,
                AppTheme.secondaryColor,
                300.ms,
              ),
              _buildStatCard(
                'Signalées',
                '${_stats!.flaggedInteractions}',
                Icons.flag,
                AppTheme.errorColor,
                400.ms,
              ),
              _buildStatCard(
                'Contenu Généré',
                '${_stats!.generatedContentCount.total}',
                Icons.auto_awesome,
                AppTheme.accentColor,
                500.ms,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
    Duration delay,
  ) {
    return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    value,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondaryColor,
                      fontSize: 10,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: delay).slideX(begin: -0.2, end: 0);
  }
}
