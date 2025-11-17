enum MessageType {
  user,
  assistant,
  system,
}

class ChatMessage {
  final String id;
  final String content;
  final MessageType type;
  final DateTime timestamp;
  final bool isGenerating;

  ChatMessage({
    required this.id,
    required this.content,
    required this.type,
    required this.timestamp,
    this.isGenerating = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? '',
      content: json['content'] ?? '',
      type: MessageType.values.firstWhere(
        (e) => e.toString() == 'MessageType.${json['type']}',
        orElse: () => MessageType.user,
      ),
      timestamp: DateTime.parse(json['timestamp']),
      isGenerating: json['isGenerating'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'type': type.toString().split('.').last,
      'timestamp': timestamp.toIso8601String(),
      'isGenerating': isGenerating,
    };
  }
}

