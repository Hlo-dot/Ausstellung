# Ausstellung – Minimal Setup

Dieses Paket trennt Werke und Ausstellungen:

- `works.json` – nur Werksdaten (Titel, Serie, Medienpfade).
- `exhibitions.json` – Ausstellungen inkl. Liste `works` mit den Werk-IDs.
- `werke.js` – lädt beide JSONs, sucht automatisch die passende (current) Ausstellung.
- `index.html` / `style.css` – UI.

## Deployment
- Lege deine Medien nach `/audio` und `/pdf` (Pfade in `works.json` anpassen).
- Logo-Dateiname in `index.html` bei Bedarf anpassen (`logo.jpeg`).
- Optional `vercel.json` für CORS auf Vercel nutzen.
