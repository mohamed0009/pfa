# Running Flutter App in Android Studio

## Prerequisites
✅ Android Studio is installed (version 2025.2.2)
✅ Flutter SDK is configured
⚠️ Android emulator needs to be created

## Steps to Run in Android Studio

### 1. Open Project in Android Studio
1. Open **Android Studio**
2. Click **File → Open**
3. Navigate to: `C:\Users\HP\Desktop\pfa`
4. Select the `pfa` folder and click **OK**
5. Wait for Android Studio to sync Gradle files

### 2. Create Android Emulator (if needed)
1. In Android Studio, click **Tools → Device Manager**
2. Click **Create Device**
3. Select a device (e.g., **Pixel 5**)
4. Click **Next**
5. Select a system image (e.g., **API 33** or **API 34**)
   - If not downloaded, click **Download** next to the system image
6. Click **Next** → **Finish**

### 3. Start the Emulator
1. In **Device Manager**, click the **Play** button next to your emulator
2. Wait for the emulator to boot up

### 4. Run the App
**Option A: From Android Studio**
1. Select your emulator from the device dropdown (top toolbar)
2. Click the **Run** button (green play icon) or press `Shift + F10`
3. Wait for the app to build and install

**Option B: From Terminal**
```bash
cd C:\Users\HP\Desktop\pfa
flutter run
```

### 5. Verify Audio Permissions
When the app runs, it will request microphone permission for voice features.
- Click **Allow** when prompted

## Troubleshooting

### If Android SDK is not found:
1. Open **File → Settings** (or **Android Studio → Preferences** on Mac)
2. Go to **Appearance & Behavior → System Settings → Android SDK**
3. Check **Android SDK Location** path
4. Install missing SDK components if needed

### If Gradle sync fails:
1. Click **File → Invalidate Caches / Restart**
2. Select **Invalidate and Restart**
3. Wait for Android Studio to restart and sync

### If build fails:
```bash
cd C:\Users\HP\Desktop\pfa
flutter clean
flutter pub get
cd android
./gradlew clean
```

## App Features Ready for Android:
✅ Voice input (Speech-to-Text)
✅ Voice output (Text-to-Speech)
✅ Chat with AI Coach
✅ Admin Dashboard
✅ User Management
✅ Responsive UI for mobile

## Notes:
- The app uses `http://localhost:8080` for backend API
- For emulator, use `http://10.0.2.2:8080` instead
- Audio features require microphone permission

