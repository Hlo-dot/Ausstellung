import json
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from validate_project import Validation  # noqa: E402


class ValidatorTests(unittest.TestCase):
    def make_project(self):
        temporary = tempfile.TemporaryDirectory()
        root = Path(temporary.name)
        (root / "audio").mkdir()
        (root / "pdf").mkdir()
        (root / "artstrips").mkdir()
        (root / "audio" / "test.mp3").write_bytes(b"ID3-test")
        (root / "pdf" / "test.pdf").write_bytes(b"%PDF-test")
        (root / "artstrips" / "test-horizontal.jpg").write_bytes(b"jpeg-test")
        works = [{
            "id": "test",
            "werk": "Testwerk",
            "serie": "Einzelwerk",
            "audio": "audio/test.mp3",
            "pdf": "pdf/test.pdf",
            "format": "80 × 60 cm",
            "jahr": 2026,
        }]
        exhibitions = [{
            "id": "test-exhibition",
            "title": "Testausstellung",
            "venue": "Testort",
            "start": "2026-01-01",
            "end": "2026-01-31",
            "current": True,
            "works": ["test"],
        }]
        (root / "works.json").write_text(json.dumps(works), encoding="utf-8")
        (root / "exhibitions.json").write_text(json.dumps(exhibitions), encoding="utf-8")
        (root / "main.js").write_text(
            'const ART_STRIPS = {"test": "/artstrips/test-horizontal.jpg"};',
            encoding="utf-8",
        )
        return temporary, root, works, exhibitions

    def validate(self, root):
        stdout = StringIO()
        stderr = StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            result = Validation(root).run()
        return result, stdout.getvalue(), stderr.getvalue()

    def test_valid_project_passes(self):
        temporary, root, _, _ = self.make_project()
        self.addCleanup(temporary.cleanup)
        result, _, errors = self.validate(root)
        self.assertEqual(result, 0, errors)

    def test_duplicate_work_id_fails(self):
        temporary, root, works, _ = self.make_project()
        self.addCleanup(temporary.cleanup)
        works.append(dict(works[0]))
        (root / "works.json").write_text(json.dumps(works), encoding="utf-8")
        result, _, errors = self.validate(root)
        self.assertEqual(result, 1)
        self.assertIn("doppelte Werk-ID", errors)

    def test_unknown_exhibition_reference_fails(self):
        temporary, root, _, exhibitions = self.make_project()
        self.addCleanup(temporary.cleanup)
        exhibitions[0]["works"].append("nicht-vorhanden")
        (root / "exhibitions.json").write_text(json.dumps(exhibitions), encoding="utf-8")
        result, _, errors = self.validate(root)
        self.assertEqual(result, 1)
        self.assertIn("unbekannte Werk-ID", errors)

    def test_missing_asset_fails(self):
        temporary, root, _, _ = self.make_project()
        self.addCleanup(temporary.cleanup)
        (root / "audio" / "test.mp3").unlink()
        result, _, errors = self.validate(root)
        self.assertEqual(result, 1)
        self.assertIn("referenzierte Datei fehlt", errors)

    def test_missing_current_metadata_fails(self):
        temporary, root, works, _ = self.make_project()
        self.addCleanup(temporary.cleanup)
        del works[0]["format"]
        (root / "works.json").write_text(json.dumps(works), encoding="utf-8")
        result, _, errors = self.validate(root)
        self.assertEqual(result, 1)
        self.assertIn("Format fehlt", errors)


if __name__ == "__main__":
    unittest.main()
