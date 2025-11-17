import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_theme.dart';
import '../../../widgets/custom_card.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _darkModeEnabled = false;
  String _selectedLanguage = 'English';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // General Settings
              Text(
                'General',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              )
                  .animate()
                  .fadeIn(delay: 100.ms),
              const SizedBox(height: 16),
              CustomCard(
                child: Column(
                  children: [
                    _buildSwitchTile(
                      'Notifications',
                      'Enable push notifications',
                      Icons.notifications_outlined,
                      _notificationsEnabled,
                      (value) {
                        setState(() {
                          _notificationsEnabled = value;
                        });
                      },
                    ),
                    const Divider(height: 1),
                    _buildSwitchTile(
                      'Dark Mode',
                      'Switch to dark theme',
                      Icons.dark_mode_outlined,
                      _darkModeEnabled,
                      (value) {
                        setState(() {
                          _darkModeEnabled = value;
                        });
                      },
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(delay: 200.ms)
                  .slideY(begin: 0.3, end: 0),
              const SizedBox(height: 32),

              // Appearance
              Text(
                'Appearance',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              )
                  .animate()
                  .fadeIn(delay: 300.ms),
              const SizedBox(height: 16),
              CustomCard(
                child: _buildListTile(
                  'Language',
                  _selectedLanguage,
                  Icons.language_outlined,
                  () {
                    _showLanguageDialog();
                  },
                ),
              )
                  .animate()
                  .fadeIn(delay: 400.ms)
                  .slideY(begin: 0.3, end: 0),
              const SizedBox(height: 32),

              // Account
              Text(
                'Account',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              )
                  .animate()
                  .fadeIn(delay: 500.ms),
              const SizedBox(height: 16),
              CustomCard(
                child: Column(
                  children: [
                    _buildListTile(
                      'Change Password',
                      '',
                      Icons.lock_outlined,
                      () {},
                    ),
                    const Divider(height: 1),
                    _buildListTile(
                      'Privacy Policy',
                      '',
                      Icons.privacy_tip_outlined,
                      () {},
                    ),
                    const Divider(height: 1),
                    _buildListTile(
                      'Terms of Service',
                      '',
                      Icons.description_outlined,
                      () {},
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(delay: 600.ms)
                  .slideY(begin: 0.3, end: 0),
              const SizedBox(height: 32),

              // About
              Text(
                'About',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              )
                  .animate()
                  .fadeIn(delay: 700.ms),
              const SizedBox(height: 16),
              CustomCard(
                child: Column(
                  children: [
                    _buildListTile(
                      'App Version',
                      '1.0.0',
                      Icons.info_outlined,
                      null,
                    ),
                    const Divider(height: 1),
                    _buildListTile(
                      'Contact Us',
                      '',
                      Icons.email_outlined,
                      () {},
                    ),
                    const Divider(height: 1),
                    _buildListTile(
                      'Rate App',
                      '',
                      Icons.star_outline,
                      () {},
                    ),
                  ],
                ),
              )
                  .animate()
                  .fadeIn(delay: 800.ms)
                  .slideY(begin: 0.3, end: 0),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSwitchTile(
    String title,
    String subtitle,
    IconData icon,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryColor),
      title: Text(title),
      subtitle: Text(subtitle, style: TextStyle(color: AppTheme.textSecondary)),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppTheme.primaryColor,
      ),
    );
  }

  Widget _buildListTile(
    String title,
    String subtitle,
    IconData icon,
    VoidCallback? onTap,
  ) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryColor),
      title: Text(title),
      subtitle: subtitle.isNotEmpty
          ? Text(
              subtitle,
              style: TextStyle(color: AppTheme.textSecondary),
            )
          : null,
      trailing: onTap != null
          ? const Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: AppTheme.textSecondary,
            )
          : null,
      onTap: onTap,
    );
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildLanguageOption('English'),
            _buildLanguageOption('French'),
            _buildLanguageOption('Spanish'),
            _buildLanguageOption('German'),
          ],
        ),
      ),
    );
  }

  Widget _buildLanguageOption(String language) {
    final isSelected = _selectedLanguage == language;
    return ListTile(
      title: Text(language),
      trailing: isSelected
          ? Icon(Icons.check, color: AppTheme.primaryColor)
          : null,
      onTap: () {
        setState(() {
          _selectedLanguage = language;
        });
        Navigator.pop(context);
      },
    );
  }
}

