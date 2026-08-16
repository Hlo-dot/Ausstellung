# FLU – Digitale Werkbegleitung

Diese Webanwendung begleitet die Werke von FLU · Ulf Obermann-Löwenstein in
Ausstellungen mit Werkdaten, Audiobeschreibungen, PDF-Texten und ergänzenden
Medien. Die statische Anwendung ist für den Aufruf über NFC-Tags und direkte
Werk-URLs ausgelegt.

## Daten und Qualitätssicherung

Die Werkdaten werden in [`works.json`](works.json), die Ausstellungen und ihre
Werkzuordnungen in [`exhibitions.json`](exhibitions.json) gepflegt. Ein lokaler
Validator prüft die Datenstruktur, Referenzen und benötigten Medien. Dieselbe
Prüfung wird bei Änderungen automatisch durch den GitHub-Workflow ausgeführt.

```bash
python3 scripts/validate_project.py
python3 -m unittest discover -s tests -v
```

## Rechte und Drittsoftware

Für Kunstwerke, Inhalte und projektspezifischen Quellcode gelten die Hinweise in
[`RIGHTS.md`](RIGHTS.md). Eingebundene Drittsoftware behält ihre jeweilige
Lizenz; die Lizenz des lokal bereitgestellten PDF.js befindet sich unter
[`vendor/pdfjs/LICENSE`](vendor/pdfjs/LICENSE).
