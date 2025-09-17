# NFC Ausstellung – Modal Update

Dieses Paket enthält:
- **index.html** – Buttons für Audio, PDF (im pdf.js Viewer), Video (YouTube, Autoplay mit Ton), Info Künstler – alle im **Modal**.
- **main.js** – Modal-Logik inkl. Stoppen der Medien beim Schließen.
- **style.css** – Layout & Modal-Styling.

## Konfiguration (optional)
- Setze zur Laufzeit (z. B. pro Werk) folgende Variablen **vor** `main.js`:
```html
<script>
  window.CURRENT_AUDIO = "audio/Voice_Der_Moment_eingefroren.mp3";
  window.CURRENT_PDF   = "pdf/Der_Moment_eingefroren.pdf";
  window.CURRENT_VIDEO = "_Yg0ta6Lk9w"; // YouTube-ID
</script>
```
- Oder setze am Button Attribute:
```html
<button id="btn-audio" data-audio="audio/xxx.mp3">🎧 Audio</button>
<button id="btn-pdf"   data-pdf="pdf/xxx.pdf">📄 PDF anzeigen</button>
<button id="btn-video" data-video-id="XXXXXXXXXXX">🎥 Meine Arbeitsweise</button>
```

## Einspielen
Ersetze in deinem Repo die Dateien `index.html`, `main.js`, `style.css`.
