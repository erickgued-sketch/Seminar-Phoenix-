// UI sounds (Sound 2.0, built by scripts/make-sounds.py: synthesised micro-sounds + Higgsfield moment sounds).
// Players are created lazily and reused.
// Every call is best-effort: a missing audio backend must never break a tap.
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useStore } from './store';

const files = {
  tap: require('../../assets/sounds/tap.mp3'),
  select: require('../../assets/sounds/select.mp3'),
  card: require('../../assets/sounds/card.mp3'),
  correct: require('../../assets/sounds/correct.mp3'),
  wrong: require('../../assets/sounds/wrong.mp3'),
  check: require('../../assets/sounds/check.mp3'),
  xp: require('../../assets/sounds/xp.mp3'),
  complete: require('../../assets/sounds/complete.mp3'),
  levelup: require('../../assets/sounds/levelup.mp3'),
  bell: require('../../assets/sounds/bell.mp3'),
  nudge: require('../../assets/sounds/nudge.mp3'),
  unlock: require('../../assets/sounds/unlock.mp3'),
  streak: require('../../assets/sounds/streak.mp3'),
  celebrate: require('../../assets/sounds/celebrate.mp3'),
} as const;
export type SoundName = keyof typeof files;

const players: Partial<Record<SoundName, AudioPlayer>> = {};

export function play(name: SoundName, volume = 1): void {
  if (useStore.getState().profile.sound === false) return;
  try {
    const p = players[name] ?? (players[name] = createAudioPlayer(files[name]));
    p.volume = volume;
    p.seekTo(0);
    p.play();
  } catch {
    // no audio available (e.g. blocked autoplay before the first tap) — stay silent
  }
}
