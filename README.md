
# NFC Ausstellung – Modal Fix (v2)

Dieses Paket zeigt **Audio**, **PDF** und **YouTube-Video** wie gewünscht in einem **Modal** (Overlay) – kein neues Browserfenster. Außerdem gibt es einen **Info Künstler**-Dialog.

## Dateien
- `index.html` – Buttons und Modal-Markup
- `main.js` – Logik für Modal/Medien (Autoplay im Modal nach Nutzerklick)
- `style.css` – Styles inkl. responsivem Vollbild-Viewer

## Nutzung
- Setze Quellen **pro Werk** über `data-*` Attribute:
  ```html
  <button id="btn-audio" data-audio="audio/Voice_Der_Moment_eingefroren.mp3">🎧 Audio</button>
  <button id="btn-pdf"   data-pdf="pdf/Der_Moment_eingefroren.pdf">📄 PDF anzeigen</button>
  <button id="btn-video" data-video-id="_Yg0ta6Lk9w">🎥 Meine Arbeitsweise</button>
  ```

- Alternativ globale Defaults, z. B. per Query:
  `?audio=audio/xxx.mp3&pdf=pdf/yyy.pdf&video=_Yg0ta6Lk9w`

  …oder im Head vor `main.js`:
  ```html
  <script>
    window.CURRENT_AUDIO = "audio/…mp3";
    window.CURRENT_PDF   = "pdf/…pdf";
    window.CURRENT_VIDEO = "_Yg0ta6Lk9w"; // YouTube-ID
  </script>
  ```

## Hinweise
- **Autoplay mit Ton**: Startet zuverlässig, weil der Klick auf den Button als Nutzerinteraktion gilt. Auf iOS unbedingt `playsinline` (gesetzt) – sonst Vollbild-Zwang.
- **PDF**: Wir versuchen `iframe` direkt. Falls der Browser blockt, wird ein Fallback-Link im Modal angeboten.
- **Medienstopp**: Beim Schließen werden Audio/Video gestoppt und entladen.
