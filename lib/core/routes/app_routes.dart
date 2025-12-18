import 'package:flutter/material.dart';
import '../../features/splash/presentation/splash_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/chat/presentation/chat_screen.dart';
import '../../features/chat/presentation/conversations_screen.dart';
import '../../features/learning/presentation/learning_modules_screen.dart';
import '../../features/dashboard/presentation/learner_dashboard.dart';

class AppRoutes {
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String conversations = '/conversations';
  static const String chat = '/chat';
  static const String learningModules = '/learning-modules';
  static const String learnerDashboard = '/learner-dashboard';

  static Route<dynamic> generateRoute(RouteSettings routeSettings) {
    switch (routeSettings.name) {
      case splash:
        return _buildRoute(const SplashScreen());
      case onboarding:
        return _buildRoute(const OnboardingScreen());
      case login:
        return _buildRoute(const LoginScreen());
      case register:
        return _buildRoute(const RegisterScreen());
      case home:
        return _buildRoute(const HomeScreen());
      case profile:
        return _buildRoute(const ProfileScreen());
      case settings:
        return _buildRoute(const SettingsScreen());
      case conversations:
        return _buildRoute(const ConversationsScreen());
      case chat:
        final conversationId = routeSettings.arguments as String?;
        return _buildRoute(ChatScreen(conversationId: conversationId));
      case learningModules:
        return _buildRoute(const LearningModulesScreen());
      case learnerDashboard:
        return _buildRoute(const LearnerDashboard());
      default:
        return _buildRoute(
          Scaffold(
            body: Center(
              child: Text('Route ${routeSettings.name} not found'),
            ),
          ),
        );
    }
  }

  static PageRoute<dynamic> _buildRoute(Widget screen) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => screen,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        const begin = Offset(1.0, 0.0);
        const end = Offset.zero;
        const curve = Curves.easeInOutCubic;

        var tween = Tween(begin: begin, end: end).chain(
          CurveTween(curve: curve),
        );

        return SlideTransition(
          position: animation.drive(tween),
          child: FadeTransition(
            opacity: animation,
            child: child,
          ),
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
}

