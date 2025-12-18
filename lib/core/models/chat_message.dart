enum MessageType {
  user,
  assistant,
  system,
}

class MessageAttachment {
  final String id;
  final String type; // 'link', 'file', etc.
  final String title;
  final String url;

  MessageAttachment({
    required this.id,
    required this.type,
    required this.title,
    required this.url,
  });

  factory MessageAttachment.fromJson(Map<String, dynamic> json) {
    return MessageAttachment(
      id: json['id'] ?? '',
      type: json['type'] ?? 'link',
      title: json['title'] ?? '',
      url: json['url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'url': url,
    };
  }
}

class ChatMessage {
  final String id;
  final String content;
  final MessageType type;
  final DateTime timestamp;
  final bool isGenerating;
  final List<MessageAttachment>? attachments;

  ChatMessage({
    required this.id,
    required this.content,
    required this.type,
    required this.timestamp,
    this.isGenerating = false,
    this.attachments,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
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

    List<MessageAttachment>? attachments;
    if (json['attachments'] != null) {
      attachments = (json['attachments'] as List)
          .map((item) => MessageAttachment.fromJson(item))
          .toList();
    }

    return ChatMessage(
      id: json['id'] ?? '',
      content: json['content'] ?? '',
      type: messageType,
      timestamp: DateTime.parse(json['timestamp']),
      isGenerating: json['isGenerating'] ?? false,
      attachments: attachments,
    );
  }

  Map<String, dynamic> toJson() {
    // Convert to backend format
    String sender = type == MessageType.user ? 'USER' : 'AI';
    
    return {
      'id': id,
      'content': content,
      'sender': sender,
      'timestamp': timestamp.toIso8601String(),
      'isGenerating': isGenerating,
      if (attachments != null)
        'attachments': attachments!.map((a) => a.toJson()).toList(),
    };
  }
}
