# Quick Start Guide

## 🚀 Running the Application

1. **Install Flutter** (if not already installed)
   - Download from: https://flutter.dev/docs/get-started/install
   - Verify installation: `flutter doctor`

2. **Get Dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the App**
   ```bash
   flutter run
   ```

## 📱 Available Screens

The app includes the following screens with smooth navigation:

1. **Splash Screen** → Auto-navigates after 3 seconds
2. **Onboarding** → 3-page introduction (Skip available)
3. **Login** → Email/Password authentication
4. **Register** → Create new account
5. **Home** → Dashboard with statistics and quick actions
6. **Explore** → Browse content
7. **Favorites** → Saved items
8. **Profile** → User profile and settings
9. **Settings** → App configuration

## 🎨 Design Highlights

- **Modern UI**: Clean, professional design with consistent spacing
- **Smooth Animations**: Page transitions and micro-interactions
- **Dark Mode**: Automatic theme switching support
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Semantic widgets and proper contrast

## 🛠️ Customization

### Change Colors
Edit `lib/core/theme/app_theme.dart` to modify the color scheme.

### Add New Screens
1. Create screen in `lib/features/[feature_name]/presentation/`
2. Add route in `lib/core/routes/app_routes.dart`
3. Navigate using `Navigator.pushNamed(context, AppRoutes.yourRoute)`

### Add Assets
Place images in `assets/images/`, icons in `assets/icons/`, and animations in `assets/animations/`

## 📦 Dependencies Used

- `google_fonts` - Beautiful typography
- `flutter_animate` - Smooth animations
- `smooth_page_indicator` - Page indicators
- `provider` - State management (ready to use)

## ⚠️ Important Notes

- Currently uses mock data for authentication
- Replace with actual API calls as needed
- Add real images and assets to assets folders
- Configure backend endpoints for production

---

**Happy Coding! 🎉**

