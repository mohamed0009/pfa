import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/models/chat_message.dart';
import '../../../core/services/ai_coach_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_dimensions.dart';
import '../../../core/di/dependency_injection.dart';
import '../../../widgets/custom_card.dart';
import 'package:uuid/uuid.dart';
import 'dart:ui';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late final AICoachService _aiService;
  final List<ChatMessage> _messages = [];
  final _uuid = const Uuid();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _aiService = getIt<AICoachService>();
    _addWelcomeMessage();
  }

  void _addWelcomeMessage() {
    _messages.add(ChatMessage(
      id: _uuid.v4(),
      content: "Bonjour ! Je suis votre coach virtuel. Comment puis-je vous aider aujourd'hui dans votre apprentissage ?",
      type: MessageType.assistant,
      timestamp: DateTime.now(),
    ));
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty || _isLoading) return;

    final userMessage = _messageController.text.trim();
    _messageController.clear();

    // Add user message
    final userMsg = ChatMessage(
      id: _uuid.v4(),
      content: userMessage,
      type: MessageType.user,
      timestamp: DateTime.now(),
    );
    setState(() {
      _messages.add(userMsg);
      _isLoading = true;
    });

    // Scroll to bottom
    _scrollToBottom();

    // Get AI response
    try {
      final response = await _aiService.generateResponse(userMessage, null);
      final aiMsg = ChatMessage(
        id: _uuid.v4(),
        content: response,
        type: MessageType.assistant,
        timestamp: DateTime.now(),
      );
      setState(() {
        _messages.add(aiMsg);
        _isLoading = false;
      });
      _scrollToBottom();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
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
      body: Stack(
        children: [
          // Gradient background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppTheme.primaryColor.withOpacity(0.05),
                  Colors.white,
                ],
              ),
            ),
          ),

          Column(
            children: [
              // Modern App Bar with glassmorphism
              SafeArea(
                bottom: false,
                child: ClipRRect(
                  child: BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                    child: Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.white.withOpacity(0.9),
                            Colors.white.withOpacity(0.7),
                          ],
                        ),
                        border: Border(
                          bottom: BorderSide(
                            color: AppTheme.borderColor.withOpacity(0.2),
                            width: 1,
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          // AI Avatar with gradient
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryColor.withOpacity(0.3),
                                  blurRadius: 12,
                                  offset: Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Icon(
                              Icons.smart_toy_rounded,
                              color: Colors.white,
                              size: 24,
                            ),
                          )
                              .animate()
                              .scale(delay: 100.ms, duration: 600.ms),
                          
                          SizedBox(width: 16),
                          
                          // Title and status
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'AI Coach',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                                Row(
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        color: AppTheme.successColor,
                                        shape: BoxShape.circle,
                                      ),
                                    )
                                        .animate(onPlay: (controller) => controller.repeat())
                                        .fadeOut(duration: 1000.ms)
                                        .then()
                                        .fadeIn(duration: 1000.ms),
                                    SizedBox(width: 6),
                                    Text(
                                      'Online',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: AppTheme.successColor,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          )
                              .animate()
                              .fadeIn(delay: 200.ms, duration: 600.ms),

                          // More options button
                          Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 10,
                                  offset: Offset(0, 4),
                                ),
                              ],
                            ),
                            child: IconButton(
                              icon: Icon(Icons.more_vert_rounded, color: AppTheme.primaryColor),
                              onPressed: () {
                                // Show options menu
                              },
                            ),
                          )
                              .animate()
                              .fadeIn(delay: 300.ms, duration: 600.ms),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // Messages list
              Expanded(
                child: _messages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.primaryColor.withOpacity(0.3),
                                    blurRadius: 30,
                                    offset: Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Icon(
                                Icons.chat_bubble_outline_rounded,
                                size: 56,
                                color: Colors.white,
                              ),
                            )
                                .animate()
                                .scale(delay: 100.ms, duration: 800.ms, curve: Curves.elasticOut),
                            SizedBox(height: 32),
                            Text(
                              'Start a Conversation',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            )
                                .animate()
                                .fadeIn(delay: 300.ms, duration: 600.ms),
                            SizedBox(height: 12),
                            Text(
                              'Ask me anything about your learning',
                              style: TextStyle(
                                fontSize: 15,
                                color: AppTheme.textSecondary,
                              ),
                            )
                                .animate()
                                .fadeIn(delay: 400.ms, duration: 600.ms),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(20),
                        itemCount: _messages.length + (_isLoading ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == _messages.length) {
                            return _buildTypingIndicator();
                          }
                          return _buildMessage(_messages[index], index);
                        },
                      ),
              ),

              // Quick action chips
              Container(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildQuickActionChip('💡 Explain', Icons.lightbulb_rounded),
                      _buildQuickActionChip('📝 Example', Icons.explore_rounded),
                      _buildQuickActionChip('🎯 Help', Icons.help_rounded),
                      _buildQuickActionChip('📊 Summary', Icons.summarize_rounded),
                    ],
                  ),
                ),
              )
                  .animate()
                  .fadeIn(delay: 500.ms, duration: 600.ms),

              // Modern input area
              SafeArea(
                top: false,
                child: Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 20,
                        offset: Offset(0, -5),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Message input field
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppTheme.backgroundColor,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: AppTheme.borderColor.withOpacity(0.3),
                              width: 1,
                            ),
                          ),
                          child: TextField(
                            controller: _messageController,
                            decoration: InputDecoration(
                              hintText: 'Type your message...',
                              hintStyle: TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 15,
                              ),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 14,
                              ),
                            ),
                            maxLines: null,
                            textCapitalization: TextCapitalization.sentences,
                            onSubmitted: (_) => _sendMessage(),
                          ),
                        ),
                      ),
                      
                      SizedBox(width: 12),
                      
                      // Send button with gradient
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          gradient: _isLoading ? null : AppTheme.primaryGradient,
                          color: _isLoading ? AppTheme.borderColor : null,
                          shape: BoxShape.circle,
                          boxShadow: _isLoading ? [] : [
                            BoxShadow(
                              color: AppTheme.primaryColor.withOpacity(0.4),
                              blurRadius: 16,
                              offset: Offset(0, 6),
                            ),
                          ],
                        ),
                        child: IconButton(
                          icon: _isLoading
                              ? SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : Icon(Icons.send_rounded, color: Colors.white, size: 24),
                          onPressed: _isLoading ? null : _sendMessage,
                        ),
                      )
                          .animate()
                          .scale(delay: 600.ms, duration: 400.ms),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMessage(ChatMessage message, int index) {
    final isUser = message.type == MessageType.user;
    
    return Padding(
      padding: EdgeInsets.only(bottom: 20),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withOpacity(0.2),
                    blurRadius: 8,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(
                Icons.smart_toy_rounded,
                size: 22,
                color: Colors.white,
              ),
            ),
            SizedBox(width: 12),
          ],
          
          Flexible(
            child: CustomCard(
              useGlassmorphism: !isUser,
              padding: EdgeInsets.zero,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                decoration: BoxDecoration(
                  gradient: isUser ? AppTheme.primaryGradient : null,
                  color: isUser ? null : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(AppDimensions.radiusMd),
                    topRight: Radius.circular(AppDimensions.radiusMd),
                    bottomLeft: Radius.circular(isUser ? AppDimensions.radiusMd : 4),
                    bottomRight: Radius.circular(isUser ? 4 : AppDimensions.radiusMd),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: (isUser ? AppTheme.primaryColor : Colors.black).withOpacity(0.1),
                      blurRadius: 12,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      message.content,
                      style: TextStyle(
                        color: isUser ? Colors.white : AppTheme.textPrimary,
                        fontSize: 15,
                        height: 1.5,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      '${message.timestamp.hour}:${message.timestamp.minute.toString().padLeft(2, '0')}',
                      style: TextStyle(
                        color: isUser
                            ? Colors.white.withOpacity(0.8)
                            : AppTheme.textSecondary,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            )
                .animate()
                .fadeIn(delay: (index * 50).ms, duration: 400.ms)
                .slideX(
                  begin: isUser ? 0.2 : -0.2,
                  end: 0,
                  duration: 400.ms,
                  curve: Curves.easeOut,
                ),
          ),
          
          if (isUser) ...[
            SizedBox(width: 12),
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: AppTheme.accentGradient,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.secondaryColor.withOpacity(0.2),
                    blurRadius: 8,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Icon(
                Icons.person_rounded,
                size: 22,
                color: Colors.white,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: EdgeInsets.only(bottom: 20),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(0.2),
                  blurRadius: 8,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              Icons.smart_toy_rounded,
              size: 22,
              color: Colors.white,
            ),
          ),
          SizedBox(width: 12),
          CustomCard(
            useGlassmorphism: true,
            padding: EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildDot(0),
                SizedBox(width: 6),
                _buildDot(200),
                SizedBox(width: 6),
                _buildDot(400),
              ],
            ),
          )
              .animate()
              .fadeIn(duration: 400.ms),
        ],
      ),
    );
  }

  Widget _buildDot(int delay) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        shape: BoxShape.circle,
      ),
    )
        .animate(onPlay: (controller) => controller.repeat())
        .scale(
          delay: delay.ms,
          duration: 600.ms,
          begin: Offset(0.7, 0.7),
          end: Offset(1.0, 1.0),
        )
        .then()
        .scale(
          duration: 600.ms,
          begin: Offset(1.0, 1.0),
          end: Offset(0.7, 0.7),
        );
  }

  Widget _buildQuickActionChip(String label, IconData icon) {
    return Padding(
      padding: EdgeInsets.only(right: 10),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            _messageController.text = label;
            _sendMessage();
          },
          borderRadius: BorderRadius.circular(24),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: AppTheme.primaryColor.withOpacity(0.2),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: AppTheme.primaryColor,
                ),
                SizedBox(width: 8),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

