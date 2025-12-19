import 'package:flutter/material.dart';
import '../../../../core/models/learning_module.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_card.dart';
import 'quiz_screen.dart';

class LessonViewerScreen extends StatelessWidget {
  final LearningContent content;
  final String moduleTitle;

  const LessonViewerScreen({
    super.key,
    required this.content,
    required this.moduleTitle,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(moduleTitle, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal)),
            Text(content.title, style: const TextStyle(fontSize: 16)),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            if (content.type == ContentType.video)
              _buildVideoPlayer(context) // Placeholder
            else if (content.type == ContentType.text)
              _buildTextContent(context)
            else if (content.type == ContentType.quiz)
              _buildQuizStart(context),
              
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                   try {
                     // Call API
                     // final service = getIt<LearningService>();
                     // await service.updateLessonProgress(content.id, true, 60); // Mock 60s
                     
                     ScaffoldMessenger.of(context).showSnackBar(
                       const SnackBar(content: Text('Progression sauvegardée !')),
                     );
                     Navigator.pop(context);
                   } catch (e) {
                     ScaffoldMessenger.of(context).showSnackBar(
                       SnackBar(content: Text('Erreur: $e')),
                     );
                   }
                },
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('Marquer comme terminé'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.successColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.all(16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoPlayer(BuildContext context) {
    return CustomCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              color: Colors.black,
              child: const Center(
                child: Icon(Icons.play_circle_fill, size: 60, color: Colors.white),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Vidéo Placeholder: ${content.content}',
              style: const TextStyle(fontStyle: FontStyle.italic),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextContent(BuildContext context) {
    return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          content.content,
          style: const TextStyle(fontSize: 16, height: 1.5),
        ),
      ),
    );
  }

  Widget _buildQuizStart(BuildContext context) {
     return CustomCard(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Icon(Icons.quiz_outlined, size: 60, color: AppTheme.primaryColor),
            const SizedBox(height: 16),
            const Text(
              'Prêt pour le quiz ?',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Testez vos connaissances sur ce module.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => QuizScreen(quizId: content.content),
                    ),
                  );
                },
               child: const Text('Commencer le Quiz'),
            ),
          ],
        ),
      ),
    );
  }
}
