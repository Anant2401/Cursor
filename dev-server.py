#!/usr/bin/env python3
"""
Local static server with an HTTP 301 for extension-less exam roadmap URLs.

Use this instead of `python -m http.server` when testing in Chrome so
/Tools/pehchaan_exam_roadmap and /Tools/pehchaan_exam_roadmap/ redirect
without relying on JavaScript (Chrome may cache or block stub redirects).

Run from repo root:
  py dev-server.py
Then open http://127.0.0.1:8080/Tools/pehchaan_exam_roadmap.html
"""
from __future__ import annotations

import http.server
import socketserver
import urllib.parse
from pathlib import Path

PORT = 8080
ROOT = Path(__file__).resolve().parent


class PehchaanDevHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")
        if path == "/Tools/pehchaan_exam_roadmap":
            target = "/Tools/pehchaan_exam_roadmap.html"
            if parsed.query:
                target += "?" + parsed.query
            self.send_response(301, "Moved Permanently")
            self.send_header("Location", target)
            self.send_header("Cache-Control", "no-store, max-age=0")
            self.end_headers()
            return
        super().do_GET()

def main() -> None:
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), PehchaanDevHandler) as httpd:
        print(f"Serving {ROOT} at http://127.0.0.1:{PORT}/")
        print("Exam roadmap (extension-less): http://127.0.0.1:{PORT}/Tools/pehchaan_exam_roadmap".format(PORT=PORT))
        httpd.serve_forever()


if __name__ == "__main__":
    main()
