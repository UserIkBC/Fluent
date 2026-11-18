#!/usr/bin/env python3
"""Genera icons.js con los iconos de Phosphor (MIT) que usa la app.
Uso: python3 tools/build_icons.py <carpeta assets de @phosphor-icons/core>"""
import sys, re, pathlib, json
A = pathlib.Path(sys.argv[1])
MAP = {
 'book': 'book-open', 'news': 'newspaper', 'globe': 'globe-hemisphere-west', 'link': 'link', 'chat': 'chats-circle', 'scale': 'scales',
 'speak': 'speaker-high', 'play': 'play', 'pause': 'pause', 'stop': 'stop', 'prev': 'skip-back', 'next': 'skip-forward', 'back10': 'arrow-counter-clockwise',
 'search': 'magnifying-glass', 'plus': 'plus', 'check': 'check', 'bookmark': 'bookmark-simple', 'ext': 'arrow-square-out', 'cards': 'cards', 'quiz': 'question',
 'gap': 'brackets-square', 'pen': 'pencil-simple', 'ear': 'headphones', 'order': 'list-numbers', 'spark': 'sparkle', 'flag': 'flag', 'trash': 'trash',
 'podcast': 'microphone-stage', 'video': 'video', 'shuffle': 'shuffle', 'clock': 'clock', 'gear': 'gear-six', 'chart': 'chart-bar',
 'home': 'house', 'user': 'user', 'flame': 'flame', 'left': 'caret-left', 'right': 'caret-right', 'aa': 'text-aa', 'translate': 'translate',
 'bolt': 'lightning', 'target': 'target', 'brain': 'brain', 'scroll': 'scroll', 'gavel': 'gavel', 'cap': 'graduation-cap', 'books': 'books',
 'bulb': 'lightbulb', 'star': 'star', 'x': 'x', 'checkc': 'check-circle', 'list': 'list-bullets', 'note': 'note-pencil', 'tag': 'tag', 'chevdown': 'caret-down',
 'bookopen': 'book-open-text', 'quote': 'quotes', 'dict': 'book-bookmark', 'mic': 'microphone', 'wave': 'waveform'
}
def path(name, w):
    f = A / w / (name + ('' if w == 'regular' else '-' + w) + '.svg')
    s = f.read_text(); return re.search(r'<svg[^>]*>(.*)</svg>', s, re.S).group(1)
reg = {k: path(v, 'regular') for k, v in MAP.items()}
fil = {k: path(v, 'fill') for k, v in MAP.items()}
out = "'use strict';\n/* Iconos Phosphor (licencia MIT, phosphoricons.com). Generado por tools/build_icons.py */\n"
out += 'const _IP = ' + json.dumps(reg) + ';\n'
out += 'const _IF = ' + json.dumps(fil) + ';\n'
out += "const svgI = p => `<svg viewBox=\"0 0 256 256\" fill=\"currentColor\" aria-hidden=\"true\">${p}</svg>`;\n"
out += "const IC = Object.fromEntries(Object.entries(_IP).map(([k, p]) => [k, svgI(p)]));\n"
out += "const ICF = Object.fromEntries(Object.entries(_IF).map(([k, p]) => [k, svgI(p)]));\n"
out += "const ico = (k, s = 18, fill) => ((fill ? ICF : IC)[k] || '').replace('<svg', `<svg width=\"${s}\" height=\"${s}\"`);\n"
pathlib.Path(__file__).resolve().parent.parent.joinpath('icons.js').write_text(out)
print(len(MAP), 'iconos')
