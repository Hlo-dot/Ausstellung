# Arbeitsanweisung – schnelle Werkpflege

Für Änderungen an der digitalen Werkbegleitung gilt standardmäßig dieses Schnellverfahren:

1. Vor dem ersten Commit einmal vollständig prüfen: Werk-ID, Titel, Serie, Format, Jahr, Audio, PDF, Artstrip und gewünschte Ausstellung.
2. Die Vorprüfung ausschließlich über den konkreten Werkdatensatz und die exakt daraus referenzierten Pfade durchführen. Keine kompletten Verzeichnis-Scans, keine allgemeine Repository-Suche und keine Prüfung anderer Werke ohne konkreten Anlass.
3. Fehlt ein Pflichtasset oder Pflichtfeld, zunächst nur prüfen, ob die dafür notwendige Quelle bereits eindeutig vorhanden und direkt technisch nutzbar ist. Keine Ersatzsuche nach alternativen Dateien, historischen Referenzen, anderen Dateinamen, Verzeichnissen oder externen Quellen starten.
4. Ist die notwendige Quelle bereits eindeutig vorhanden und direkt nutzbar, das fehlende Pflichtasset unmittelbar daraus erzeugen bzw. das Pflichtfeld ergänzen und im selben gebündelten Arbeitsvorgang fortfahren. Dies gilt insbesondere für Artstrips aus bereits vorhandenen nutzbaren Werkbildern oder Bildquellen.
5. Fehlt die notwendige Quelle oder ist sie technisch nicht direkt nutzbar, die Vorprüfung sofort beenden. Das konkret fehlende Element bzw. die konkret benötigte Quelle benennen und beim Nutzer anfordern; bis dahin keine weiteren technischen Prüfungen oder Umwege starten.
6. Fehlende Pflichtbestandteile vorab bündeln; nicht erst nach einzelnen Validatorläufen ergänzen.
7. Alle Änderungen eines Werkes möglichst gemeinsam durchführen: `works.json`, `exhibitions.json`, `main.js` und benötigte Assets.
8. Pro Arbeitsvorgang möglichst nur einen Branch, einen Commit und einen Pull Request verwenden.
9. Nur die vorhandenen Pflichtprüfungen ausführen; keine zusätzliche Gesamtanalyse ohne konkreten Anlass.
10. Bei erfolgreicher Pflichtprüfung unmittelbar mergen.
11. Danach genau ein Production-Deployment auf Vercel abwarten.
12. Abschließend nur die tatsächlich betroffenen Live-Elemente prüfen: Direktlink, Werkdaten, Artstrip, Audio, PDF und Ausstellungszuordnung.
13. Keine anderen Werke, Dateien oder Ausstellungszuordnungen verändern, sofern dies nicht ausdrücklich beauftragt ist.
14. Mehrere vollständig vorbereitete Werke möglichst in einem gemeinsamen Lauf bearbeiten, um Prüf- und Deploymentzeiten zu reduzieren.

Ziel: minimale Prüf- und Deploymentzyklen bei unveränderter technischer Pflichtsicherheit.
