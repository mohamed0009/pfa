import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/di/dependency_injection.dart';
import '../../../../core/services/trainer_service.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_card.dart';
import '../models/trainer_models.dart';

class TrainerStudentsScreen extends StatefulWidget {
  const TrainerStudentsScreen({super.key});

  @override
  State<TrainerStudentsScreen> createState() => _TrainerStudentsScreenState();
}

class _TrainerStudentsScreenState extends State<TrainerStudentsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TrainerService _trainerService = getIt<TrainerService>();
  
  List<StudentDashboard> _allStudents = [];
  List<AtRiskStudent> _atRiskStudents = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final risks = await _trainerService.getAtRiskStudents();
      final all = await _trainerService.getStudents();
      setState(() {
        _atRiskStudents = risks;
        _allStudents = all;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        // In "Lite" mock mode, we might just show empties if backend fails
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Suivi des Apprenants'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'À Risque'),
            Tab(text: 'Tous les Apprenants'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildAtRiskList(),
                _buildAllStudentsList(),
              ],
            ),
    );
  }

  Widget _buildAtRiskList() {
    if (_atRiskStudents.isEmpty) {
      return const Center(child: Text('Aucun apprenant à risque'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _atRiskStudents.length,
      itemBuilder: (context, index) {
        final student = _atRiskStudents[index];
        return CustomCard(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: _getRiskColor(student.riskLevel).withOpacity(0.1),
                      child: Icon(Icons.person, color: _getRiskColor(student.riskLevel)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(student.studentName, style: const TextStyle(fontWeight: FontWeight.bold)),
                          Text('Risque: ${student.riskLevel.toUpperCase()}', 
                              style: TextStyle(color: _getRiskColor(student.riskLevel), fontSize: 12)),
                        ],
                      ),
                    ),
                    CircularProgressIndicator(
                      value: student.progress / 100,
                      backgroundColor: Colors.grey[200],
                      color: _getRiskColor(student.riskLevel),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  children: student.reasons.map((reason) => Chip(
                    label: Text(reason, style: const TextStyle(fontSize: 10)),
                    backgroundColor: Colors.red.withOpacity(0.05),
                    labelStyle: const TextStyle(color: Colors.red),
                    padding: EdgeInsets.zero,
                  )).toList(),
                ),
              ],
            ),
          ),
        ).animate().fadeIn(delay: (index * 100).ms).slideX();
      },
    );
  }

  Widget _buildAllStudentsList() {
    if (_allStudents.isEmpty) {
      return const Center(child: Text('Aucun apprenant inscrit'));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _allStudents.length,
      itemBuilder: (context, index) {
        final student = _allStudents[index];
        return CustomCard(
          child: ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person)),
            title: Text(student.name),
            subtitle: Text('Progression: ${(student.progress * 100).toStringAsFixed(1)}%'),
            trailing: const Icon(Icons.arrow_forward_ios, size: 16),
          ),
        ).animate().fadeIn(delay: (index * 50).ms);
      },
    );
  }

  Color _getRiskColor(String level) {
    switch (level) {
      case 'high': return AppTheme.errorColor;
      case 'medium': return AppTheme.warningColor;
      default: return AppTheme.primaryColor;
    }
  }
}
