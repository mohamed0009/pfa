import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:permission_handler/permission_handler.dart';
import 'logger_service.dart';

/// Service for handling audio input (speech-to-text) and output (text-to-speech)
class AudioService {
  final LoggerService logger;
  final FlutterTts _tts = FlutterTts();
  final stt.SpeechToText _speech = stt.SpeechToText();
  
  bool _isListening = false;
  bool _isSpeaking = false;
  bool _isInitialized = false;
  String _lastRecognizedText = '';

  AudioService({required this.logger}) {
    _initializeTts();
    _initializeSpeech();
  }

  /// Initialize Text-to-Speech
  Future<void> _initializeTts() async {
    try {
      await _tts.setLanguage('fr-FR'); // French language
      await _tts.setSpeechRate(0.5); // Normal speed
      await _tts.setVolume(1.0);
      await _tts.setPitch(1.0);
      
      _tts.setCompletionHandler(() {
        _isSpeaking = false;
        logger.debug('TTS completed');
      });
      
      _tts.setErrorHandler((msg) {
        _isSpeaking = false;
        logger.error('TTS error', msg);
      });
      
      logger.info('TTS initialized');
    } catch (e) {
      logger.error('Failed to initialize TTS', e);
    }
  }

  /// Initialize Speech-to-Text
  Future<void> _initializeSpeech() async {
    try {
      final available = await _speech.initialize(
        onError: (error) {
          logger.error('Speech recognition error', error.errorMsg);
          _isListening = false;
        },
        onStatus: (status) {
          logger.debug('Speech recognition status: $status');
          if (status == 'done' || status == 'notListening') {
            _isListening = false;
          }
        },
      );
      
      _isInitialized = available;
      logger.info('Speech recognition initialized: $available');
    } catch (e) {
      logger.error('Failed to initialize speech recognition', e);
      _isInitialized = false;
    }
  }

  /// Check and request microphone permission
  Future<bool> requestMicrophonePermission() async {
    try {
      final status = await Permission.microphone.request();
      if (status.isGranted) {
        logger.info('Microphone permission granted');
        return true;
      } else {
        logger.warning('Microphone permission denied');
        return false;
      }
    } catch (e) {
      logger.error('Failed to request microphone permission', e);
      return false;
    }
  }

  /// Start listening for speech input
  Future<String?> startListening({
    Function(String)? onResult,
    Function()? onDone,
  }) async {
    if (!_isInitialized) {
      await _initializeSpeech();
      if (!_isInitialized) {
        logger.error('Speech recognition not available');
        return null;
      }
    }

    if (_isListening) {
      await stopListening();
    }

    final hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return null;
    }

    try {
      _lastRecognizedText = '';
      _isListening = true;
      
      await _speech.listen(
        onResult: (result) {
          if (result.finalResult) {
            _lastRecognizedText = result.recognizedWords;
            logger.info('Speech recognized: ${result.recognizedWords}');
            onResult?.call(result.recognizedWords);
            _isListening = false;
            onDone?.call();
          } else {
            // Partial results for real-time feedback
            onResult?.call(result.recognizedWords);
          }
        },
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 3),
        localeId: 'fr_FR', // French locale
        listenMode: stt.ListenMode.confirmation,
      );
      
      logger.info('Started listening for speech');
      return null;
    } catch (e) {
      logger.error('Failed to start listening', e);
      _isListening = false;
      return null;
    }
  }

  /// Stop listening for speech
  Future<void> stopListening() async {
    if (_isListening) {
      await _speech.stop();
      _isListening = false;
      logger.info('Stopped listening for speech', null);
    }
  }

  /// Get the last recognized text
  String get lastRecognizedText => _lastRecognizedText;

  /// Check if currently listening
  bool get isListening => _isListening;

  /// Speak text using TTS
  Future<void> speak(String text) async {
    if (text.isEmpty) return;
    
    try {
      if (_isSpeaking) {
        await stopSpeaking();
      }
      
      _isSpeaking = true;
      logger.info('Speaking text: ${text.substring(0, text.length > 50 ? 50 : text.length)}...');
      
      await _tts.speak(text);
    } catch (e) {
      logger.error('Failed to speak text', e);
      _isSpeaking = false;
    }
  }

  /// Stop speaking
  Future<void> stopSpeaking() async {
    if (_isSpeaking) {
      await _tts.stop();
      _isSpeaking = false;
      logger.info('Stopped speaking', null);
    }
  }

  /// Check if currently speaking
  bool get isSpeaking => _isSpeaking;

  /// Dispose resources
  void dispose() {
    stopListening();
    stopSpeaking();
    _tts.stop();
  }
}

