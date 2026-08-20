# Arbeitsanweisung – schnelle Werkpflege

Für Änderungen an der digitalen Werkbegleitung gilt standardmäßig dieses Schnellverfahren:

1. Vor dem ersten Repository-Schreibvorgang einmal vollständig prüfen: Werk-ID, Titel, Serie, Format, Jahr, Audio, PDF, Artstrip und gewünschte Ausstellung.
2. Die Vorprüfung ausschließlich über den konkreten Werkdatensatz, die gewünschte Ausstellung und die exakt referenzierten Pfade durchführen. Keine kompletten Verzeichnis-Scans, keine allgemeine Repository-Suche und keine Prüfung anderer Werke ohne konkreten Anlass.
3. Fehlt ein Pflichtasset oder Pflichtfeld, nur prüfen, ob die dafür notwendige Quelle bereits eindeutig vorhanden und direkt technisch nutzbar ist. Keine Ersatzsuche nach alternativen Dateien, historischen Referenzen, anderen Dateinamen, Verzeichnissen oder externen Quellen starten.
4. Ist die notwendige Quelle eindeutig vorhanden und direkt nutzbar, das fehlende Pflichtasset vor jedem GitHub-Schreibvorgang daraus erzeugen bzw. das Pflichtfeld vorbereiten. Fehlt die Quelle oder ist sie technisch nicht direkt nutzbar, sofort stoppen und genau die fehlende Quelle beim Nutzer anfordern.
5. Für eine exakt referenzierte PDF oder andere Binärquelle gilt ein Ein-Versuch-Prinzip: genau einen direkten Zugriff über den vorgesehenen GitHub-Zugriff durchführen. Scheitert dieser Zugriff oder ist der Inhalt damit technisch nicht auswertbar, sofort stoppen. Kein Wechsel zu `raw.githubusercontent.com`, Websuche, alternativen Hosts, historischen Kopien, Blob-Umwegen oder anderen Ersatzpfaden.
6. Bei Repository-, Werkdaten-, PDF- und Artstrip-Arbeiten ist jede externe Websuche grundsätzlich verboten. `web.run`, Suchmaschinen und externe Domains dürfen nur verwendet werden, wenn der Nutzer dies für den konkreten Auftrag ausdrücklich verlangt. Scheitert der Zugriff auf eine interne Quelle, sofort stoppen; keine externe Ersatzsuche oder Ausweichrecherche starten.
7. Vor dem ersten Commit müssen sämtliche Änderungen des Arbeitsvorgangs vollständig vorbereitet sein: `works.json`, `exhibitions.json`, `main.js` und alle benötigten Assets. Während einer Werkfreischaltung dürfen keine inhaltlichen Zwischen-Commits erzeugt werden.
8. Für Werkfreischaltungen mit mehreren betroffenen Dateien keine Folge von `update_file`-/`create_file`-Commits verwenden. Stattdessen alle Text- und Binärdateien als Git-Blobs vorbereiten, daraus einen gemeinsamen Git-Tree erstellen und exakt einen Inhalts-Commit auf den Arbeits-Branch schreiben.
9. Binärassets vor dem Commit lokal prüfen. Für JPEG-Artstrips gilt mindestens: als JPEG dekodierbar, SOI/EOI vorhanden, positive Bilddimensionen und plausibler Bildinhalt.
10. Bei jedem Binär-Upload vor dem Commit den erwarteten Git-Blob-SHA-1 lokal aus den Originalbytes berechnen (`sha1(b"blob " + str(len(data)).encode() + b"\0" + data)`) und mit dem von GitHub nach `create_blob` zurückgegebenen SHA vergleichen. Bei Abweichung sofort stoppen; den Blob nicht in einen Tree oder Commit übernehmen.
11. Pro Arbeitsvorgang grundsätzlich einen Branch, einen Inhalts-Commit und einen Pull Request verwenden. Eine Abweichung ist nur zulässig, wenn ein externer Pflichtcheck einen zuvor nicht erkennbaren Fehler meldet; der Grund ist dann ausdrücklich zu benennen.
12. Nur die vorhandenen Pflichtprüfungen ausführen; keine zusätzliche Gesamtanalyse ohne konkreten Anlass.
13. Bei erfolgreicher Pflichtprüfung unmittelbar mergen und danach genau ein Production-Deployment auf Vercel abwarten.
14. `Fertig` darf erst gemeldet werden, wenn die tatsächlich betroffenen Live-Elemente geprüft sind. Bei neuem oder geändertem Artstrip muss die Production-Datei von der stabilen Vercel-Domain erneut heruntergeladen, lokal als Bild dekodiert und gegen die vorbereitete Quelldatei geprüft werden. HTTP 200 oder `Content-Type: image/jpeg` allein gelten nicht als erfolgreicher Bildtest.
15. Keine anderen Werke, Dateien oder Ausstellungszuordnungen verändern, sofern dies nicht ausdrücklich beauftragt ist.
16. Mehrere vollständig vorbereitete Werke möglichst in einem gemeinsamen Lauf bearbeiten, um Prüf- und Deploymentzeiten zu reduzieren.

Ziel: minimale Prüf- und Deploymentzyklen bei technisch erzwungener Integrität und einer belastbaren Live-Prüfung vor der Fertigmeldung.
