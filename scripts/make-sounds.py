"""Synthesises the app's UI sounds (original, no samples). Run: python3 scripts/make-sounds.py
Warm marimba/bell tones in a major pentatonic so every sound belongs to the same family."""
import subprocess, wave
from pathlib import Path
import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "assets" / "sounds"
OUT.mkdir(parents=True, exist_ok=True)
NOTE = {"C5": 523.25, "D5": 587.33, "E5": 659.25, "G5": 783.99, "A5": 880.0, "C6": 1046.5, "E6": 1318.5, "G6": 1568.0, "G4": 392.0, "E4": 329.63, "C4": 261.63, "A3": 220.0}

def tone(freq, dur, decay=6.0, harmonics=((1, 1.0), (2, 0.35), (4, 0.12)), attack=0.004):
    t = np.arange(int(SR * dur)) / SR
    y = sum(a * np.sin(2 * np.pi * freq * h * t) for h, a in harmonics)
    env = np.exp(-decay * t) * np.minimum(1, t / attack)
    return y * env

def mix(parts, total):
    out = np.zeros(int(SR * total))
    for start, y in parts:
        i = int(SR * start)
        out[i:i + len(y)] += y[: len(out) - i]
    return out

def save(name, y, gain=0.8):
    y = y / (np.max(np.abs(y)) + 1e-9) * gain
    fade = int(SR * 0.01)
    y[-fade:] *= np.linspace(1, 0, fade)
    wav = OUT / f"{name}.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "96k", str(OUT / f"{name}.mp3")], check=True)
    wav.unlink()

def noise_pop(dur=0.05, freq=900):
    t = np.arange(int(SR * dur)) / SR
    return np.sin(2 * np.pi * freq * t * np.exp(-18 * t)) * np.exp(-60 * t)

save("tap", noise_pop(0.05, 1100), 0.45)
save("select", tone(NOTE["E5"], 0.12, 28), 0.5)
save("card", mix([(0, tone(NOTE["G4"], 0.16, 22)), (0.04, tone(NOTE["C5"], 0.16, 22))], 0.22), 0.5)
save("correct", mix([(0, tone(NOTE["E5"], 0.35, 9)), (0.09, tone(NOTE["A5"], 0.5, 7)), (0.09, tone(NOTE["C6"], 0.5, 8) * 0.5)], 0.62))
save("wrong", mix([(0, tone(NOTE["E4"], 0.3, 10, ((1, 1.0), (2, 0.2)))), (0.11, tone(NOTE["C4"], 0.4, 9, ((1, 1.0), (2, 0.2))))], 0.52), 0.6)
save("check", mix([(0, noise_pop(0.04, 1400)), (0.02, tone(NOTE["C6"], 0.25, 14))], 0.3), 0.6)
save("xp", mix([(i * 0.055, tone(f, 0.22, 14) * 0.8) for i, f in enumerate([NOTE["C6"], NOTE["E6"], NOTE["G6"]])], 0.4), 0.55)
save("complete", mix([(0.0, tone(NOTE["C5"], 0.5, 6)), (0.12, tone(NOTE["E5"], 0.5, 6)), (0.24, tone(NOTE["G5"], 0.5, 6)),
                      (0.38, tone(NOTE["C6"], 1.1, 3.2)), (0.38, tone(NOTE["E6"], 1.1, 3.6) * 0.6), (0.38, tone(NOTE["G5"], 1.1, 3.2) * 0.5)], 1.5))
save("levelup", mix([(0.0, tone(NOTE["G4"], 0.4, 7)), (0.1, tone(NOTE["C5"], 0.4, 7)), (0.2, tone(NOTE["E5"], 0.4, 7)), (0.3, tone(NOTE["G5"], 0.4, 7)),
                     (0.44, tone(NOTE["C6"], 1.4, 2.6)), (0.44, tone(NOTE["E6"], 1.4, 2.8) * 0.7), (0.44, tone(NOTE["G6"], 1.4, 3.2) * 0.45),
                     (0.74, tone(NOTE["G6"], 0.9, 4) * 0.35)], 1.9))
save("bell", tone(NOTE["A3"] * 2, 2.4, 1.6, ((1, 1.0), (2.76, 0.45), (5.4, 0.25), (8.9, 0.1))), 0.6)
save("nudge", mix([(0, tone(NOTE["G5"], 0.2, 14)), (0.1, tone(NOTE["C6"], 0.3, 11))], 0.42), 0.5)
print(sorted(p.name for p in OUT.glob("*.mp3")))
