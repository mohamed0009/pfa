# Deployment Guide

## Prerequisites

- Flutter SDK 3.16.0 or higher
- Dart SDK 3.0.0 or higher
- Android Studio / Xcode (for mobile)
- Node.js (for web deployment tools)

## Environment Setup

### 1. Configure Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Fill in your configuration:
```env
API_BASE_URL=https://api.yourapp.com
OPENAI_API_KEY=your_api_key_here
ENV=production
DEBUG_MODE=false
ENABLE_ANALYTICS=true
```

### 2. Install Dependencies

```bash
flutter pub get
```

## Building for Production

### Android

#### Debug Build
```bash
flutter build apk --debug
```

#### Release Build (APK)
```bash
flutter build apk --release
```

#### Release Build (App Bundle - for Play Store)
```bash
flutter build appbundle --release
```

#### With Flavor
```bash
flutter build apk --release --flavor production -t lib/main_production.dart
```

**Output**: `build/app/outputs/flutter-apk/app-release.apk`

### iOS

#### Requirements
- Mac with Xcode installed
- Apple Developer account
- Code signing certificates

#### Build
```bash
flutter build ios --release
```

#### With Codesigning
```bash
flutter build ipa --release
```

**Output**: `build/ios/iphoneos/Runner.app`

### Web

#### Build for Production
```bash
flutter build web --release --web-renderer canvaskit
```

#### Build with HTML renderer (better for text-heavy apps)
```bash
flutter build web --release --web-renderer html
```

#### Build with auto renderer selection
```bash
flutter build web --release --web-renderer auto
```

**Output**: `build/web/`

## Deployment

### Android - Google Play Store

1. **Prepare Release**
   - Update version in `pubspec.yaml`
   - Update `versionCode` and `versionName` in `android/app/build.gradle`

2. **Generate Signing Key**
   ```bash
   keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

3. **Configure Signing**
   Create `android/key.properties`:
   ```properties
   storePassword=your_store_password
   keyPassword=your_key_password
   keyAlias=upload
   storeFile=../upload-keystore.jks
   ```

4. **Build App Bundle**
   ```bash
   flutter build appbundle --release
   ```

5. **Upload to Play Console**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new release
   - Upload `app-release.aab`
   - Fill in release notes
   - Submit for review

### iOS - App Store

1. **Prepare Release**
   - Update version in `pubspec.yaml`
   - Update version in `ios/Runner/Info.plist`

2. **Configure Xcode**
   - Open `ios/Runner.xcworkspace` in Xcode
   - Select signing team
   - Configure bundle identifier
   - Set deployment target

3. **Build Archive**
   ```bash
   flutter build ipa --release
   ```

4. **Upload with Transporter**
   - Open Transporter app
   - Drag and drop the `.ipa` file
   - Upload to App Store Connect

5. **Submit for Review**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - Fill in app information
   - Add screenshots
   - Submit for review

### Web - Various Platforms

#### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure `firebase.json`**
   ```json
   {
     "hosting": {
       "public": "build/web",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [{
         "source": "**",
         "destination": "/index.html"
       }]
     }
   }
   ```

4. **Deploy**
   ```bash
   flutter build web --release
   firebase deploy --only hosting
   ```

#### Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**
   ```bash
   flutter build web --release
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=build/web
   ```

#### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build and Deploy**
   ```bash
   flutter build web --release
   vercel --prod
   ```

   Select `build/web` as the output directory.

#### GitHub Pages

1. **Build**
   ```bash
   flutter build web --release --base-href "/your-repo-name/"
   ```

2. **Deploy using gh-pages**
   ```bash
   npm install -g gh-pages
   gh-pages -d build/web
   ```

Or use the GitHub Actions workflow (already configured in `.github/workflows/ci-cd.yml`).

#### Custom Server (Nginx)

1. **Build**
   ```bash
   flutter build web --release
   ```

2. **Copy files to server**
   ```bash
   scp -r build/web/* user@your-server:/var/www/html/
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourapp.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourapp.com
   ```

## CI/CD Setup

### GitHub Actions (Already Configured)

The project includes CI/CD workflows:
- `.github/workflows/ci-cd.yml` - Main pipeline
- `.github/workflows/code-quality.yml` - PR checks

Automatically runs on push/PR:
- Code analysis
- Tests
- Builds for Android, iOS, and Web
- Deploys to GitHub Pages (main branch)

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: cirrusci/flutter:stable
  script:
    - flutter pub get
    - flutter analyze
    - flutter test

build_android:
  stage: build
  image: cirrusci/flutter:stable
  script:
    - flutter build apk --release
  artifacts:
    paths:
      - build/app/outputs/flutter-apk/app-release.apk

build_web:
  stage: build
  image: cirrusci/flutter:stable
  script:
    - flutter build web --release
  artifacts:
    paths:
      - build/web

deploy_web:
  stage: deploy
  image: node:16
  script:
    - npm install -g firebase-tools
    - firebase deploy --token $FIREBASE_TOKEN
  only:
    - main
```

## Performance Optimization

### Web Performance

1. **Enable Caching**
   Add service worker caching strategies

2. **Optimize Images**
   ```bash
   # Convert to WebP
   cwebp input.png -o output.webp
   ```

3. **Enable Tree Shaking**
   Already enabled in release builds

4. **Analyze Bundle Size**
   ```bash
   flutter build web --analyze-size
   ```

### Mobile Performance

1. **Enable Code Shrinking**
   In `android/app/build.gradle`:
   ```gradle
   buildTypes {
       release {
           shrinkResources true
           minifyEnabled true
       }
   }
   ```

2. **Optimize Images**
   Use appropriate image formats and sizes

3. **Profile Performance**
   ```bash
   flutter run --profile
   ```

## Monitoring & Analytics

### Setup Sentry (Error Tracking)

1. **Add to `.env`**
   ```env
   SENTRY_DSN=your_sentry_dsn
   ```

2. **Initialize in `main.dart`**
   ```dart
   await SentryFlutter.init(
     (options) {
       options.dsn = AppConfig.sentryDsn;
     },
     appRunner: () => runApp(MyApp()),
   );
   ```

### Setup Firebase Analytics

1. **Add Firebase to projects**
   - [Android Setup](https://firebase.google.com/docs/flutter/setup?platform=android)
   - [iOS Setup](https://firebase.google.com/docs/flutter/setup?platform=ios)
   - [Web Setup](https://firebase.google.com/docs/flutter/setup?platform=web)

2. **Initialize**
   ```dart
   await Firebase.initializeApp();
   FirebaseAnalytics analytics = FirebaseAnalytics.instance;
   ```

## Troubleshooting

### Common Issues

**Build fails on Android**
```bash
cd android && ./gradlew clean
cd .. && flutter clean && flutter pub get
flutter build apk
```

**iOS build fails**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd .. && flutter clean && flutter pub get
flutter build ios
```

**Web build issues**
```bash
flutter clean
flutter pub get
flutter build web --release --verbose
```

## Security Checklist

- [ ] Remove debug code
- [ ] Secure API keys in environment variables
- [ ] Enable ProGuard/R8 (Android)
- [ ] Enable code obfuscation
- [ ] Use HTTPS only
- [ ] Validate SSL certificates
- [ ] Implement rate limiting
- [ ] Add authentication tokens expiry
- [ ] Review permissions
- [ ] Test on real devices
- [ ] Run security audit

## Post-Deployment

1. **Monitor crashes** via Sentry/Firebase Crashlytics
2. **Track analytics** via Firebase Analytics
3. **Monitor performance** via Firebase Performance
4. **Collect user feedback**
5. **Plan updates** based on metrics
6. **Keep dependencies updated**

## Version Management

### Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH+BUILD`

Example: `1.2.3+45`
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes
- BUILD: Build number

Update in `pubspec.yaml`:
```yaml
version: 1.2.3+45
```

## Useful Commands

```bash
# Clean build artifacts
flutter clean

# Get dependencies
flutter pub get

# Update dependencies
flutter pub upgrade

# Check for outdated packages
flutter pub outdated

# Analyze code
flutter analyze

# Format code
dart format .

# Run tests
flutter test

# Run with specific flavor
flutter run --flavor development -t lib/main_development.dart

# Profile app performance
flutter run --profile

# Check app size
flutter build apk --analyze-size
```

## Support

For issues or questions:
- Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- Review [README.md](./README.md)
- Open an issue on GitHub
- Contact the development team

---

**Last Updated**: November 2025
