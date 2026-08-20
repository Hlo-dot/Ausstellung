#!/usr/bin/env python3
"""Build a deterministic horizontal artwork strip from the largest image in a work PDF."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from pathlib import Path

from PIL import Image


def clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def extract_largest_image(pdf_path: Path, tmpdir: Path) -> Image.Image:
    prefix = tmpdir / "image"
    subprocess.run(
        ["pdfimages", "-png", str(pdf_path), str(prefix)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )

    candidates = sorted(tmpdir.glob("image-*.png"))
    if not candidates:
        raise RuntimeError(f"Keine eingebettete Bilddatei in {pdf_path} gefunden.")

    best_path: Path | None = None
    best_area = -1
    for path in candidates:
        with Image.open(path) as image:
            area = image.width * image.height
        if area > best_area:
            best_path = path
            best_area = area

    if best_path is None:
        raise RuntimeError(f"Keine nutzbare Bilddatei in {pdf_path} gefunden.")

    with Image.open(best_path) as image:
        return image.convert("RGB")


def crop_to_ratio(image: Image.Image, target_ratio: float, focus_x: float, focus_y: float) -> Image.Image:
    width, height = image.size
    source_ratio = width / height

    if source_ratio > target_ratio:
        crop_width = round(height * target_ratio)
        center_x = round(width * focus_x)
        left = clamp(center_x - crop_width // 2, 0, width - crop_width)
        return image.crop((left, 0, left + crop_width, height))

    crop_height = round(width / target_ratio)
    center_y = round(height * focus_y)
    top = clamp(center_y - crop_height // 2, 0, height - crop_height)
    return image.crop((0, top, width, top + crop_height))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--width", type=int, default=1200)
    parser.add_argument("--height", type=int, default=160)
    parser.add_argument("--focus-x", type=float, default=0.5)
    parser.add_argument("--focus-y", type=float, default=0.5)
    args = parser.parse_args()

    if not args.pdf.is_file():
        raise SystemExit(f"PDF fehlt: {args.pdf}")
    if args.width <= 0 or args.height <= 0:
        raise SystemExit("Breite und Höhe müssen größer als 0 sein.")
    if not 0 <= args.focus_x <= 1 or not 0 <= args.focus_y <= 1:
        raise SystemExit("focus-x und focus-y müssen zwischen 0 und 1 liegen.")

    target_ratio = args.width / args.height
    with tempfile.TemporaryDirectory(prefix="artstrip-") as tmp:
        image = extract_largest_image(args.pdf, Path(tmp))
        cropped = crop_to_ratio(image, target_ratio, args.focus_x, args.focus_y)
        resized = cropped.resize((args.width, args.height), Image.Resampling.LANCZOS)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    resized.save(args.output, format="JPEG", quality=92, optimize=True)
    print(f"Erstellt: {args.output} – {args.width} × {args.height}px")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
