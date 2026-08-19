# Arbeitsanweisung – schnelle Werkpflege

Für Änderungen an der digitalen Werkbegleitung gilt standardmäßig dieses Schnellverfahren:

1. Vor dem ersten Commit einmal vollständig prüfen: Werk-ID, Titel, Serie, Format, Jahr, Audio, PDF, Artstrip und gewünschte Ausstellung.
2. Die Vorprüfung ausschließlich über den konkreten Werkdatensatz und die exakt daraus referenzierten Pfade durchführen. Keine kompletten Verzeichnis-Scans, keine allgemeine Repository-Suche und keine Prüfung anderer Werke ohne konkreten Anlass.
3. Fehlt ein Pflichtasset oder Pflichtfeld, die Vorprüfung sofort beenden und nur dieses fehlende Element ergänzen; keine weiteren Bestandsprüfungen starten.
4. Fehlende Pflichtbestandteile vorab bündeln; nicht erst nach einzelnen Validatorläufen ergänzen.
5. Alle Änderungen eines Werkes möglichst gemeinsam durchführen: `works.json`, `exhibitions.json`, `main.js` und benötigte Assets.
6. Pro Arbeitsvorgang möglichst nur einen Branch, einen Commit und einen Pull Request verwenden.
7. Nur die vorhandenen Pflichtprüfungen ausführen; keine zusätzliche Gesamtanalyse ohne konkreten Anlass.
8. Bei erfolgreicher Pflichtprüfung unmittelbar mergen.
9. Danach genau ein Production-Deployment auf Vercel abwarten.
10. Abschließend nur die tatsächlich betroffenen Live-Elemente prüfen: Direktlink, Werkdaten, Artstrip, Audio, PDF und Ausstellungszuordnung.
11. Keine anderen Werke, Dateien oder Ausstellungszuordnungen verändern, sofern dies nicht ausdrücklich beauftragt ist.
12. Mehrere vollständig vorbereitete Werke möglichst in einem gemeinsamen Lauf bearbeiten, um Prüf- und Deploymentzeiten zu reduzieren.

Ziel: minimale Prüf- und Deploymentzyklen bei unveränderter technischer Pflichtsicherheit.
