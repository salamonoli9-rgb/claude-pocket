#!/usr/bin/env python3
"""Limity Claude dla aplikacji Claude Pocket: 5-godzinny i tygodniowy + historia dziennego zużycia (kwadraciki).

Czyta login Claude Code (~/.claude/.credentials.json) – użytkownik się na to zgodził – i pyta
wyłącznie serwer Anthropic (ten sam odczyt co /usage w Claude Code). Token nie jest nigdzie zapisywany
ani wypisywany. Co wywołanie dopisuje próbkę do ~/.local/share/claude-pocket/usage/history.jsonl (Windows: %LOCALAPPDATA%\\ClaudePocket\\usage).
Zużycie dnia = suma przyrostów limitu tygodniowego w tym dniu (w % tygodnia). Wynik: JSON na stdout."""
import json, os, time, urllib.error, urllib.request
from datetime import datetime, timedelta

HOME = os.path.expanduser('~')
CRED = f'{HOME}/.claude/.credentials.json'
DIR = (os.path.join(os.environ.get('LOCALAPPDATA', HOME), 'ClaudePocket', 'usage') if os.name == 'nt'
       else f'{HOME}/.local/share/claude-pocket/usage')
HIST = f'{DIR}/history.jsonl'
CC_DIR = f'{HOME}/.claude/projects'
CC_CACHE = f'{DIR}/cc-cache.json'


def ts(s):
    try:
        return int(datetime.fromisoformat(s).timestamp()) if s else None
    except Exception:
        return None


def fetch():
    try:
        with open(CRED, encoding='utf-8') as f:
            o = json.load(f).get('claudeAiOauth') or {}
    except Exception:
        return None, 'brak-loginu', ''
    plan = o.get('subscriptionType') or ''
    if o.get('expiresAt', 0) / 1000 < time.time():
        return None, 'token', plan
    req = urllib.request.Request('https://api.anthropic.com/api/oauth/usage', headers={
        'Authorization': 'Bearer ' + o.get('accessToken', ''),
        'anthropic-beta': 'oauth-2025-04-20', 'User-Agent': 'rice-dashboard'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.load(r), None, plan
    except urllib.error.HTTPError as e:
        return None, 'token' if e.code in (401, 403) else f'http {e.code}', plan
    except Exception:
        return None, 'siec', plan


def load_hist():
    out = []
    try:
        with open(HIST, encoding='utf-8') as f:
            for line in f:
                try:
                    out.append(json.loads(line))
                except Exception:
                    pass
    except FileNotFoundError:
        pass
    return out


def daily(hist):
    days = {}
    for a, b in zip(hist, hist[1:]):
        if a.get('d7') is None or b.get('d7') is None:
            continue
        if b.get('d7r') != a.get('d7r') and (b.get('d7r') or 0) > (a.get('d7r') or 0) + 3600:
            delta = b['d7']                      # między próbkami był reset tygodnia
        else:
            delta = max(0.0, b['d7'] - a['d7'])
        if delta > 0:
            day = datetime.fromtimestamp(b['t']).strftime('%Y-%m-%d')
            days[day] = round(days.get(day, 0) + delta, 1)
    return days


def claude_code_days():
    """Tokeny z lokalnych zapisów Claude Code (terminal) – jedyna historia sprzed włączenia licznika.
    Liczone jak w ccusage: wejście + wyjście + cache, każda odpowiedź raz. Wynik w pamięci podręcznej wg pliku."""
    try:
        with open(CC_CACHE, encoding='utf-8') as f:
            cache = json.load(f)
    except Exception:
        cache = {}
    seen_files, days = {}, {}
    for root, _, files in os.walk(CC_DIR):
        for name in files:
            if not name.endswith('.jsonl'):
                continue
            path = os.path.join(root, name)
            st = os.stat(path)
            sig = f'{int(st.st_mtime)}:{st.st_size}'
            c = cache.get(path)
            if not c or c.get('sig') != sig:
                per, ids = {}, set()
                with open(path, encoding='utf-8', errors='replace') as f:
                    for line in f:
                        if '"usage"' not in line:
                            continue
                        try:
                            d = json.loads(line)
                        except Exception:
                            continue
                        m = d.get('message') if isinstance(d.get('message'), dict) else None
                        u = (m or {}).get('usage')
                        if d.get('type') != 'assistant' or not u or not d.get('timestamp'):
                            continue
                        key = f"{m.get('id')}:{d.get('requestId')}"
                        if key in ids:
                            continue
                        ids.add(key)
                        try:
                            day = datetime.fromisoformat(d['timestamp'].replace('Z', '+00:00')).astimezone().strftime('%Y-%m-%d')
                        except Exception:
                            continue
                        tok = sum(int(u.get(k) or 0) for k in ('input_tokens', 'output_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens'))
                        e = per.setdefault(day, [0, 0, 0])
                        e[0] += tok
                        e[1] += int(u.get('output_tokens') or 0)
                        e[2] += 1
                c = {'sig': sig, 'days': per}
            seen_files[path] = c
            for day, (tok, out, n) in c['days'].items():
                e = days.setdefault(day, {'tok': 0, 'out': 0, 'msgs': 0})
                e['tok'] += tok
                e['out'] += out
                e['msgs'] += n
    # zachowaj dni z rozmów, które Claude Code już skasował (domyślnie po 30 dniach) – kwadraciki nie znikają
    for path, c in cache.items():
        if path in seen_files or os.path.exists(path) or not isinstance(c, dict):
            continue
        seen_files[path] = c
        for day, (tok, out, n) in (c.get('days') or {}).items():
            e = days.setdefault(day, {'tok': 0, 'out': 0, 'msgs': 0})
            e['tok'] += tok
            e['out'] += out
            e['msgs'] += n
    try:
        with open(CC_CACHE, 'w', encoding='utf-8') as f:
            json.dump(seen_files, f)
    except Exception:
        pass
    return days


def main():
    os.makedirs(DIR, exist_ok=True)
    data, err, plan = fetch()
    hist = load_hist()
    if data:
        h5, d7 = data.get('five_hour') or {}, data.get('seven_day') or {}
        s = {'t': int(time.time()), 'h5': h5.get('utilization'), 'h5r': ts(h5.get('resets_at')),
             'd7': d7.get('utilization'), 'd7r': ts(d7.get('resets_at'))}
        if not hist or s['t'] - hist[-1]['t'] >= 60 or s['d7'] != hist[-1].get('d7') or s['h5'] != hist[-1].get('h5'):
            with open(HIST, 'a', encoding='utf-8') as f:
                f.write(json.dumps(s) + '\n')
            hist.append(s)
    last = hist[-1] if hist else {}
    days = daily(hist)
    cutoff = (datetime.now() - timedelta(days=400)).strftime('%Y-%m-%d')
    days = {k: v for k, v in days.items() if k >= cutoff}
    today = datetime.now().strftime('%Y-%m-%d')
    cc = {k: v for k, v in claude_code_days().items() if k >= cutoff}
    print(json.dumps({
        'ok': bool(data), 'err': err, 'plan': plan,
        'updated': last.get('t'), 'since': datetime.fromtimestamp(hist[0]['t']).strftime('%Y-%m-%d') if hist else today,
        'h5': {'pct': last.get('h5'), 'reset': last.get('h5r')},
        'd7': {'pct': last.get('d7'), 'reset': last.get('d7r')},
        'today': days.get(today, 0), 'days': days, 'cc': cc,
    }))


if __name__ == '__main__':
    main()
