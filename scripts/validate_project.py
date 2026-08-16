#!/usr/bin/env python3
"""Validate the exhibition data and all assets needed by the live exhibition.

The validator intentionally uses only Python's standard library so it can run
locally and later in GitHub Actions without installing dependencies.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any


ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]+$")
FORMAT_PATTERN = re.compile(
    r"^\s*\d+(?:[.,]\d+)?\s*[×xX]\s*\d+(?:[.,]\d+)?(?:\s*[×xX]\s*\d+(?:[.,]\d+)?)?\s*cm\s*$"
)
STRIP_ENTRY_PATTERN = re.compile(
    r'["\']([^"\']+)["\']\s*:\s*["\']([^"\']+)["\']'
)


class Validation:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warning(self, message: str) -> None:
        self.warnings.append(message)

    def load_json_array(self, filename: str) -> list[Any]:
        path = self.root / filename
        if not path.is_file():
            self.error(f"{filename}: Datei fehlt.")
            return []
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            self.error(f"{filename}: ungültiges JSON ({exc}).")
            return []
        if not isinstance(data, list):
            self.error(f"{filename}: oberste Ebene muss eine Liste sein.")
            return []
        return data

    @staticmethod
    def is_nonempty_string(value: Any) -> bool:
        return isinstance(value, str) and bool(value.strip())

    def validate_id(self, value: Any, location: str) -> str | None:
        if not self.is_nonempty_string(value):
            self.error(f"{location}: ID fehlt oder ist leer.")
            return None
        normalized = value.strip()
        if normalized != value:
            self.error(f"{location}: ID enthält führende oder nachgestellte Leerzeichen: {value!r}.")
        if not ID_PATTERN.fullmatch(normalized):
            self.error(
                f"{location}: ID {normalized!r} enthält unzulässige Zeichen. "
                "Erlaubt sind Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich."
            )
        return normalized

    def validate_asset(self, value: Any, location: str, expected_suffix: str) -> None:
        if not self.is_nonempty_string(value):
            self.error(f"{location}: Dateipfad fehlt oder ist leer.")
            return
        relative = value.strip()
        path = Path(relative)
        if path.is_absolute() or ".." in path.parts or "://" in relative:
            self.error(f"{location}: nur ein sicherer relativer Repository-Pfad ist zulässig: {relative!r}.")
            return
        if path.suffix.lower() != expected_suffix:
            self.error(f"{location}: erwartete Dateiendung {expected_suffix}, gefunden {path.suffix or 'keine'}.")
        absolute = self.root / path
        if not absolute.is_file():
            self.error(f"{location}: referenzierte Datei fehlt: {relative}.")
        elif absolute.stat().st_size == 0:
            self.error(f"{location}: referenzierte Datei ist leer: {relative}.")

    def validate_date(self, value: Any, location: str) -> date | None:
        if not self.is_nonempty_string(value):
            self.error(f"{location}: Datum fehlt oder ist leer.")
            return None
        try:
            return date.fromisoformat(value)
        except ValueError:
            self.error(f"{location}: Datum muss dem Format JJJJ-MM-TT entsprechen: {value!r}.")
            return None

    def read_art_strips(self) -> dict[str, str]:
        path = self.root / "main.js"
        if not path.is_file():
            self.error("main.js: Datei fehlt; ART_STRIPS können nicht geprüft werden.")
            return {}
        text = path.read_text(encoding="utf-8")
        match = re.search(r"const\s+ART_STRIPS\s*=\s*\{(.*?)\};", text, re.DOTALL)
        if not match:
            self.error("main.js: ART_STRIPS-Objekt wurde nicht gefunden.")
            return {}
        result: dict[str, str] = {}
        for key, value in STRIP_ENTRY_PATTERN.findall(match.group(1)):
            lowered = key.lower()
            if lowered in result:
                self.error(f"main.js: ART_STRIPS enthält den Schlüssel {key!r} mehrfach.")
            result[lowered] = value.lstrip("/")
        return result

    def run(self) -> int:
        works_data = self.load_json_array("works.json")
        exhibitions_data = self.load_json_array("exhibitions.json")

        works: dict[str, dict[str, Any]] = {}
        work_ids_casefolded: dict[str, str] = {}

        for index, raw in enumerate(works_data, start=1):
            location = f"works.json, Eintrag {index}"
            if not isinstance(raw, dict):
                self.error(f"{location}: Eintrag muss ein Objekt sein.")
                continue
            work_id = self.validate_id(raw.get("id"), location)
            if work_id is None:
                continue
            if work_id in works:
                self.error(f"{location}: doppelte Werk-ID {work_id!r}.")
            folded = work_id.casefold()
            if folded in work_ids_casefolded and work_ids_casefolded[folded] != work_id:
                self.error(
                    f"{location}: Werk-IDs unterscheiden sich nur durch Groß-/Kleinschreibung: "
                    f"{work_ids_casefolded[folded]!r} und {work_id!r}."
                )
            work_ids_casefolded[folded] = work_id
            works[work_id] = raw

            for field, label in (("werk", "Werktitel"), ("serie", "Werkserie")):
                if not self.is_nonempty_string(raw.get(field)):
                    self.error(f"{location} ({work_id}): {label} fehlt oder ist leer.")
            self.validate_asset(raw.get("audio"), f"{location} ({work_id}), audio", ".mp3")
            self.validate_asset(raw.get("pdf"), f"{location} ({work_id}), pdf", ".pdf")

        exhibition_ids: set[str] = set()
        current_exhibitions: list[dict[str, Any]] = []
        current_work_ids: set[str] = set()

        for index, raw in enumerate(exhibitions_data, start=1):
            location = f"exhibitions.json, Eintrag {index}"
            if not isinstance(raw, dict):
                self.error(f"{location}: Eintrag muss ein Objekt sein.")
                continue
            exhibition_id = self.validate_id(raw.get("id"), location)
            if exhibition_id:
                if exhibition_id in exhibition_ids:
                    self.error(f"{location}: doppelte Ausstellungs-ID {exhibition_id!r}.")
                exhibition_ids.add(exhibition_id)
            for field, label in (("title", "Titel"), ("venue", "Ausstellungsort")):
                if not self.is_nonempty_string(raw.get(field)):
                    self.error(f"{location}: {label} fehlt oder ist leer.")
            start = self.validate_date(raw.get("start"), f"{location}, start")
            end = self.validate_date(raw.get("end"), f"{location}, end")
            if start and end and start > end:
                self.error(f"{location}: Startdatum liegt nach dem Enddatum.")
            if not isinstance(raw.get("current"), bool):
                self.error(f"{location}: current muss true oder false sein.")

            references = raw.get("works")
            if not isinstance(references, list):
                self.error(f"{location}: works muss eine Liste sein.")
                references = []
            seen_references: set[str] = set()
            for position, referenced_id in enumerate(references, start=1):
                ref_location = f"{location}, works[{position}]"
                if not self.is_nonempty_string(referenced_id):
                    self.error(f"{ref_location}: Werk-ID fehlt oder ist leer.")
                    continue
                if referenced_id in seen_references:
                    self.error(f"{ref_location}: Werk {referenced_id!r} ist in der Ausstellung doppelt enthalten.")
                seen_references.add(referenced_id)
                if referenced_id not in works:
                    case_match = work_ids_casefolded.get(referenced_id.casefold())
                    hint = f" Meinten Sie {case_match!r}?" if case_match else ""
                    self.error(f"{ref_location}: unbekannte Werk-ID {referenced_id!r}.{hint}")

            if raw.get("current") is True:
                current_exhibitions.append(raw)
                current_work_ids.update(ref for ref in references if isinstance(ref, str))

        if len(current_exhibitions) > 1:
            names = ", ".join(str(item.get("id")) for item in current_exhibitions)
            self.error(f"exhibitions.json: Mehr als eine Ausstellung ist als current=true markiert: {names}.")

        art_strips = self.read_art_strips()
        for work_id in sorted(current_work_ids):
            work = works.get(work_id)
            if not work:
                continue
            is_intro = work_id.casefold() == "tafel1"
            if not is_intro:
                value = work.get("format")
                if not self.is_nonempty_string(value):
                    self.error(f"works.json ({work_id}): Format fehlt für ein Werk der aktuellen Ausstellung.")
                elif not FORMAT_PATTERN.fullmatch(value):
                    self.error(
                        f"works.json ({work_id}): Format muss wie '80 × 60 cm' aufgebaut sein: {value!r}."
                    )
                year = work.get("jahr")
                if not isinstance(year, int) or isinstance(year, bool) or not 1900 <= year <= 2100:
                    self.error(
                        f"works.json ({work_id}): Jahr muss für ein Werk der aktuellen Ausstellung "
                        "eine vierstellige Zahl sein."
                    )

            strip = art_strips.get(work_id.casefold())
            if not strip:
                self.error(f"main.js: ART_STRIPS enthält keinen Eintrag für das aktuelle Werk {work_id!r}.")
            else:
                strip_path = self.root / strip
                if not strip_path.is_file():
                    self.error(f"main.js: Bildstreifen für {work_id!r} fehlt: {strip}.")
                elif strip_path.stat().st_size == 0:
                    self.error(f"main.js: Bildstreifen für {work_id!r} ist leer: {strip}.")

        print(f"Validiert: {len(works)} Werke, {len(exhibitions_data)} Ausstellungen, "
              f"{len(current_work_ids)} Einträge in der aktuellen Ausstellung.")
        for warning in self.warnings:
            print(f"WARNUNG: {warning}")
        for error in self.errors:
            print(f"FEHLER: {error}", file=sys.stderr)
        if self.errors:
            print(f"Ergebnis: FEHLGESCHLAGEN ({len(self.errors)} Fehler).", file=sys.stderr)
            return 1
        print("Ergebnis: OK – keine Fehler gefunden.")
        return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Werk- und Ausstellungsdaten validieren")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Repository-Wurzel (Standard: übergeordnetes Verzeichnis von scripts/)",
    )
    args = parser.parse_args()
    return Validation(args.root).run()


if __name__ == "__main__":
    raise SystemExit(main())
