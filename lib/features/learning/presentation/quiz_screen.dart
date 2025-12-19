import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/di/dependency_injection.dart';
import '../../../../core/models/quiz_model.dart';
import '../../../../core/services/learning_service.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../widgets/custom_button.dart';

class QuizScreen extends StatefulWidget {
  final String quizId;

  const QuizScreen({super.key, required this.quizId});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  final PageController _pageController = PageController();
  final LearningService _learningService = getIt<LearningService>();
  
  Quiz? _quiz;
  bool _isLoading = true;
  int _currentQuestionIndex = 0;
  final Map<String, int> _answers = {}; // questionId -> optionIndex
  String? _attemptId;
  bool _isSubmitting = false;
  double? _score;

  @override
  void initState() {
    super.initState();
    _loadQuiz();
  }

  Future<void> _loadQuiz() async {
    try {
      final quiz = await _learningService.getQuiz(widget.quizId);
      final attemptId = await _learningService.startQuizAttempt(widget.quizId);
      if (mounted) {
        setState(() {
          _quiz = quiz;
          _attemptId = attemptId;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur lors du chargement: $e')),
        );
        Navigator.pop(context);
      }
    }
  }

  Future<void> _submitQuiz() async {
    if (_quiz == null || _attemptId == null) return;

    setState(() => _isSubmitting = true);

    try {
      // Prepare payload
      final List<Map<String, dynamic>> payload = _answers.entries.map((e) {
         final question = _quiz!.questions.firstWhere((q) => q.id == e.key);
         final selectedOption = question.options[e.value];
         return {
           'questionId': e.key,
           'userAnswer': selectedOption
         };
      }).toList();

      final score = await _learningService.submitQuizAttempt(_attemptId!, payload);

      if (mounted) {
        setState(() {
          _score = score;
          _isSubmitting = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur lors de la soumission: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_score != null) {
      return _buildResultScreen();
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_quiz?.title ?? 'Quiz'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppTheme.textPrimary,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            value: (_currentQuestionIndex + 1) / (_quiz?.questions.length ?? 1),
            backgroundColor: Colors.grey[200],
            valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _quiz?.questions.length ?? 0,
                itemBuilder: (context, index) {
                  return _buildQuestionCard(_quiz!.questions[index]);
                },
              ),
            ),
            _buildBottomBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionCard(Question question) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Question ${_currentQuestionIndex + 1}/${_quiz?.questions.length}',
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            question.question,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 32),
          Expanded(
            child: ListView.separated(
              itemCount: question.options.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final isSelected = _answers[question.id] == index;
                return InkWell(
                  onTap: () {
                    setState(() {
                      _answers[question.id] = index;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.primaryColor.withOpacity(0.1) : Colors.white,
                      border: Border.all(
                        color: isSelected ? AppTheme.primaryColor : Colors.grey[300]!,
                        width: isSelected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isSelected ? AppTheme.primaryColor : Colors.grey[400]!,
                              width: 2,
                            ),
                          ),
                          child: isSelected
                              ? const Center(
                                  child: Icon(Icons.circle, size: 14, color: AppTheme.primaryColor),
                                )
                              : null,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            question.options[index],
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                              color: isSelected ? AppTheme.primaryColor : AppTheme.textPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    final isLastQuestion = _currentQuestionIndex == (_quiz?.questions.length ?? 0) - 1;
    final hasAnswer = _answers.containsKey(_quiz?.questions[_currentQuestionIndex].id);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Row(
        children: [
          if (_currentQuestionIndex > 0)
            Expanded(
              child: CustomButton(
                text: 'Précédent',
                onPressed: () {
                  _pageController.previousPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                  setState(() => _currentQuestionIndex--);
                },
                isOutlined: true,
              ),
            ),
          if (_currentQuestionIndex > 0) const SizedBox(width: 16),
          Expanded(
            child: CustomButton(
              text: isLastQuestion ? 'Terminer' : 'Suivant',
              onPressed: hasAnswer
                  ? () {
                      if (isLastQuestion) {
                        _submitQuiz();
                      } else {
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                        setState(() => _currentQuestionIndex++);
                      }
                    }
                  : () {}, // Disable if no answer
              backgroundColor: hasAnswer ? AppTheme.primaryColor : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultScreen() {
    final passed = _score! >= 70;
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                passed ? Icons.emoji_events : Icons.sentiment_dissatisfied,
                size: 80,
                color: passed ? Colors.amber : Colors.grey,
              ).animate().scale(duration: 500.ms).then().shake(),
              const SizedBox(height: 24),
              Text(
                passed ? 'Félicitations !' : 'Essayez encore',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Votre score : ${_score!.toStringAsFixed(0)}%',
                style: const TextStyle(
                  fontSize: 20,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 48),
              CustomButton(
                text: 'Retour au Module',
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
