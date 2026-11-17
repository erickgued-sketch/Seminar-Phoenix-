"""Builds the app's 14 UI sounds into assets/sounds/*.mp3.

    python3 scripts/make-sounds.py                 # synthesised set only (no external files needed)
    python3 scripts/make-sounds.py --sfx <folder>  # Sound 2.0: blend in the Higgsfield renders raw-<name>.mp3

Sound 2.0 is a hybrid (docs/ASSET_LIBRARY.md):
  * micro-sounds that fire constantly (tap, select, card, check) are synthesised: instant, tiny, consistent;
  * moment sounds (wrong, nudge, complete, levelup, bell, streak, celebrate) are Higgsfield renders, trimmed to their
    strongest event, high-passed, faded and loudness-matched;
  * correct, xp and unlock layer a synthesised chime under a Higgsfield transient.
Every synthesised tone uses one major-pentatonic palette so the set sounds like a family.
"""
import argparse, subprocess, wave
from pathlib import Path
import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "assets" / "sounds"
NOTE = {"A3": 220.0, "C4": 261.63, "E4": 329.63, "G4": 392.0, "A4": 440.0, "C5": 523.25, "D5": 587.33, "E5": 659.25,
        "G5": 783.99, "A5": 880.0, "C6": 1046.5, "D6": 1174.66, "E6": 1318.5, "G6": 1568.0, "A6": 1760.0, "C7": 2093.0}

# ---------- synthesis ----------
def tone(freq, dur, decay=6.0, harmonics=((1, 1.0), (2, 0.35), (4, 0.12)), attack=0.004):
    t = np.arange(int(SR * dur)) / SR
    y = sum(a * np.sin(2 * np.pi * freq * h * t) for h, a in harmonics)
    return y * np.exp(-decay * t) * np.minimum(1, t / attack)

def marimba(freq, dur=0.35, decay=11):  # woody: strong fundamental, inharmonic 4th partial, short click
    return tone(freq, dur, decay, ((1, 1.0), (3.93, 0.28), (9.2, 0.05)), attack=0.002)

def bellish(freq, dur=0.9, decay=4.5):  # glassy: inharmonic partials ring longer
    return tone(freq, dur, decay, ((1, 1.0), (2.76, 0.4), (5.4, 0.18), (8.93, 0.07)), attack=0.003)

def click(dur=0.012, bright=0.6, seed=1):
    rng = np.random.default_rng(seed)
    n = rng.standard_normal(int(SR * dur))
    n = np.convolve(n, [bright, 1 - bright], mode="same")
    return n * np.exp(-np.arange(len(n)) / (SR * dur / 5))

def swoosh(dur=0.2, f0=600, f1=3200, seed=2):  # band-limited noise whose centre sweeps up
    rng = np.random.default_rng(seed)
    n = rng.standard_normal(int(SR * dur)); t = np.arange(len(n)) / SR
    phase = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * t / dur) / SR
    y = n * (0.5 + 0.5 * np.sin(phase)) ** 6
    return y * np.sin(np.pi * t / dur) ** 2

def mix(parts, total):
    out = np.zeros(int(SR * total))
    for start, y in parts:
        i = int(SR * start); out[i:i + len(y)] += y[: max(0, len(out) - i)]
    return out

SYNTH = {
    "tap": lambda: mix([(0, click(0.010, 0.7)), (0.001, marimba(NOTE["G5"], 0.09, 40) * 0.5)], 0.1),
    "select": lambda: mix([(0, click(0.008, 0.8) * 0.5), (0, marimba(NOTE["E6"], 0.16, 26)), (0.012, marimba(NOTE["A6"], 0.12, 34) * 0.25)], 0.18),
    "card": lambda: mix([(0, swoosh(0.18, 500, 2600) * 0.8), (0.07, marimba(NOTE["C6"], 0.14, 30) * 0.35)], 0.22),
    "check": lambda: mix([(0, click(0.008, 0.7) * 0.7), (0.004, marimba(NOTE["C6"], 0.22, 18)), (0.055, bellish(NOTE["G6"], 0.3, 12) * 0.5)], 0.36),
    "correct": lambda: mix([(0, marimba(NOTE["E6"], 0.3, 10)), (0.085, bellish(NOTE["A6"], 0.55, 6.5)), (0.085, marimba(NOTE["C6"], 0.4, 9) * 0.45)], 0.65),
    "wrong": lambda: mix([(0, marimba(NOTE["E4"], 0.28, 11)), (0.11, marimba(NOTE["C4"], 0.38, 9))], 0.5),
    "xp": lambda: mix([(i * 0.045, bellish(f, 0.35, 9) * (0.9 - i * 0.12)) for i, f in enumerate([NOTE["C6"], NOTE["E6"], NOTE["G6"], NOTE["C7"]])], 0.55),
    "nudge": lambda: mix([(0, marimba(NOTE["G5"], 0.22, 13)), (0.1, marimba(NOTE["C6"], 0.3, 10))], 0.42),
    "complete": lambda: mix([(0.0, marimba(NOTE["C5"], 0.5, 6)), (0.11, marimba(NOTE["E5"], 0.5, 6)), (0.22, marimba(NOTE["G5"], 0.5, 6)),
                             (0.34, bellish(NOTE["C6"], 1.1, 3.2)), (0.34, bellish(NOTE["E6"], 1.1, 3.6) * 0.5), (0.34, marimba(NOTE["G5"], 0.8, 4) * 0.5)], 1.45),
    "levelup": lambda: mix([(i * 0.09, marimba(f, 0.4, 7)) for i, f in enumerate([NOTE["G4"], NOTE["C5"], NOTE["E5"], NOTE["G5"]])]
                           + [(0.42, bellish(NOTE["C6"], 1.5, 2.6)), (0.42, bellish(NOTE["E6"], 1.5, 2.8) * 0.6), (0.7, bellish(NOTE["G6"], 0.9, 4) * 0.35)], 1.9),
    "bell": lambda: tone(NOTE["A3"] * 2, 2.4, 1.6, ((1, 1.0), (2.76, 0.45), (5.4, 0.25), (8.9, 0.1))),
    "unlock": lambda: mix([(0, click(0.015, 0.4) * 0.9), (0.03, marimba(NOTE["G4"], 0.2, 16) * 0.6)]
                          + [(0.16 + i * 0.05, bellish(f, 0.7, 5) * 0.55) for i, f in enumerate([NOTE["C5"], NOTE["E5"], NOTE["G5"], NOTE["C6"], NOTE["E6"], NOTE["G6"], NOTE["C7"]])], 1.3),
    "streak": lambda: mix([(0, swoosh(0.35, 200, 1800, 5)), (0.25, bellish(NOTE["E6"], 0.5, 7) * 0.5), (0.3, bellish(NOTE["A6"], 0.5, 7) * 0.4)], 0.9),
    "celebrate": lambda: mix([(i * 0.1, marimba(f, 0.5, 6)) for i, f in enumerate([NOTE["C5"], NOTE["E5"], NOTE["G5"], NOTE["C6"]])]
                             + [(0.45, bellish(f, 2.0, 1.8) * a) for f, a in [(NOTE["C6"], 1), (NOTE["E6"], 0.6), (NOTE["G6"], 0.45), (NOTE["C7"], 0.25)]], 2.6),
}

# ---------- Higgsfield renders ----------
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-af", "highpass=f=70", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768

def env_db(y, win=0.01):
    w = int(SR * win)
    return np.array([20 * np.log10(np.sqrt(np.mean(y[i:i + w] ** 2)) + 1e-9) for i in range(0, len(y), w)]), w

def trim(y, max_len, mode="onset", floor=40):
    """onset: from the first sound within 24 dB of the peak; event: the loudest max_len window. Ends where the
    level falls `floor` dB under the peak (or at max_len)."""
    e, w = env_db(y)
    top = e.max()
    if mode == "event":
        k = max(1, int(max_len / 0.01)); s = np.convolve(10 ** (e / 10), np.ones(k), "valid")
        i0 = int(np.argmax(s))
        while i0 > 0 and e[i0 - 1] > top - 30: i0 -= 1  # include the attack
    else:
        i0 = int(np.argmax(e > top - 24))
    i1 = min(len(e), i0 + int(max_len / 0.01))
    live = np.where(e[i0:i1] > top - floor)[0]
    i1 = i0 + (live[-1] + 1 if len(live) else 1)
    return y[max(0, i0 * w - int(SR * 0.004)): i1 * w]

def shape(y, fade_out=0.04, decay=None):
    y = y.copy(); n = len(y)
    fi = int(SR * 0.003); y[:fi] *= np.linspace(0, 1, fi)
    if decay: y *= np.exp(-decay * np.arange(n) / SR)
    fo = min(n // 2, int(SR * fade_out)); y[-fo:] *= np.linspace(1, 0, fo) ** 2
    return y

# name: (max seconds, trim mode, fade-out, extra decay, layer under synth? (render gain, synth gain))
SFX = {
    "wrong": (0.45, "event", 0.08, None, None),
    "nudge": (0.6, "onset", 0.15, 3.0, None),
    "complete": (1.6, "onset", 0.25, None, None),
    "levelup": (2.4, "onset", 0.5, 0.5, None),
    "bell": (3.0, "onset", 0.8, 1.1, None),  # the render sustains; a decay turns it into a struck bowl
    "streak": (1.4, "onset", 0.35, None, None),
    "celebrate": (2.9, "onset", 0.6, None, None),
    "correct": (0.25, "event", 0.06, None, (0.55, 1.0)),
    "xp": (0.3, "event", 0.08, None, (0.35, 1.0)),
    "unlock": (0.2, "onset", 0.05, None, (0.8, 1.0)),
}

# Perceived level per role (RMS of the active part, dBFS): constant sounds sit low, payoffs sit high.
LEVEL = {"tap": -27, "select": -25, "card": -27, "check": -23, "correct": -19, "wrong": -23, "xp": -21, "nudge": -24,
         "complete": -18, "levelup": -17, "bell": -21, "unlock": -18, "streak": -19, "celebrate": -16}

def finish(name, y):
    active = y[np.abs(y) > 10 ** (-50 / 20)]
    rms = np.sqrt(np.mean(active ** 2)) if len(active) else 1e-9
    y = y * (10 ** (LEVEL[name] / 20) / rms)
    # Soft-limit: linear below 0.6, then a tanh knee whose ceiling is 0.84 (≈ −1.5 dBFS, headroom for MP3 overshoot).
    knee, ceil = 0.6, 0.84
    over = np.abs(y) > knee
    y[over] = np.sign(y[over]) * (knee + (ceil - knee) * np.tanh((np.abs(y[over]) - knee) / (ceil - knee)))
    wav = OUT / f"{name}.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "96k", str(OUT / f"{name}.mp3")], check=True)
    wav.unlink()
    return len(y) / SR

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--sfx", type=Path); a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    for name in LEVEL:
        y, src = SYNTH[name](), "synth"
        raw = a.sfx / f"raw-{name}.mp3" if a.sfx else None
        if raw and raw.exists() and name in SFX:
            max_len, mode, fo, decay, layer = SFX[name]
            r = shape(trim(load(raw), max_len, mode), fo, decay)
            r /= np.sqrt(np.mean(r[np.abs(r) > 1e-3] ** 2)) + 1e-9
            if layer:
                s = y / (np.sqrt(np.mean(y[np.abs(y) > 1e-3] ** 2)) + 1e-9)
                y, src = mix([(0, s * layer[1]), (0, r * layer[0])], max(len(s), len(r)) / SR), "synth + higgsfield"
            else:
                y, src = r, "higgsfield"
        print(f"{name:10s} {finish(name, y):4.2f}s  {src}")

if __name__ == "__main__":
    main()
