import json
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

class SecurityHardeningTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.vercel = json.loads((REPO_ROOT / "vercel.json").read_text(encoding="utf-8"))
        catch_all = next(item for item in cls.vercel["headers"] if item["source"] == "/(.*)")
        cls.headers = {item["key"]: item["value"] for item in catch_all["headers"]}

    def test_required_security_headers_are_present(self):
        expected = {
            "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-src https://www.youtube-nocookie.com; upgrade-insecure-requests",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        }
        for key, value in expected.items():
            self.assertEqual(self.headers.get(key), value)

    def test_csp_disallows_framing(self):
        self.assertIn("frame-ancestors 'none'", self.headers["Content-Security-Policy"])

    def test_cdnjs_is_not_referenced(self):
        forbidden_host = "cdnjs" + ".cloudflare.com"
        for path in REPO_ROOT.rglob("*"):
            if path.is_file() and ".git" not in path.parts:
                try:
                    content = path.read_text(encoding="utf-8")
                except UnicodeDecodeError:
                    continue
                self.assertNotIn(forbidden_host, content, str(path))

    def test_media_headers_are_cache_only(self):
        for source in ("/pdf/(.*)", "/audio/(.*)"):
            rule = next(item for item in self.vercel["headers"] if item["source"] == source)
            self.assertEqual(rule["headers"], [{"key": "Cache-Control", "value": "public, max-age=3600, immutable"}])

    def test_local_pdfjs_distribution_is_present(self):
        for relative_path in ("vendor/pdfjs/pdf.mjs", "vendor/pdfjs/pdf.worker.mjs", "vendor/pdfjs/LICENSE"):
            path = REPO_ROOT / relative_path
            self.assertTrue(path.is_file(), relative_path)
            self.assertGreater(path.stat().st_size, 0, relative_path)

    def test_local_privacy_notice_is_linked(self):
        index = (REPO_ROOT / "index.html").read_text(encoding="utf-8")
        notice = (REPO_ROOT / "datenschutz.html").read_text(encoding="utf-8")
        self.assertIn('href="/datenschutz"', index)
        self.assertIn("Vercel Web Analytics", notice)
        self.assertIn("youtube-nocookie.com", notice)

if __name__ == "__main__":
    unittest.main()
