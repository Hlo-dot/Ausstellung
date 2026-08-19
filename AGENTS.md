# Arbeitsanweisung – schnelle Werkpflege

Für Änderungen an der digitalen Werkbegleitung gilt standardmäßig dieses Schnellverfahren:

1. Vor dem ersten Commit einmal vollständig prüfen: Werk-ID, Titel, Serie, Format, Jahr, Audio, PDF, Artstrip und gewünschte Ausstellung.
2. Die Vorprüfung ausschließlich über den konkreten Werkdatensatz und die exakt daraus referenzierten Pfade durchführen. Keine kompletten Verzeichnis-Scans, keine allgemeine Repository-Suche und keine Prüfung anderer Werke ohne konkreten Anlass.
3. Fehlt ein Pflichtasset oder Pflichtfeld, die Vorprüfung sofort beenden. Keine Ersatzsuche nach alternativen Dateien, historischen Referenzen, PDFs, Blobs, anderen Dateinamen, Verzeichnissen oder externen Quellen starten.
4. Das konkret fehlende Element unmittelbar benennen und nur dieses ergänzen. Ist es nicht bereits direkt verfügbar oder vom Nutzer im aktuellen Vorgang bereitgestellt, genau dieses Element beim Nutzer anfordern und bis dahin keine weiteren technischen Prüfungen starten.
5. Fehlende Pflichtbestandteile vorab bündeln; nicht erst nach einzelnen Validatorläufen ergänzen.
6. Alle Änderungen eines Werkes möglichst gemeinsam durchführen: `works.json`, `exhibitions.json`, `main.js` und benötigte Assets.
7. Pro Arbeitsvorgang möglichst nur einen Branch, einen Commit und einen Pull Request verwenden.
8. Nur die vorhandenen Pflichtprüfungen ausführen; keine zusätzliche Gesamtanalyse ohne konkreten Anlass.
9. Bei erfolgreicher Pflichtprüfung unmittelbar mergen.
10. Danach genau ein Production-Deployment auf Vercel abwarten.
11. Abschließend nur die tatsächlich betroffenen Live-Elemente prüfen: Direktlink, Werkdaten, Artstrip, Audio, PDF und Ausstellungszuordnung.
12. Keine anderen Werke, Dateien oder Ausstellungszuordnungen verändern, sofern dies nicht ausdrücklich beauftragt ist.
13. Mehrere vollständig vorbereitete Werke möglichst in einem gemeinsamen Lauf bearbeiten, um Prüf- und Deploymentzeiten zu reduzieren.

Ziel: minimale Prüf- und Deploymentzyklen bei unveränderter technischer Pflichtsicherheit.
