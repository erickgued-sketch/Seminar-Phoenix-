// The 3D illustration set: one family, generated with Higgsfield from a single style anchor
// (docs/ASSET_LIBRARY.md). Used wherever the interface needs a picture; glyphs live in <Icon />.
import { Image } from 'expo-image';
import React from 'react';

const art = {
  meditation: require('../../assets/icons/meditation.webp'),
  gratitude: require('../../assets/icons/gratitude.webp'),
  breathing: require('../../assets/icons/breathing.webp'),
  silence: require('../../assets/icons/silence.webp'),
  affirmations: require('../../assets/icons/affirmations.webp'),
  visualization: require('../../assets/icons/visualization.webp'),
  worry: require('../../assets/icons/worry.webp'),
  beliefs: require('../../assets/icons/beliefs.webp'),
  seven: require('../../assets/icons/seven.webp'),
  mindstorm: require('../../assets/icons/mindstorm.webp'),
  forgive: require('../../assets/icons/forgive.webp'),
  responsible: require('../../assets/icons/responsible.webp'),
  'written-goals': require('../../assets/icons/written-goals.webp'),
  'mental-diet': require('../../assets/icons/mental-diet.webp'),
  goal: require('../../assets/icons/goal.webp'),
  habits: require('../../assets/icons/habits.webp'),
  review: require('../../assets/icons/review.webp'),
  future: require('../../assets/icons/future.webp'),
  vault: require('../../assets/icons/vault.webp'),
  evening: require('../../assets/icons/evening.webp'),
  flame: require('../../assets/icons/flame.webp'),
  trophy: require('../../assets/icons/trophy.webp'),
  gem: require('../../assets/icons/gem.webp'),
  focus: require('../../assets/icons/focus.webp'),
  shield: require('../../assets/icons/shield.webp'),
  star: require('../../assets/icons/star.webp'),
} as const;

export type ArtName = keyof typeof art;
export const hasArt = (name: string): name is ArtName => name in art;

/** Decorative by default (hidden from screen readers); pass `label` when it carries meaning. */
export function Art({ name, size = 48, label }: { name: ArtName; size?: number; label?: string }) {
  return (
    <Image
      source={art[name]}
      contentFit="contain"
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no'}
      style={{ width: size, height: size }}
    />
  );
}
