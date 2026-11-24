# Generator skórek duszka -> assets/skins.js. Każda skórka: to samo pudełko 120x130 i te same części twarzy
# (oczy okrągłe/kwadratowe, powieki, uśmiech/smutek, buzia "o", rumieńce), więc animacje działają dla wszystkich.
import os
import json

def face(ex1, ex2, ey, mx, my, by=None, angular=False, blush=True, s=1.0):
    rx, ry = 6.5 * s, 8.5 * s
    w, h = 13 * s, 16 * s
    o = []
    o.append(f'<g class="eyes"><ellipse class="eye" cx="{ex1}" cy="{ey}" rx="{rx}" ry="{ry}"/><ellipse class="eye" cx="{ex2}" cy="{ey}" rx="{rx}" ry="{ry}"/>'
             f'<circle class="glint" cx="{ex1 + 2*s}" cy="{ey - 3*s}" r="{2.3*s}"/><circle class="glint" cx="{ex2 + 2*s}" cy="{ey - 3*s}" r="{2.3*s}"/></g>')
    o.append(f'<g class="eyes-sq"><rect class="eye" x="{ex1 - w/2}" y="{ey - h/2}" width="{w}" height="{h}" rx="{2*s}"/><rect class="eye" x="{ex2 - w/2}" y="{ey - h/2}" width="{w}" height="{h}" rx="{2*s}"/>'
             f'<rect class="glint" x="{ex1 + 1*s}" y="{ey - 5*s}" width="{3.6*s}" height="{3.6*s}"/><rect class="glint" x="{ex2 + 1*s}" y="{ey - 5*s}" width="{3.6*s}" height="{3.6*s}"/></g>')
    d = 8 * s
    o.append(f'<path class="lid" d="M{ex1-d} {ey} Q{ex1} {ey+6*s} {ex1+d} {ey} M{ex2-d} {ey} Q{ex2} {ey+6*s} {ex2+d} {ey}"/>')
    o.append(f'<path class="lid-happy" d="M{ex1-d} {ey+2*s} Q{ex1} {ey-7*s} {ex1+d} {ey+2*s} M{ex2-d} {ey+2*s} Q{ex2} {ey-7*s} {ex2+d} {ey+2*s}"/>')
    if blush and by is not None:
        o.append(f'<ellipse class="blush" cx="{ex1 - 11*s}" cy="{by}" rx="{6*s}" ry="{3.5*s}"/><ellipse class="blush" cx="{ex2 + 11*s}" cy="{by}" rx="{6*s}" ry="{3.5*s}"/>')
    m = 7 * s
    if angular:
        o.append(f'<path class="mouth" d="M{mx-m} {my} L{mx} {my+5*s} L{mx+m} {my}"/>')
        o.append(f'<path class="mouth-sad" d="M{mx-m} {my+5*s} L{mx} {my} L{mx+m} {my+5*s}"/>')
    else:
        o.append(f'<path class="mouth" d="M{mx-m} {my} Q{mx} {my+7*s} {mx+m} {my}"/>')
        o.append(f'<path class="mouth-sad" d="M{mx-m} {my+5*s} Q{mx} {my-2*s} {mx+m} {my+5*s}"/>')
    o.append(f'<ellipse class="mouth-o" cx="{mx}" cy="{my+3*s}" rx="{5*s}" ry="{6*s}"/>')
    return ''.join(o)

SHADOW = '<ellipse class="shadow" cx="60" cy="126" rx="30" ry="4"/>'
def svg(id_, style, body):
    return f'<svg class="ghost" viewBox="0 0 120 130" style="{style}">{SHADOW}{body}</svg>'

skins = {}

# 1. Pimpek – gładki duszek (dotychczasowy)
skins['ghost'] = {'name': 'Duszek', 'emoji': '👻', 'svg': svg('ghost', '--eye:#2a1712;--line:#2a1712',
    '<defs><radialGradient id="sk-ghost" cx="40%" cy="30%" r="75%"><stop offset="0%" stop-color="#ffb48f"/><stop offset="55%" stop-color="#e8875f"/><stop offset="100%" stop-color="#c4603b"/></radialGradient></defs>'
    '<path fill="url(#sk-ghost)" d="M60 8 C28 8 14 34 14 62 L14 104 C14 112 22 114 27 108 C32 102 38 102 42 109 C46 116 54 116 58 109 C62 102 68 102 72 109 C76 116 84 116 88 109 C92 102 98 102 102 108 C106 114 106 112 106 104 L106 62 C106 34 92 8 60 8 Z"/>'
    '<ellipse class="shine" cx="42" cy="28" rx="11" ry="6" transform="rotate(-25 42 28)"/>'
    + face(45, 75, 58, 60, 74, 72))}

# 2. Robocik – kanciasta głowa z ekranem, antena, gąsienice
skins['robot'] = {'name': 'Robocik', 'emoji': '🤖', 'svg': svg('robot', '--eye:#7ff5e1;--line:#7ff5e1;--glint:#e9fffb',
    '<defs><linearGradient id="sk-robot" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b7c3d3"/><stop offset="100%" stop-color="#6d7b91"/></linearGradient></defs>'
    '<line x1="60" y1="20" x2="60" y2="8" stroke="#8a97ab" stroke-width="3"/><rect x="55" y="2" width="10" height="8" rx="2" fill="#d97757"/>'
    '<rect x="22" y="20" width="76" height="58" rx="7" fill="url(#sk-robot)"/>'
    '<rect x="16" y="38" width="6" height="18" rx="2" fill="#8a97ab"/><rect x="98" y="38" width="6" height="18" rx="2" fill="#8a97ab"/>'
    '<rect x="30" y="29" width="60" height="41" rx="5" fill="#141b24"/><rect x="33" y="31" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.18)"/>'
    '<rect x="36" y="82" width="48" height="24" rx="4" fill="url(#sk-robot)"/><rect x="55" y="88" width="10" height="10" rx="2" fill="#d97757"/>'
    '<rect x="26" y="106" width="68" height="14" rx="7" fill="#3b4452"/><circle cx="36" cy="113" r="3.5" fill="#8a97ab"/><circle cx="60" cy="113" r="3.5" fill="#8a97ab"/><circle cx="84" cy="113" r="3.5" fill="#8a97ab"/>'
    + face(47, 73, 47, 60, 58, None, angular=True, blush=False, s=0.85))}

# 3. Kryształek – fasetowany klejnot
skins['gem'] = {'name': 'Kryształek', 'emoji': '💎', 'svg': svg('gem', '--eye:#24123d;--line:#24123d',
    '<polygon points="60,6 100,30 100,92 60,118 20,92 20,30" fill="#8b6cf0"/>'
    '<polygon points="60,6 100,30 60,44" fill="#b8a5ff"/><polygon points="60,6 20,30 60,44" fill="#a48bff"/>'
    '<polygon points="20,30 60,44 20,92" fill="#7a5ce3"/><polygon points="100,30 60,44 100,92" fill="#6a4dd2"/>'
    '<polygon points="20,92 60,118 60,96" fill="#5b3fc0"/><polygon points="100,92 60,118 60,96" fill="#4e34ad"/>'
    '<polygon points="60,44 100,92 60,96 20,92" fill="#9479f5"/>'
    '<polygon points="34,30 46,23 52,30 40,36" fill="rgba(255,255,255,0.55)"/>'
    + face(46, 74, 66, 60, 81, 78, angular=True))}

# 4. Lisek – low-poly głowa
skins['fox'] = {'name': 'Lisek', 'emoji': '🦊', 'svg': svg('fox', '--eye:#24160d;--line:#24160d',
    '<polygon points="22,44 32,6 54,34" fill="#e07a34"/><polygon points="98,44 88,6 66,34" fill="#e07a34"/>'
    '<polygon points="30,38 34,16 46,33" fill="#5a2c14"/><polygon points="90,38 86,16 74,33" fill="#5a2c14"/>'
    '<polygon points="16,46 60,30 104,46 98,82 60,112 22,82" fill="#ee8b43"/>'
    '<polygon points="16,46 60,30 60,52" fill="#f59d58"/><polygon points="104,46 60,30 60,52" fill="#e27b36"/>'
    '<polygon points="22,82 60,112 40,78" fill="#fff4ea"/><polygon points="98,82 60,112 80,78" fill="#f4e6da"/>'
    '<polygon points="40,78 60,112 80,78 60,84" fill="#ffffff"/>'
    '<polygon points="54,96 66,96 60,103" fill="#24160d"/>'
    + face(44, 76, 60, 60, 106, 76, angular=True, s=0.9)
    .replace('class="mouth" d="M53.7 106 L60 110.5 L66.3 106"', 'class="mouth" d="M55 107 L60 110 L65 107"'))}

# 5. Kotek – pikselowy
px = []
def P(x, y, w=1, h=1, c='#5b6070'):
    px.append(f'<rect x="{12 + x*8}" y="{10 + y*8}" width="{w*8}" height="{h*8}" fill="{c}"/>')
P(1, 0); P(10, 0); P(0, 1, 3, 1); P(9, 1, 3, 1); P(0, 2, 4, 1); P(8, 2, 4, 1)   # uszy schodkami
P(1, 1, c='#e98fa6'); P(10, 1, c='#e98fa6'); P(1, 2, 2, 1, '#e98fa6'); P(9, 2, 2, 1, '#e98fa6')
P(0, 3, 12, 8)                                        # głowa
P(1, 11, 10, 1)
P(2, 4, 2, 1, '#6c7182'); P(8, 4, 2, 1, '#6c7182')   # jaśniejsze piksele
P(5, 9, 2, 1, '#e98fa6')                              # nosek
skins['cat'] = {'name': 'Kotek', 'emoji': '🐱', 'svg': svg('cat', '--eye:#121418;--line:#121418;--glint:#d6f5c8',
    ''.join(px) + '<g stroke="#c9ccd6" stroke-width="1.6" opacity=".8"><line x1="2" y1="86" x2="22" y2="84"/><line x1="2" y1="94" x2="22" y2="90"/>'
    '<line x1="118" y1="86" x2="98" y2="84"/><line x1="118" y1="94" x2="98" y2="90"/></g>'
    + face(44, 76, 66, 60, 92, 82, angular=True, s=0.9))}

js = 'window.SKINS = ' + json.dumps(skins, ensure_ascii=False) + ';\n'
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'android', 'assets', 'skins.js'), 'w', encoding='utf-8').write(js)
print({k: len(v['svg']) for k, v in skins.items()})
