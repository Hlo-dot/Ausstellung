#!/usr/bin/env python3
"""Validate binary integrity of artstrip JPEGs used by the current exhibition."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STRIP_ENTRY_PATTERN = re.compile(
    r'["\']([^"\']+)["\']\s*:\s*["\']([^"\']+)["\']'
)
JPEG_SOF_MARKERS = {
    0xC0, 0xC1, 0xC2, 0xC3,
    0xC5, 0xC6, 0xC7,
    0xC9, 0xCA, 0xCB,
    0xCD, 0xCE, 0xCF,
}


def load_current_work_ids() -> set[str]:
    exhibitions = json.loads((ROOT / "exhibitions.json").read_text(encoding="utf-8"))
    return {
        work_id
        for exhibition in exhibitions
        if isinstance(exhibition, dict) and exhibition.get("current") is True
        for work_id in exhibition.get("works", [])
        if isinstance(work_id, str)
    }


def load_art_strips() -> dict[str, str]:
    text = (ROOT / "main.js").read_text(encoding="utf-8")
    match = re.search(r"const\s+ART_STRIPS\s*=\s*\{(.*?)\};", text, re.DOTALL)
    if not match:
        raise ValueError("main.js: ART_STRIPS-Objekt wurde nicht gefunden.")
    return {
        key.casefold(): value.lstrip("/")
        for key, value in STRIP_ENTRY_PATTERN.findall(match.group(1))
    }


def jpeg_dimensions(data: bytes) -> tuple[int, int]:
    if len(data) < 4:
        raise ValueError("Datei ist zu kurz.")
    if not data.startswith(b"\xff\xd8"):
        raise ValueError("SOI-Marker FF D8 fehlt.")
    if not data.endswith(b"\xff\xd9"):
        raise ValueError("EOI-Marker FF D9 fehlt; Datei ist wahrscheinlich abgeschnitten.")

    index = 2
    while index < len(data):
        if data[index] != 0xFF:
            index += 1
            continue

        while index < len(data) and data[index] == 0xFF:
            index += 1
        if index >= len(data):
            break

        marker = data[index]
        index += 1

        if marker == 0x00:
            continue
        if marker in {0xD8, 0xD9} or 0xD0 <= marker <= 0xD7:
            continue
        if marker == 0xDA:
            break
        if index + 2 > len(data):
            raise ValueError("JPEG-Segmentlänge ist abgeschnitten.")

        segment_length = int.from_bytes(data[index:index + 2], "big")
        if segment_length < 2 or index + segment_length > len(data):
            raise ValueError("Ungültige oder abgeschnittene JPEG-Segmentlänge.")

        if marker in JPEG_SOF_MARKERS:
            if segment_length < 7:
                raise ValueError("JPEG-SOF-Segment ist zu kurz.")
            height = int.from_bytes(data[index + 3:index + 5], "big")
            width = int.from_bytes(data[index + 5:index + 7], "big")
            if width <= 0 or height <= 0:
                raise ValueError(f"Ungültige Bilddimensionen {width} × {height}.")
            return width, height

        index += segment_length

    raise ValueError("Keine gültigen JPEG-Bilddimensionen gefunden.")


def main() -> int:
    errors: list[str] = []

    try:
        current_work_ids = load_current_work_ids()
        art_strips = load_art_strips()
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
        print(f"FEHLER: {exc}", file=sys.stderr)
        return 1

    checked = 0
    for work_id in sorted(current_work_ids):
        relative = art_strips.get(work_id.casefold())
        if not relative:
            errors.append(f"{work_id}: ART_STRIPS-Zuordnung fehlt.")
            continue

        path = ROOT / relative
        if path.suffix.lower() not in {".jpg", ".jpeg"}:
            errors.append(f"{work_id}: Artstrip muss JPEG sein: {relative}.")
            continue
        if not path.is_file():
            errors.append(f"{work_id}: Artstrip-Datei fehlt: {relative}.")
            continue

        try:
            data = path.read_bytes()
            width, height = jpeg_dimensions(data)
        except (OSError, ValueError) as exc:
            errors.append(f"{work_id}: beschädigter Artstrip {relative}: {exc}")
            continue

        checked += 1
        print(f"OK: {work_id}: {relative} – {width} × {height}px, {len(data)} Byte")

    if errors:
        for error in errors:
            print(f"FEHLER: {error}", file=sys.stderr)
        print(f"Ergebnis: FEHLGESCHLAGEN ({len(errors)} Artstrip-Fehler).", file=sys.stderr)
        return 1

    print(f"Ergebnis: OK – {checked} Artstrips binär geprüft.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
