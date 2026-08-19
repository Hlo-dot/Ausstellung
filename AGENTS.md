# Arbeitsanweisung – schnelle Werkpflege

Für Änderungen an der digitalen Werkbegleitung gilt standardmäßig dieses Schnellverfahren:

1. Vor dem ersten Commit einmal vollständig prüfen: Werk-ID, Titel, Serie, Format, Jahr, Audio, PDF, Artstrip und gewünschte Ausstellung.
2. Fehlende Pflichtbestandteile vorab bündeln; nicht erst nach einzelnen Validatorläufen ergänzen.
3. Alle Änderungen eines Werkes möglichst gemeinsam durchführen: `works.json`, `exhibitions.json`, `main.js` und benötigte Assets.
4. Pro Arbeitsvorgang möglichst nur einen Branch, einen Commit und einen Pull Request verwenden.
5. Nur die vorhandenen Pflichtprüfungen ausführen; keine zusätzliche Gesamtanalyse ohne konkreten Anlass.
6. Bei erfolgreicher Pflichtprüfung unmittelbar mergen.
7. Danach genau ein Production-Deployment auf Vercel abwarten.
8. Abschließend nur die tatsächlich betroffenen Live-Elemente prüfen: Direktlink, Werkdaten, Artstrip, Audio, PDF und Ausstellungszuordnung.
9. Keine anderen Werke, Dateien oder Ausstellungszuordnungen verändern, sofern dies nicht ausdrücklich beauftragt ist.
10. Mehrere vollständig vorbereitete Werke möglichst in einem gemeinsamen Lauf bearbeiten, um Prüf- und Deploymentzeiten zu reduzieren.

Ziel: minimale Prüf- und Deploymentzyklen bei unveränderter technischer Pflichtsicherheit.
