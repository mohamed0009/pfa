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

  factory ChatMessage.fromJson(Map&lt;String, dynamic&gt; json) {
    // Backend uses 'sender' field with values 'USER' or 'AI'
    String senderStr = (json['sender'] ?? 'USER').toString().toUpperCase();
    MessageType messageType;
    if (senderStr == 'USER') {
      messageType = MessageType.user;
    } else if (senderStr == 'AI') {
      messageType = MessageType.assistant;
    } else {
      messageType = MessageType.user;
    }

    return ChatMessage(
      id: json['id'] ?? '',
      content: json['content'] ?? '',
      type: messageType,
      timestamp: DateTime.parse(json['timestamp']),
      isGenerating: json['isGenerating'] ?? false,
    );
  }

  Map&lt;String, dynamic&gt; toJson() {
    // Convert to backend format
    String sender = type == MessageType.user ? 'USER' : 'AI';
    
    return {
      'id': id,
      'content': content,
      'sender': sender,
      'timestamp': timestamp.toIso8601String(),
      'isGenerating': isGenerating,
    };
  }
}
