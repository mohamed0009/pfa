/// Conversation model matching backend Conversation entity
class Conversation {
  final String id;
  final String title;
  final String? lastMessage;
  final DateTime? lastMessageDate;
  final int messagesCount;
  final bool isActive;
  final DateTime createdAt;

  Conversation({
    required this.id,
    required this.title,
    this.lastMessage,
    this.lastMessageDate,
    required this.messagesCount,
    required this.isActive,
    required this.createdAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Nouvelle conversation',
      lastMessage: json['lastMessage'],
      lastMessageDate: json['lastMessageDate'] != null
          ? DateTime.parse(json['lastMessageDate'])
          : null,
      messagesCount: json['messagesCount'] ?? 0,
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'lastMessage': lastMessage,
      'lastMessageDate': lastMessageDate?.toIso8601String(),
      'messagesCount': messagesCount,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  /// Create a copy with updated fields
  Conversation copyWith({
    String? id,
    String? title,
    String? lastMessage,
    DateTime? lastMessageDate,
    int? messagesCount,
    bool? isActive,
    DateTime? createdAt,
  }) {
    return Conversation(
      id: id ?? this.id,
      title: title ?? this.title,
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageDate: lastMessageDate ?? this.lastMessageDate,
      messagesCount: messagesCount ?? this.messagesCount,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  String toString() {
    return 'Conversation(id: $id, title: $title, messagesCount: $messagesCount)';
  }
}
