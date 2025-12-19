import 'package:flutter/material.dart';
import '../../../../core/di/dependency_injection.dart';
import '../../../../core/services/trainer_service.dart';
import '../../../../core/theme/app_theme.dart';
import '../models/trainer_models.dart';

class CreateFormationScreen extends StatefulWidget {
  const CreateFormationScreen({super.key});

  @override
  State<CreateFormationScreen> createState() => _CreateFormationScreenState();
}

class _CreateFormationScreenState extends State<CreateFormationScreen> {
  final _formKey = GlobalKey<FormState>();
  final TrainerService _trainerService = getIt<TrainerService>();
  
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _categoryController = TextEditingController(); // Or dropdown
  DifficultyLevel _level = DifficultyLevel.Moyen;
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      try {
        await _trainerService.createFormation({
          'title': _titleController.text,
          'description': _descriptionController.text,
          'category': _categoryController.text.isEmpty ? 'General' : _categoryController.text,
          'level': _level.toString().split('.').last,
          'duration': 0, // Initial
          'enrolledCount': 0,
          'status': 'draft',
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Formation créée avec succès')),
          );
          Navigator.pop(context, true); // Return true to refresh list
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
          );
        }
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nouvelle Formation')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Titre de la formation',
                  hintText: 'Ex: JavaScript Avancé',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => value!.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) => value!.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<DifficultyLevel>(
                value: _level,
                decoration: const InputDecoration(
                  labelText: 'Niveau de difficulté',
                  border: OutlineInputBorder(),
                ),
                items: DifficultyLevel.values.map((level) {
                  return DropdownMenuItem(
                    value: level,
                    child: Text(level.toString().split('.').last),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _level = val!),
              ),
              const SizedBox(height: 16),
               TextFormField(
                controller: _categoryController,
                decoration: const InputDecoration(
                  labelText: 'Catégorie',
                  hintText: 'Ex: Développement Web',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: AppTheme.primaryColor,
                ),
                child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Créer la formation'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
