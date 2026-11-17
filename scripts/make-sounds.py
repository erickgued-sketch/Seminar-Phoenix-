"""Builds the app's 14 UI sounds into assets/sounds/*.mp3 — Sound 3.0, "playful game" style.

    python3 scripts/make-sounds.py                 # everything synthesised
    python3 scripts/make-sounds.py --sfx <folder>  # same, but the meditation bell uses the Higgsfield render raw-bell.mp3

The brief: feel like the bright, bouncy sounds of popular learning and platform games, without copying any of them.
Two families share one tuning (equal temperament, A4 = 440) and one "room" (short echo + small reverb):
  * chip voices: band-limited pulse/triangle waves with pitch bends, rapid arpeggios and noise drums (retro platformer feel);
  * pluck voices: rounded sine/triangle plucks that spring up into the note, with a soft bell partial (learning-app feel).
Every melody here is original; intervals that iconic game sounds are known for (e.g. a coin's rising fourth) are avoided.
"""
import argparse, subprocess, wave
from pathlib import Path
import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "assets" / "sounds"
NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

def hz(note):  # "C#6" -> frequency
    name, octave = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((NAMES.index(name) + 12 * (octave + 1) - 69) / 12)

def secs(d): return int(SR * d)

# ---------- oscillators (band-limited, with per-sample frequency so bends and sweeps don't alias) ----------
def _phase(f): return 2 * np.pi * np.cumsum(f) / SR

def pulse(f, duty=0.25, bright=1.0):
    """Additive pulse wave; harmonics above ~16 kHz fade out per sample. bright < 1 softens the top end."""
    ph = _phase(f); y = np.zeros_like(f)
    kmax = int(16000 / max(60.0, float(np.min(f))))
    for k in range(1, kmax + 1):
        a = 2 / (k * np.pi) * np.sin(k * np.pi * duty) * bright ** (k - 1)
        if abs(a) < 1e-4: continue
        y += a * np.cos(k * ph) * np.clip((16000 - k * f) / 2000, 0, 1)
    return y

def tri(f):
    ph = _phase(f); y = np.zeros_like(f)
    for k in range(1, 30, 2):
        y += (8 / np.pi ** 2) * ((-1) ** ((k - 1) // 2)) / k ** 2 * np.sin(k * ph) * np.clip((16000 - k * f) / 2000, 0, 1)
    return y

def sine(f): return np.sin(_phase(f))

def noise(n, seed=0): return np.random.default_rng(seed).standard_normal(n)

# ---------- envelopes and pitch shapes ----------
def adsr(n, a=0.004, d=0.08, s=0.0, r=0.05, hold=None):
    """Attack, exponential decay to sustain level s, optional hold, release."""
    t = np.arange(n) / SR
    env = np.minimum(1, t / max(a, 1e-4))
    dec = s + (1 - s) * np.exp(-(t - a).clip(0) / max(d, 1e-4))
    env = np.where(t < a, env, dec)
    if r: rn = min(n, secs(r)); env[-rn:] *= np.linspace(1, 0, rn) ** 1.5
    return env

def glide(f0, f1, n, curve=3.0):  # exponential-ish pitch move f0 -> f1 over n samples
    x = np.linspace(0, 1, n) ** (1 / curve)
    return f0 * (f1 / f0) ** x

def bend_in(f, n, cents=-120, ms=18):
    """Springy start: begin slightly flat (or sharp) and settle on the note — the bouncy 'pluck' feel."""
    out = np.full(n, f); m = min(n, secs(ms / 1000))
    out[:m] = f * 2 ** ((cents / 1200) * (1 - np.linspace(0, 1, m)) ** 2)
    return out

def vibrato(f, depth_cents=12, rate=6.5, delay=0.08):
    t = np.arange(len(f)) / SR
    return f * 2 ** (depth_cents / 1200 * np.sin(2 * np.pi * rate * t) * np.clip((t - delay) / 0.1, 0, 1))

# ---------- voices ----------
def chip(note, dur, duty=0.25, decay=0.12, sustain=0.0, bend=-60, vib=0, bright=0.92):
    n = secs(dur); f = bend_in(hz(note) if isinstance(note, str) else note, n, bend, 12)
    if vib: f = vibrato(f, vib)
    return pulse(f, duty, bright) * adsr(n, 0.002, decay, sustain, min(0.03, dur / 3))

def pluck(note, dur, decay=0.16, bell=0.25, bend=-140):
    n = secs(dur); f = bend_in(hz(note) if isinstance(note, str) else note, n, bend, 20)
    body = 0.75 * sine(f) + 0.35 * tri(f) + bell * sine(f * 3.01) * np.exp(-np.arange(n) / secs(decay / 3))
    return body * adsr(n, 0.002, decay, 0.0, min(0.04, dur / 3))

def bass(note, dur, decay=0.2):
    n = secs(dur); return tri(np.full(n, hz(note))) * adsr(n, 0.003, decay, 0.25, 0.04)

def drum(kind, dur=0.12, seed=3):
    n = secs(dur); t = np.arange(n) / SR
    if kind == "kick": return sine(glide(160, 45, n, 1.5)) * np.exp(-t / 0.06)
    if kind == "snare": return (noise(n, seed) * 0.8 + sine(np.full(n, 190.0)) * 0.4) * np.exp(-t / 0.045)
    return noise(n, seed) * np.exp(-t / 0.015)  # hat

def sweep(f0, f1, dur, voice="pulse", duty=0.5):
    n = secs(dur); f = glide(f0, f1, n, 1.6)
    y = pulse(f, duty, 0.9) if voice == "pulse" else tri(f) if voice == "tri" else sine(f)
    return y * adsr(n, 0.003, dur * 0.7, 0.0, dur * 0.25)

def sparkle(dur=0.35, seed=7, base=2600, count=6):
    rng = np.random.default_rng(seed); out = np.zeros(secs(dur))
    for i in range(count):
        st = int(rng.uniform(0, 0.6) * len(out)); f = base * 2 ** rng.uniform(0, 1.2); m = secs(0.08)
        seg = sine(np.full(m, f)) * np.exp(-np.arange(m) / secs(0.02)) * rng.uniform(0.3, 0.8)
        out[st:st + m] += seg[: len(out) - st]
    return out

def whoosh(dur, f0=300, f1=4000, seed=5):
    n = secs(dur); x = noise(n, seed); fc = glide(f0, f1, n, 1.3); y = np.zeros(n); lp = 0.0; bp = 0.0
    for i in range(n):  # state-variable band-pass sweeping up
        g = np.tan(np.pi * fc[i] / SR); hp = x[i] - lp - 1.2 * bp; bp += g * hp; lp += g * bp
        y[i] = bp
    return y * np.sin(np.pi * np.arange(n) / n) ** 2

# ---------- arrangement helpers ----------
def seq(events, total):
    """events: (start seconds, signal, gain)."""
    out = np.zeros(secs(total))
    for st, y, g in events:
        i = secs(st); out[i:i + len(y)] += g * y[: max(0, len(out) - i)]
    return out

def room(y, echo=0.22, echo_ms=95, verb=0.10, tail=0.25):
    """Arcade-room depth: a short slap echo plus a tiny comb reverb. Adds a tail so nothing is cut off."""
    y = np.concatenate([y, np.zeros(secs(tail))])
    d = secs(echo_ms / 1000); e = y.copy()
    if echo: e[d:] += echo * y[:-d]; e[2 * d:] += echo * 0.4 * y[:-2 * d]
    if verb:
        r = np.zeros_like(e)
        for ms, g in ((29.7, 0.5), (37.1, 0.45), (41.1, 0.42), (43.7, 0.4)):
            k = secs(ms / 1000); c = e.copy()
            for i in range(k, len(c), k): c[i:i + k] += g * c[i - k:i][: len(c[i:i + k])]
            r += c
        e = e + verb * r / 4
    return e

# ---------- the set ----------
def s_tap():      # bubbly pop
    n = secs(0.07); return seq([(0, sine(glide(1100, 520, n, 2)) * np.exp(-np.arange(n) / secs(0.02)), 1), (0, drum("hat", 0.01) , 0.15)], 0.08)

def s_select():   # springy blip
    return room(seq([(0, chip("A5", 0.07, 0.25, 0.04, bend=-180), 0.8), (0, pluck("A6", 0.06, 0.03, 0.0, -100), 0.3)], 0.09), 0.12, 70, 0.04, 0.08)

def s_card():     # little swoop
    return seq([(0, sweep(380, 1150, 0.10, "tri"), 1), (0, whoosh(0.12, 800, 5000), 0.25)], 0.13)

def s_check():    # two-note chip tick (rising fifth)
    return room(seq([(0, chip("C6", 0.05, 0.5, 0.03), 0.8), (0.045, chip("G6", 0.12, 0.25, 0.06), 0.9)], 0.17), 0.18, 80, 0.05, 0.12)

def s_correct():  # happy major arpeggio, ringing top note + sparkle
    ev = [(0.00, pluck("C6", 0.12, 0.08), 0.8), (0.055, pluck("E6", 0.12, 0.08), 0.85), (0.11, pluck("G6", 0.45, 0.22, 0.35), 1.0),
          (0.00, chip("C5", 0.10, 0.5, 0.05, bend=0, bright=0.7), 0.25), (0.11, chip("G5", 0.2, 0.5, 0.1, bend=0, bright=0.7), 0.25),
          (0.16, sparkle(0.3, 11, 3200, 4), 0.35)]
    return room(seq(ev, 0.56), 0.2, 90, 0.08, 0.2)

def s_wrong():    # soft comic "bwoop": down a fourth with a droopy slide, warm and low
    n1, n2 = secs(0.12), secs(0.26)
    a = tri(bend_in(hz("D4"), n1, 0, 1)) * adsr(n1, 0.004, 0.08, 0.3, 0.03)
    f2 = glide(hz("A3"), hz("A3") * 2 ** (-3 / 12), n2, 0.7)
    b = (tri(f2) + 0.18 * pulse(f2, 0.5, 0.6)) * adsr(n2, 0.004, 0.18, 0.25, 0.08)
    return room(seq([(0, a, 0.9), (0.11, b, 1.0)], 0.4), 0.1, 90, 0.05, 0.12)

def s_xp():       # coin-like reward: rising triad blip, last note shimmering
    ev = [(0.00, chip("G6", 0.05, 0.25, 0.03), 0.7), (0.04, chip("B6", 0.05, 0.25, 0.03), 0.75), (0.08, chip("D7", 0.32, 0.25, 0.16, vib=18), 0.85), (0.1, sparkle(0.25, 13, 3800, 3), 0.25)]
    return room(seq(ev, 0.42), 0.25, 85, 0.06, 0.2)

def s_nudge():    # friendly "boop-bip"
    return room(seq([(0, pluck("G5", 0.1, 0.07, 0.15), 0.85), (0.09, pluck("D6", 0.18, 0.12, 0.25), 0.95)], 0.3), 0.15, 90, 0.06, 0.15)

def s_complete(): # chip fanfare: run up, a bounce, a big held chord
    lead = [("G5", 0.00), ("C6", 0.07), ("E6", 0.14), ("G6", 0.21)]
    ev = [(t, chip(n, 0.09, 0.25, 0.05), 0.75) for n, t in lead]
    ev += [(0.30, chip("E6", 0.10, 0.25, 0.06), 0.75), (0.40, chip("C7", 0.75, 0.25, 0.35, 0.35, vib=14), 0.8)]
    ev += [(0.40, pluck(c, 0.7, 0.4, 0.2, 0), 0.35) for c in ("C5", "E5", "G5")]
    ev += [(0.0, bass("C3", 0.25), 0.6), (0.21, bass("G2", 0.18), 0.55), (0.40, bass("C3", 0.6, 0.35), 0.7)]
    ev += [(0.40, drum("kick"), 0.7), (0.40, drum("snare", 0.15), 0.35), (0.45, sparkle(0.5, 21, 3000, 6), 0.3)]
    return room(seq(ev, 1.2), 0.22, 110, 0.1, 0.35)

def s_levelup():  # power-up run: fast scale climb, then a shining chord with tremolo
    run = ["C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6", "G6", "A6"]
    ev = [(i * 0.034, chip(n, 0.06, 0.125, 0.04, bend=-80), 0.7) for i, n in enumerate(run)]
    t0 = len(run) * 0.034
    n = secs(0.9); trem = 1 + 0.25 * np.sin(2 * np.pi * 9 * np.arange(n) / SR)
    for note, g in (("C7", 0.7), ("G6", 0.45), ("E6", 0.4)):
        ev.append((t0, chip(note, 0.9, 0.25, 0.5, 0.3, bend=0) * trem, g))
    ev += [(t0, bass("C3", 0.8, 0.4), 0.7), (t0, drum("kick"), 0.7), (t0, drum("snare", 0.18), 0.4), (t0 + 0.05, sparkle(0.7, 31, 3200, 9), 0.35)]
    return room(seq(ev, t0 + 1.0), 0.22, 110, 0.12, 0.4)

def s_unlock():   # discovery: two curious low notes, then a sparkling rise
    ev = [(0.0, pluck("E5", 0.12, 0.08, 0.1, 0), 0.6), (0.1, pluck("B5", 0.14, 0.1, 0.1, 0), 0.65)]
    rise = ["A5", "C#6", "E6", "A6", "C#7", "E7"]
    ev += [(0.26 + i * 0.05, pluck(n, 0.35, 0.18, 0.4, -60), 0.75) for i, n in enumerate(rise)]
    ev += [(0.26 + i * 0.05, chip(n, 0.08, 0.125, 0.04, bend=0, bright=0.8), 0.18) for i, n in enumerate(rise)]
    ev += [(0.55, sparkle(0.6, 41, 3400, 8), 0.4), (0.26, bass("A2", 0.5, 0.3), 0.5)]
    return room(seq(ev, 1.15), 0.28, 120, 0.12, 0.4)

def s_streak():   # flame: whoosh up + rising chip sweep + bright ting
    ev = [(0.0, whoosh(0.32, 250, 3500, 9), 0.7), (0.05, sweep(300, 1500, 0.28, "pulse", 0.25), 0.45),
          (0.30, chip("E7", 0.35, 0.25, 0.18, vib=16), 0.75), (0.30, pluck("B6", 0.35, 0.2, 0.3, 0), 0.4), (0.32, sparkle(0.4, 51, 3600, 5), 0.35)]
    return room(seq(ev, 0.75), 0.22, 95, 0.08, 0.3)

def s_celebrate():  # original 8-bit victory fanfare (≈2.4 s): lead, chords, triangle bass, drums
    s16 = 0.095
    melody = [("G5", 0, 1), ("G5", 1, 1), ("C6", 2, 1), ("E6", 3, 1), ("G6", 4, 2), ("E6", 6, 1), ("G6", 7, 3),
              ("A6", 10, 0.8), ("B6", 10.8, 0.8), ("C7", 11.6, 7)]
    ev = [(st * s16, chip(n, ln * s16 + 0.03, 0.25, 0.06 if ln < 3 else 0.4, 0.35 if ln >= 3 else 0.0, vib=14 if ln >= 3 else 0), 0.75) for n, st, ln in melody]
    ev += [(st * s16, chip(n, ln * s16, 0.5, 0.05, bend=0, bright=0.6), 0.22) for n, st, ln in melody]  # octave-down double for body
    chords = [(0, ("C5", "E5", "G5"), 4), (4, ("C5", "E5", "G5"), 3), (7, ("E5", "G5", "C6"), 4.6), (11.6, ("E5", "G5", "C6"), 7)]
    for st, notes, ln in chords:
        ev += [(st * s16, pluck(c, ln * s16 + 0.1, ln * s16 * 0.6, 0.15, 0), 0.22) for c in notes]
    for st, nt, ln in [(0, "C3", 2), (2, "G2", 2), (4, "C3", 3), (7, "G2", 4.6), (11.6, "C3", 7)]:
        ev.append((st * s16, bass(nt, ln * s16, 0.25), 0.7))
    for st in (0, 4, 7, 11.6): ev.append((st * s16, drum("kick"), 0.7))
    for st in (2, 6, 9): ev.append((st * s16, drum("snare"), 0.35))
    for st in range(0, 12): ev.append((st * s16, drum("hat", 0.03, st), 0.12))
    ev += [(11.6 * s16, drum("snare", 0.2), 0.45), (11.6 * s16 + 0.05, sparkle(0.9, 61, 3000, 12), 0.4)]
    return room(seq(ev, 11.6 * s16 + 0.95), 0.24, 120, 0.12, 0.5)

def s_bell():     # calm meditation bowl (deliberately not "game")
    n = secs(2.6); t = np.arange(n) / SR; f = hz("A4")
    y = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / d) for m, a, d in ((1, 1.0, 1.2), (2.76, 0.45, 0.6), (5.4, 0.25, 0.35), (8.93, 0.1, 0.2)))
    return y * np.minimum(1, t / 0.004)

SOUNDS = {"tap": s_tap, "select": s_select, "card": s_card, "check": s_check, "correct": s_correct, "wrong": s_wrong, "xp": s_xp,
          "nudge": s_nudge, "complete": s_complete, "levelup": s_levelup, "bell": s_bell, "unlock": s_unlock, "streak": s_streak, "celebrate": s_celebrate}

# Perceived level per role (RMS of the active part, dBFS): constant sounds sit low, payoffs sit high.
LEVEL = {"tap": -27, "select": -25, "card": -27, "check": -23, "correct": -19, "wrong": -23, "xp": -21, "nudge": -24,
         "complete": -18, "levelup": -17, "bell": -21, "unlock": -18, "streak": -19, "celebrate": -16}

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-af", "highpass=f=70", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768

def higgsfield_bell(path):
    """The Higgsfield singing-bowl render: start at its onset, 3 s, with a natural decay added."""
    y = load(path); i0 = int(np.argmax(np.abs(y) > np.max(np.abs(y)) * 0.06)); y = y[i0:i0 + secs(3.0)]
    t = np.arange(len(y)) / SR; y = y * np.exp(-1.1 * t) * np.minimum(1, t / 0.003)
    fo = secs(0.8); y[-fo:] *= np.linspace(1, 0, fo) ** 2
    return y

def finish(name, y):
    y = y - np.mean(y)
    nz = np.where(np.abs(y) > np.max(np.abs(y)) * 10 ** (-60 / 20))[0]; y = y[: nz[-1] + 1] if len(nz) else y  # drop silent tail
    fo = min(len(y) // 3, secs(0.02)); y[-fo:] *= np.linspace(1, 0, fo)
    active = y[np.abs(y) > 10 ** (-50 / 20) * np.max(np.abs(y)) * 30]
    rms = np.sqrt(np.mean(active ** 2)) if len(active) else 1e-9
    y = y * (10 ** (LEVEL[name] / 20) / rms)
    knee, ceil = 0.6, 0.84  # soft limit: linear below 0.6, tanh knee up to ≈ −1.5 dBFS
    over = np.abs(y) > knee
    y[over] = np.sign(y[over]) * (knee + (ceil - knee) * np.tanh((np.abs(y[over]) - knee) / (ceil - knee)))
    wav = OUT / f"{name}.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "112k", str(OUT / f"{name}.mp3")], check=True)
    wav.unlink()
    return len(y) / SR

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--sfx", type=Path); ap.add_argument("--only", nargs="*"); a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    for name, make in SOUNDS.items():
        if a.only and name not in a.only: continue
        raw = a.sfx / "raw-bell.mp3" if a.sfx else None
        y = higgsfield_bell(raw) if name == "bell" and raw and raw.exists() else make()
        print(f"{name:10s} {finish(name, y):4.2f}s")

if __name__ == "__main__":
    main()
