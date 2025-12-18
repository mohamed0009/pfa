import 'package:dio/dio.dart';
import '../models/conversation_model.dart';
import '../models/chat_message.dart';
import 'api_service.dart';
import 'logger_service.dart';
import '../errors/app_exception.dart';

/// Service to manage AI coach conversations via backend API
class ConversationService {
  final ApiService apiService;
  final LoggerService logger;

  ConversationService({
    required this.apiService,
    required this.logger,
  });

  static const String _baseEndpoint = '/api/user/chat';

  /// Get all user conversations
  Future&lt;List&lt;Conversation&gt;&gt; getConversations() async {
    try {
      logger.logApiRequest('GET', '$_baseEndpoint/conversations');
      
      final response = await apiService.get&lt;List&lt;dynamic&gt;&gt;(
        '$_baseEndpoint/conversations',
      );

      if (response == null) {
        return [];
      }

      final conversations = (response as List)
          .map((json) =&gt; Conversation.fromJson(json as Map&lt;String, dynamic&gt;))
          .toList();

      logger.logApiResponse('GET', '$_baseEndpoint/conversations', 200);
      return conversations;
    } catch (e) {
      logger.logApiError('GET', '$_baseEndpoint/conversations', e);
      rethrow;
    }
  }

  /// Create a new conversation
  Future&lt;Conversation&gt; createConversation(String title) async {
    try {
      logger.logApiRequest('POST', '$_baseEndpoint/conversations', 
          data: {'title': title});

      final response = await apiService.post&lt;Map&lt;String, dynamic&gt;&gt;(
        '$_baseEndpoint/conversations',
        data: {'title': title},
      );

      if (response == null) {
        throw ServerException('Failed to create conversation');
      }

      final conversation = Conversation.fromJson(response);
      logger.logApiResponse('POST', '$_baseEndpoint/conversations', 200);
      return conversation;
    } catch (e) {
      logger.logApiError('POST', '$_baseEndpoint/conversations', e);
      rethrow;
    }
  }

  /// Get messages for a specific conversation
  Future&lt;List&lt;ChatMessage&gt;&gt; getMessages(String conversationId) async {
    try {
      final endpoint = '$_baseEndpoint/conversations/$conversationId/messages';
      logger.logApiRequest('GET', endpoint);

      final response = await apiService.get&lt;List&lt;dynamic&gt;&gt;(endpoint);

      if (response == null) {
        return [];
      }

      final messages = (response as List)
          .map((json) =&gt; ChatMessage.fromJson(json as Map&lt;String, dynamic&gt;))
          .toList();

      logger.logApiResponse('GET', endpoint, 200);
      return messages;
    } catch (e) {
      logger.logApiError('GET', '$_baseEndpoint/conversations/$conversationId/messages', e);
      rethrow;
    }
  }

  /// Send a message to a conversation
  /// Backend automatically generates and saves AI response
  Future&lt;ChatMessage&gt; sendMessage(String conversationId, String content) async {
    try {
      final endpoint = '$_baseEndpoint/conversations/$conversationId/messages';
      logger.logApiRequest('POST', endpoint, data: {'content': content});

      final response = await apiService.post&lt;Map&lt;String, dynamic&gt;&gt;(
        endpoint,
        data: {'content': content},
      );

      if (response == null) {
        throw ServerException('Failed to send message');
      }

      final message = ChatMessage.fromJson(response);
      logger.logApiResponse('POST', endpoint, 200);
      return message;
    } catch (e) {
      logger.logApiError('POST', '$_baseEndpoint/conversations/$conversationId/messages', e);
      rethrow;
    }
  }

  /// Delete a conversation
  Future&lt;void&gt; deleteConversation(String conversationId) async {
    try {
      final endpoint = '$_baseEndpoint/conversations/$conversationId';
      logger.logApiRequest('DELETE', endpoint);

      await apiService.delete(endpoint);

      logger.logApiResponse('DELETE', endpoint, 200);
    } catch (e) {
      logger.logApiError('DELETE', '$_baseEndpoint/conversations/$conversationId', e);
      rethrow;
    }
  }
}
