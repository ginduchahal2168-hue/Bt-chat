# BlueMesh Offline Chat & P2P Android App

BlueMesh is an offline-first decentralized Bluetooth mesh chat and P2P file transfer application.

## Android APK & Native Build

This repository is configured with an automated **GitHub Actions CI/CD workflow** that automatically builds the Android APK (`.apk`) upon every push to GitHub.

### 📱 How to Download the Android APK

1. Go to your GitHub repository: `https://github.com/ginduchahal2168-hue/Bt-chat`
2. Click on the **Actions** tab at the top.
3. Click on the latest run under **Build Android APK**.
4. Scroll down to the **Artifacts** section at the bottom of the page.
5. Click **`BlueMesh-Chat-Android-APK`** to download the `app-debug.apk` file.
6. Transfer or install the `.apk` directly onto any Android device!

---

### 🛠️ Local Android Studio Development

To build and run the app directly on an Android device or emulator locally:

```bash
# 1. Install dependencies
npm install

# 2. Build web assets & sync Android project
npm run build:android

# 3. Open in Android Studio
npm run cap:open
```

In Android Studio, click **Run** (Green play icon) or **Build → Build APK(s)** to generate the APK locally.
