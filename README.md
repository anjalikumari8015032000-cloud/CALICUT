name: Build APK
on:
  push:
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - name: Build
        run: |
          mkdir -p www/css www/js www/lib
          cp index.html www/index.html
          cp style.css www/css/style.css
          cp game.js www/js/game.js
          curl -L -o www/lib/three.min.js https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
          npm init -y
          npm i @capacitor/core@6 @capacitor/android@6 @capacitor/cli@6
          npx cap init CALICUT com.calicut.game --web-dir=www
          npx cap add android
          sed -i 's#<activity#<activity android:screenOrientation="sensorLandscape"#' android/app/src/main/AndroidManifest.xml
          npx cap sync android
          cd android && chmod +x gradlew && ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: CALICUT-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
