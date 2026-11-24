#!/usr/bin/env bash
# Buduje Claude Pocket (APK) prosto z Android SDK – bez Gradle i Android Studio.
#   bash android/build.sh                  → android/out/ClaudePocket.apk
# Ustawienia (zmienne środowiskowe):
#   ANDROID_SDK   ścieżka do SDK (domyślnie ~/Android/Sdk) – potrzebne: build-tools i platforms/android-34+
#   JAVA_HOME     JDK 17+ (domyślnie javac z PATH)
#   CP_KEYSTORE   klucz do podpisu (domyślnie ~/.config/claude-pocket/pocket.jks – tworzony przy pierwszym buildzie)
#   VER_CODE / VER_NAME   numer wersji
set -euo pipefail
W="$(cd "$(dirname "$0")" && pwd)"; O="$W/out"
SDK="${ANDROID_SDK:-$HOME/Android/Sdk}"
BT="$(ls -d "$SDK"/build-tools/* 2>/dev/null | sort -V | tail -1)"
AJ="$(ls -d "$SDK"/platforms/android-*/android.jar 2>/dev/null | sort -V | tail -1)"
[ -n "$BT" ] && [ -n "$AJ" ] || { echo "Brak Android SDK (build-tools / platforms) w $SDK"; exit 1; }
JAVAC="${JAVA_HOME:+$JAVA_HOME/bin/}javac"; KEYTOOL="${JAVA_HOME:+$JAVA_HOME/bin/}keytool"
KS="${CP_KEYSTORE:-$HOME/.config/claude-pocket/pocket.jks}"; KP="${KS%.jks}.pass"
VER_CODE=${VER_CODE:-14}; VER_NAME=${VER_NAME:-2.3}
rm -rf "$O"; mkdir -p "$O/classes" "$O/gen"
echo "== instalatory programu na komputer"
python3 "$W/../pc/build_installers.py"
echo "== zasoby"
"$BT/aapt2" compile --dir "$W/res" -o "$O/res.zip"
"$BT/aapt2" link -I "$AJ" --manifest "$W/AndroidManifest.xml" -R "$O/res.zip" -A "$W/assets" \
  --java "$O/gen" --min-sdk-version 24 --target-sdk-version 34 --version-code "$VER_CODE" --version-name "$VER_NAME" \
  -o "$O/base.apk"
echo "== kod"
"$JAVAC" --release 17 -nowarn -cp "$AJ" -d "$O/classes" "$W/src/pl/yeezus/claudepocket/MainActivity.java" $(find "$O/gen" -name '*.java')
"$BT/d8" --lib "$AJ" --min-api 24 --release --output "$O" $(find "$O/classes" -name '*.class')
cp "$O/base.apk" "$O/unsigned.apk"
(cd "$O" && zip -q -j unsigned.apk classes.dex)
"$BT/zipalign" -f -p 4 "$O/unsigned.apk" "$O/aligned.apk"
echo "== podpis"
if [ ! -f "$KS" ]; then          # klucz zostaje na stałe – kolejne wersje muszą mieć ten sam podpis
  mkdir -p "$(dirname "$KS")"; umask 077
  head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' > "$KP"
  "$KEYTOOL" -genkeypair -keystore "$KS" -storepass "$(cat "$KP")" -keypass "$(cat "$KP")" -alias pocket \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Claude Pocket" >/dev/null 2>&1
fi
export PKPASS="$(cat "$KP")"
"$BT/apksigner" sign --ks "$KS" --ks-pass env:PKPASS --key-pass env:PKPASS --ks-key-alias pocket --out "$O/ClaudePocket.apk" "$O/aligned.apk"
"$BT/apksigner" verify "$O/ClaudePocket.apk" && ls -la "$O/ClaudePocket.apk"
