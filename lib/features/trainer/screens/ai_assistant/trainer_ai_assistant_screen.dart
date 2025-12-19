/// Trainer AI Assistant - Chat-based teaching support
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_card.dart';

class TrainerAIAssistantScreen extends StatefulWidget {
  const TrainerAIAssistantScreen({super.key});

  @override
  State<TrainerAIAssistantScreen> createState() => _TrainerAIAssistantScreenState();
}

class _TrainerAIAssistantScreenState extends State<TrainerAIAssistantScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _addWelcomeMessage();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _addWelcomeMessage() {
    setState(() {
      _messages.add(ChatMessage(
        id: '0',
        text: 'Bonjour! Je suis votre assistant IA pour l\'enseignement. Comment puis-je vous aider aujourd\'hui?',
        isTrainer: false,
        timestamp: DateTime.now(),
        suggestions: [
          'Générer un quiz',
          'Créer un exercice',
          'Conseils pédagogiques',
          'Idées d\'activités',
        ],
      ));
    });
  }

  void _handleSend() {
    if (_messageController.text.trim().isEmpty) return;

    final message = _messageController.text.trim();
    setState(() {
      _messages.add(ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        text: message,
        isTrainer: true,
        timestamp: DateTime.now(),
      ));
      _isTyping = true;
    });

    _messageController.clear();
    _scrollToBottom();

    // Simulate AI response
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _messages.add(ChatMessage(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            text: _getAIResponse(message),
            isTrainer: false,
            timestamp: DateTime.now(),
            suggestions: _getSuggestions(message),
          ));
          _isTyping = false;
        });
        _scrollToBottom();
      }
    });
  }

  void _handleSuggestion(String suggestion) {
    _messageController.text = suggestion;
    _handleSend();
  }

  String _getAIResponse(String message) {
    final lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.contains('quiz')) {
      return '''Voici un exemple de quiz sur les bases de Python:

**Question 1 (QCM):**
Quel type de données est utilisé pour stocker du texte?
A) int
B) float
C) str ✓
D) bool

**Question 2 (Ouverte):**
Expliquez la différence entre une liste et un tuple en Python.

**Question 3 (Code):**
Complétez ce code pour afficher "Hello World":
```python
print(_____)
```

Voulez-vous que je génère plus de questions ou ajuste la difficulté?''';
    } else if (lowercaseMessage.contains('exercice')) {
      return '''Voici un exercice pratique:

**Titre:** Manipulation de listes en Python

**Objectifs:**
- Comprendre les méthodes de liste
- Pratiquer les boucles
- Manipuler des données

**Consignes:**
1. Créez une liste de 10 nombres aléatoires
2. Triez la liste
3. Calculez la moyenne
4. Trouvez le minimum et le maximum

**Critères d\'évaluation:**
- Code fonctionnel (40 pts)
- Utilisation correcte des méthodes (30 pts)
- Lisibilité du code (20 pts)
- Commentaires (10 pts)

Souhaitez-vous des variantes ou un autre sujet?''';
    } else if (lowercaseMessage.contains('conseil') || lowercaseMessage.contains('pédagogique')) {
      return '''Voici quelques conseils pédagogiques:

**Engagement des apprenants:**
- Commencez par des exemples concrets
- Utilisez des analogies du quotidien
- Posez des questions ouvertes
- Encouragez la participation

**Rétroaction efficace:**
- Soyez spécifique dans vos commentaires
- Équilibrez points forts et axes d\'amélioration
- Donnez des exemples d\'amélioration
- Fixez des objectifs clairs

**Évaluation formative:**
- Quiz rapides en début de cours
- Mini-exercices pratiques
- Discussions de groupe
- Auto-évaluation

Quel aspect souhaitez-vous approfondir?''';
    } else if (lowercaseMessage.contains('activité') || lowercaseMessage.contains('idée')) {
      return '''Idées d\'activités engageantes:

**Activité 1: Débat Technique**
Sujet: "Python vs JavaScript: Lequel choisir?"
Durée: 30 min
Format: Équipes de 4-5 personnes

**Activité 2: Code Review Collectif**
Analysez ensemble un code avec des bugs
Les apprenants proposent des corrections
Discussion sur les bonnes pratiques

**Activité 3: Mini-Projet Sprint**
1h pour créer une petite application
Présentation de 5 min par équipe
Vote du meilleur projet

**Activité 4: Quiz Interactif**
Questions projetées
Les appr enants répondent via leurs devices
Classement en temps réel

Quelle activité vous intéresse?''';
    } else {
      return '''Je comprends votre demande. Je peux vous aider avec:

✅ **Génération de contenu:**
- Quiz avec différentes difficultés
- Exercices pratiques
- Études de cas
- Projets

✅ **Support pédagogique:**
- Conseils d\'enseignement
- Techniques d\'engagement
- Stratégies d\'évaluation
- Gestion de classe

✅ **Planification:**
- Plans de cours
- Progression pédagogique
- Objectifs d\'apprentissage
- Activités interactives

Comment puis-je vous aider spécifiquement?''';
    }
  }

  List<String> _getSuggestions(String message) {
    final lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.contains('quiz')) {
      return [
        'Plus de questions',
        'Autre difficulté',
        'Autre sujet',
        'Créer un exercice',
      ];
    } else if (lowercaseMessage.contains('exercice')) {
      return [
        'Variante de l\'exercice',
        'Autre sujet',
        'Créer un quiz',
        'Critères d\'évaluation',
      ];
    } else {
      return [
        'Générer un quiz',
        'Créer un exercice',
        'Conseils pédagogiques',
        'Idées d\'activités',
      ];
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 300), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Assistant IA Formateur'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {
                _messages.clear();
                _addWelcomeMessage();
              });
            },
            tooltip: 'Nouvelle conversation',
          ),
        ],
      ),
      body: Column(
        children: [
          // Info Banner
          Container(
            padding: const EdgeInsets.all(12),
            color: AppTheme.primaryColor.withOpacity(0.1),
            child: Row(
              children: [
                Icon(Icons.lightbulb_outline, color: AppTheme.primaryColor, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'AI assistant pour vous aider à créer du contenu et améliorer votre enseignement',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 100.ms),

          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return _buildMessageBubble(_messages[index], index);
              },
            ),
          ),

          // Typing Indicator
          if (_isTyping)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              alignment: Alignment.centerLeft,
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                    child: Icon(Icons.psychology, color: AppTheme.primaryColor, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildTypingDot(0),
                        const SizedBox(width: 4),
                        _buildTypingDot(200),
                        const SizedBox(width: 4),
                        _buildTypingDot(400),
                      ],
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(),

          // Input Area
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).padding.bottom + 12,
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Posez votre question...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: AppTheme.backgroundSecondaryColor,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                    ),
                    maxLines: null,
                    textCapitalization: TextCapitalization.sentences,
                    onSubmitted: (_) => _handleSend(),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _handleSend,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message, int index) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: message.isTrainer ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!message.isTrainer) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
              child: Icon(Icons.psychology, color: AppTheme.primaryColor, size: 20),
            ),
            const SizedBox(width: 12),
          ],
          Flexible(
            child: Column(
              crossAxisAlignment: message.isTrainer 
                  ? CrossAxisAlignment.end 
                  : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: message.isTrainer 
                        ? AppTheme.primaryColor 
                        : Colors.grey[200],
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    message.text,
                    style: TextStyle(
                      color: message.isTrainer ? Colors.white : Colors.black87,
                      fontSize: 15,
                      height: 1.4,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  DateFormat('HH:mm').format(message.timestamp),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey,
                    fontSize: 11,
                  ),
                ),
                if (message.suggestions != null && message.suggestions!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: message.suggestions!.map((suggestion) {
                      return InkWell(
                        onTap: () => _handleSuggestion(suggestion),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            border: Border.all(color: AppTheme.primaryColor),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            suggestion,
                            style: TextStyle(
                              color: AppTheme.primaryColor,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ],
            ),
          ),
          if (message.isTrainer) ...[
            const SizedBox(width: 12),
            CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.primaryColor,
              child: const Icon(Icons.person, color: Colors.white, size: 20),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(delay: (50 * index).ms).slideY(begin: 0.2, end: 0);
  }

  Widget _buildTypingDot(int delay) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: Colors.grey[600],
        shape: BoxShape.circle,
      ),
    ).animate(onPlay: (controller) => controller.repeat())
        .fadeOut(delay: delay.ms, duration: 600.ms)
        .then()
        .fadeIn(duration: 600.ms);
  }
}

class ChatMessage {
  final String id;
  final  String text;
  final bool isTrainer;
  final DateTime timestamp;
  final List<String>? suggestions;

  ChatMessage({
    required this.id,
    required this.text,
    required this.isTrainer,
    required this.timestamp,
    this.suggestions,
  });
}
