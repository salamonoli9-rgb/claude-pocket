"""Rysunki jedzenia 2D (SVG, płaski kreskówkowy styl z obrysem) -> foods.js"""
import json, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'android', 'assets')
O = '#3a2418'          # obrys
SW = 2.6               # grubość obrysu

def svg(id_, body, defs=''):
    return (f'<svg class="food-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">'
            f'<defs>{defs}</defs><g stroke="{O}" stroke-width="{SW}" stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>')

def rg(id_, c1, c2, cx='38%', cy='32%'):
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="75%"><stop offset="0%" stop-color="{c1}"/><stop offset="100%" stop-color="{c2}"/></radialGradient>'

def lg(id_, c1, c2):
    return f'<linearGradient id="{id_}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{c1}"/><stop offset="100%" stop-color="{c2}"/></linearGradient>'

hl = lambda d: f'<path d="{d}" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2.4"/>'

F = {}
F['cookie'] = {'name': 'Ciastko', 'svg': svg('cookie',
    '<circle cx="32" cy="33" r="23" fill="url(#f-cookie)"/>'
    '<path d="M14 38 Q32 52 50 38" fill="none" stroke="#b06d34" stroke-width="2" stroke-opacity="0.5"/>'
    + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="3.6" ry="3" fill="#4a2a17" stroke-width="1.6" transform="rotate({r} {x} {y})"/>'
              for x, y, r in [(24, 25, 20), (38, 22, -15), (42, 36, 30), (27, 40, -10), (33, 31, 5), (19, 33, 40)])
    + hl('M18 24 Q22 16 30 14'),
    rg('f-cookie', '#f1c27d', '#c98a4b'))}

F['pizza'] = {'name': 'Pizza', 'svg': svg('pizza',
    '<path d="M8 16 Q32 4 56 16 L33 58 Q31 61 29 57 Z" fill="#f7c948"/>'
    '<path d="M8 16 Q32 4 56 16 L53 22 Q32 11 11 22 Z" fill="url(#f-crust)"/>'
    '<path d="M20 33 Q22 40 19 44" fill="none" stroke="#f7c948" stroke-width="0"/>'
    + ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#d9483b" stroke-width="2"/>' for x, y, r in [(24, 27, 4.6), (38, 26, 4.2), (31, 39, 4)])
    + '<path d="M44 30 q1 5 -1 8" fill="none" stroke="#e0a21c" stroke-width="2"/>'
      '<circle cx="21" cy="35" r="1.6" fill="#3f8a3a" stroke="none"/><circle cx="40" cy="36" r="1.6" fill="#3f8a3a" stroke="none"/>'
    + hl('M15 15 Q24 10 34 10'),
    lg('f-crust', '#e8a557', '#c47a33'))}

F['strawberry'] = {'name': 'Truskawka', 'svg': svg('strawberry',
    '<path d="M32 58 C14 48 10 32 14 24 C18 16 28 17 32 20 C36 17 46 16 50 24 C54 32 50 48 32 58 Z" fill="url(#f-straw)"/>'
    '<path d="M32 20 L24 12 L30 15 L32 7 L34 15 L40 12 Z M22 21 L32 20 L42 21 L36 26 L32 22 L28 26 Z" fill="#4caf50"/>'
    + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="1.2" ry="1.9" fill="#ffe08a" stroke="none"/>'
              for x, y in [(22, 32), (30, 30), (39, 31), (45, 35), (19, 39), (27, 39), (35, 40), (42, 43), (25, 47), (32, 49), (38, 49)])
    + hl('M18 28 Q19 24 23 23'),
    rg('f-straw', '#ff7a7a', '#d72f3f'))}

F['donut'] = {'name': 'Pączek', 'svg': svg('donut',
    '<ellipse cx="32" cy="36" rx="25" ry="21" fill="#e0a05e"/>'
    '<path d="M9 33 C9 18 55 18 55 33 C55 40 50 38 47 42 C44 46 40 41 36 44 C32 47 29 42 25 44 C20 46 18 40 14 41 C10 42 9 37 9 33 Z" fill="url(#f-icing)"/>'
    '<ellipse cx="32" cy="33" rx="7" ry="5" fill="#7a4a26"/>'
    + ''.join(f'<rect x="{x}" y="{y}" width="5" height="1.8" rx="0.9" fill="{c}" stroke="none" transform="rotate({r} {x} {y})"/>'
              for x, y, r, c in [(18, 27, 30, '#ffffff'), (26, 22, -20, '#7fd6ff'), (40, 24, 40, '#ffe066'), (45, 31, -30, '#9cf09c'),
                                 (17, 35, -40, '#ffe066'), (38, 38, 20, '#ffffff'), (24, 38, 60, '#7fd6ff'), (33, 25, 5, '#9cf09c')])
    + hl('M15 26 Q20 20 28 19'),
    rg('f-icing', '#ffb3d1', '#ff6fa8'))}

F['sushi'] = {'name': 'Sushi', 'svg': svg('sushi',
    '<rect x="10" y="32" width="44" height="20" rx="9" fill="url(#f-rice)"/>'
    '<path d="M8 30 C10 18 54 16 56 28 C57 34 50 36 32 36 C14 36 7 35 8 30 Z" fill="url(#f-salmon)"/>'
    '<path d="M18 22 Q22 28 19 34 M29 19 Q33 26 30 35 M41 20 Q44 27 42 35" fill="none" stroke="#fff3ea" stroke-width="2.2" stroke-opacity="0.9"/>'
    '<rect x="27" y="27" width="10" height="26" rx="2" fill="#1f3329"/>'
    + ''.join(f'<ellipse cx="{x}" cy="{y}" rx="1.4" ry="0.9" fill="#e9e4da" stroke="none"/>' for x, y in [(15, 45), (21, 48), (44, 46), (49, 42), (16, 39)])
    + hl('M14 26 Q20 21 27 20'),
    lg('f-rice', '#ffffff', '#e6e1d6') + lg('f-salmon', '#ffa477', '#f06b3c'))}

F['icecream'] = {'name': 'Lody', 'svg': svg('icecream',
    '<path d="M20 34 L32 61 L44 34 Z" fill="url(#f-cone)"/>'
    '<path d="M24 38 L38 52 M30 36 L41 46 M38 36 L28 54 M44 36 L33 58 M22 37 L26 46" fill="none" stroke="#b8793d" stroke-width="1.6"/>'
    '<circle cx="25" cy="30" r="9.5" fill="#9ff0c9"/>'
    '<circle cx="39" cy="30" r="9.5" fill="#ffb0c8"/>'
    '<circle cx="32" cy="21" r="10" fill="#fff4d6"/>'
    '<path d="M24 30 q2 4 5 2 M37 31 q2 4 5 1" fill="none" stroke-width="1.6" stroke-opacity="0.6"/>'
    '<circle cx="33" cy="9" r="4" fill="#e5383b"/><path d="M33 5 Q36 0 40 1" fill="none" stroke-width="1.8"/>'
    + hl('M26 15 Q28 12 32 12'),
    lg('f-cone', '#f4c27a', '#d9944a'))}

F['fish'] = {'name': 'Rybka', 'svg': svg('fish',
    '<path d="M48 32 L60 21 L59 43 Z" fill="#5aa9e6"/>'
    '<path d="M6 32 C14 16 40 14 50 32 C40 50 14 48 6 32 Z" fill="url(#f-fish)"/>'
    '<path d="M24 22 Q28 32 24 42" fill="none" stroke-width="2" stroke-opacity="0.6"/>'
    '<path d="M30 26 L36 30 L30 33 M33 32 L39 36 L33 39" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.6"/>'
    '<circle cx="15" cy="29" r="3.2" fill="#ffffff" stroke-width="1.6"/><circle cx="14.4" cy="29" r="1.5" fill="#1b1b1b" stroke="none"/>'
    '<path d="M28 18 Q34 10 42 20" fill="#5aa9e6"/>'
    + hl('M12 24 Q18 19 26 18'),
    lg('f-fish', '#8fd3ff', '#3f8fd6'))}

F['battery'] = {'name': 'Bateria', 'svg': svg('battery',
    '<rect x="25" y="5" width="14" height="6" rx="2" fill="#9aa3b5"/>'
    '<rect x="14" y="10" width="36" height="48" rx="7" fill="#2b3040"/>'
    '<rect x="19" y="27" width="26" height="26" rx="3.5" fill="url(#f-charge)" stroke-width="1.8"/>'
    '<path d="M34 15 L26 34 L32 34 L29 48 L39 28 L33 28 Z" fill="#ffd84d" stroke-width="2"/>'
    + hl('M19 16 L19 24'),
    lg('f-charge', '#7cf29b', '#2fbf63'))}

F['drumstick'] = {'name': 'Udko', 'svg': svg('drumstick',
    '<path d="M40 42 L52 54" fill="none" stroke-width="8"/><path d="M40 42 L52 54" fill="none" stroke="#fffaf0" stroke-width="3.6"/>'
    '<circle cx="54" cy="51" r="5" fill="#fffaf0"/><circle cx="49" cy="57" r="5" fill="#fffaf0"/>'
    '<path d="M45 41 C54 22 41 3 23 5 C5 7 1 29 11 41 C19 51 37 53 45 41 Z" fill="url(#f-meat)"/>'
    '<path d="M15 21 q5 -4 10 -1 M19 33 q6 3 11 -1 M33 16 q4 2 5 6" fill="none" stroke="#7a3d14" stroke-width="1.8" stroke-opacity="0.55"/>'
    + hl('M11 21 Q14 12 23 10'),
    rg('f-meat', '#f2a65a', '#b8601f'))}

F['candy'] = {'name': 'Cukierek', 'svg': svg('candy',
    '<path d="M20 32 L3 17 Q8 24 6 32 Q8 40 3 47 Z" fill="#b89cff"/>'
    '<path d="M44 32 L61 17 Q56 24 58 32 Q56 40 61 47 Z" fill="#b89cff"/>'
    '<path d="M9 25 L17 31 M9 39 L17 33 M55 25 L47 31 M55 39 L47 33" fill="none" stroke-width="1.5" stroke-opacity="0.5"/>'
    '<circle cx="32" cy="32" r="16" fill="url(#f-candy)"/>'
    '<path d="M21 23 Q32 34 26 45 M32 17 Q42 30 36 47 M41 21 Q46 30 44 40" fill="none" stroke="#ffffff" stroke-width="3" stroke-opacity="0.75"/>'
    + hl('M24 24 Q27 20 31 19'),
    rg('f-candy', '#ffd0f0', '#c86bfa'))}

ORDER = ['cookie', 'pizza', 'strawberry', 'donut', 'sushi', 'icecream', 'fish', 'battery', 'drumstick', 'candy']
out = {k: F[k] for k in ORDER}
js = 'window.FOODS = ' + json.dumps(out, ensure_ascii=False) + ';\n'
open(os.path.join(OUT, 'foods.js'), 'w', encoding='utf-8').write(js)
# podgląd
html = '<html><body style="background:#121217;display:flex;flex-wrap:wrap;gap:14px;padding:20px">' + ''.join(
    f'<div style="width:120px;text-align:center;color:#ddd;font:14px sans-serif"><div style="width:110px;height:110px;background:#1c1c24;border-radius:22px;padding:12px;box-sizing:border-box">{v["svg"]}</div>{v["name"]}</div>'
    for v in out.values()) + '</body></html>'
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'foods_preview.html'), 'w', encoding='utf-8').write(html)
print(len(js), 'bajtów')
