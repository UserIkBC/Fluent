#!/usr/bin/env python3
"""Regenera la lista SHELL de sw.js a partir de index.html y sube la versión de la caché.
Uso: python3 tools/build_sw.py   (desde la raíz del repositorio)"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
sw = (root / 'sw.js').read_text()
srcs = re.findall(r'<script src="([^"]+)"', html)
css = re.findall(r'<link rel="stylesheet" href="([^"]+)"', html)
shell = ['./', 'index.html'] + css + ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/icon.svg',
         'fonts/newsreader.woff2', 'fonts/newsreader-italic.woff2', 'fonts/hanken.woff2'] + srcs
m = re.search(r"const CACHE = 'fluent-v([\d.]+?)(\d+)';", sw)
cache = f"fluent-v{m.group(1)}{int(m.group(2)) + 1}" if m else 'fluent-v7.0.1'
sw = re.sub(r"const CACHE = '[^']*';", f"const CACHE = '{cache}';", sw)
sw = re.sub(r"const SHELL = \[.*?\];", 'const SHELL = ' + '[' + ', '.join(f'"{s}"' for s in shell) + '];', sw, flags=re.S)
(root / 'sw.js').write_text(sw)
print(cache, len(shell), 'archivos')
