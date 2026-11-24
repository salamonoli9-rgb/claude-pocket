package pl.yeezus.claudepocket;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.InputStream;
import java.io.OutputStream;

/** Claude Pocket: cała aplikacja to strona z assets/ w WebView (limity, terminal, duszek). */
public class MainActivity extends Activity {
    private WebView web;
    private static final String PC_FILE = "claude-pocket-pc.sh";

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().setStatusBarColor(Color.parseColor("#121217"));
        getWindow().setNavigationBarColor(Color.parseColor("#14141a"));

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                    // zapamiętany komputer, duszek, ustawienia
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);     // połączenie z komputerem w sieci domowej
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);                              // układ niezależny od rozmiaru czcionki systemu
        web.setBackgroundColor(Color.parseColor("#121217"));
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new Bridge(), "CP");
        setContentView(web);

        if (saved != null) web.restoreState(saved);
        else web.loadUrl("file:///android_asset/index.html");
    }

    /** Most dla strony: zapis instalatora programu na komputer do Pobranych + wysłanie go dalej. */
    private class Bridge {
        @JavascriptInterface
        public String saveInstaller(boolean share) { return saveInstallerFor(PC_FILE, share); }

        /** file: claude-pocket-pc.sh (Linux) albo claude-pocket-windows.bat (Windows) z assets/pc/. */
        @JavascriptInterface
        public String saveInstallerFor(String file, boolean share) {
            if (!"claude-pocket-pc.sh".equals(file) && !"claude-pocket-windows.bat".equals(file)) return "err:Nieznany plik.";
            if (Build.VERSION.SDK_INT < 29) return "err:Zapis wymaga Androida 10 lub nowszego.";
            try {
                ContentResolver cr = getContentResolver();
                SharedPreferences prefs = getSharedPreferences("cp", MODE_PRIVATE);
                String key = "pcUri:" + file;
                String old = prefs.getString(key, null);
                if (old != null) { try { cr.delete(Uri.parse(old), null, null); } catch (Exception ignored) { } }

                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, file);
                v.put(MediaStore.MediaColumns.MIME_TYPE, "application/octet-stream");   // bez zmiany rozszerzenia
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, "Download/");
                v.put(MediaStore.MediaColumns.IS_PENDING, 1);
                Uri uri = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) return "err:Nie udało się utworzyć pliku w Pobranych.";
                try (InputStream in = getAssets().open("pc/" + file); OutputStream out = cr.openOutputStream(uri)) {
                    byte[] buf = new byte[16384];
                    int n;
                    while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                }
                v.clear();
                v.put(MediaStore.MediaColumns.IS_PENDING, 0);
                cr.update(uri, v, null, null);
                prefs.edit().putString(key, uri.toString()).apply();

                String name = file;
                try (android.database.Cursor c = cr.query(uri, new String[]{MediaStore.MediaColumns.DISPLAY_NAME}, null, null, null)) {
                    if (c != null && c.moveToFirst()) name = c.getString(0);
                }
                if (share) {
                    final Uri u = uri;
                    runOnUiThread(() -> {
                        Intent i = new Intent(Intent.ACTION_SEND);
                        i.setType("application/octet-stream");
                        i.putExtra(Intent.EXTRA_STREAM, u);
                        boolean win = file.endsWith(".bat");
                        i.putExtra(Intent.EXTRA_SUBJECT, "Claude Pocket – program na komputer (" + (win ? "Windows" : "Linux") + ")");
                        i.putExtra(Intent.EXTRA_TEXT, win ? "Na Windowsie: dwuklik na " + file + " – na końcu pokaże adres i kod do aplikacji."
                                : "Na Linuksie: bash " + file + " – na końcu pokaże adres i kod do aplikacji.");
                        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        startActivity(Intent.createChooser(i, "Wyślij instalator na komputer"));
                    });
                }
                return "ok:" + name;
            } catch (Exception e) {
                return "err:" + e.getMessage();
            }
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        // najpierw strona sama decyduje (np. powrót do Limitów), potem wyjście
        web.evaluateJavascript("window.cpBack && window.cpBack()", v -> {
            if (!"true".equals(v)) finish();
        });
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
