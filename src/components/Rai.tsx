// Rai, the NextMe tiger. All art was generated with Higgsfield from one master reference
// (docs/ASSET_LIBRARY.md) so every state is the same character.
// Each state has a looping frame animation (animated WebP) and a still image; the still is
// used when the OS "Reduce Motion" setting is on.
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { colors, elevation } from '@/theme/tokens';
import { useReduceMotion } from './ui';

const still = {
  idle: require('../../assets/rai/idle.webp'),
  welcome: require('../../assets/rai/welcome.webp'),
  happy: require('../../assets/rai/happy.webp'),
  thinking: require('../../assets/rai/thinking.webp'),
  focus: require('../../assets/rai/focus.webp'),
  celebrate: require('../../assets/rai/celebrate.webp'),
  levelup: require('../../assets/rai/levelup.webp'),
  encouraging: require('../../assets/rai/encouraging.webp'),
  breathing: require('../../assets/rai/breathing.webp'),
  comeback: require('../../assets/rai/comeback.webp'),
  cheer: require('../../assets/rai/point.webp'),
  walk: require('../../assets/rai/idle.webp'),
} as const;
export type RaiState = keyof typeof still;

const anim: Partial<Record<RaiState, number>> = {
  idle: require('../../assets/rai/anim/idle.webp'),
  welcome: require('../../assets/rai/anim/wave.webp'),
  happy: require('../../assets/rai/anim/clap.webp'),
  thinking: require('../../assets/rai/anim/thinking.webp'),
  celebrate: require('../../assets/rai/anim/celebrate.webp'),
  levelup: require('../../assets/rai/anim/levelup.webp'),
  breathing: require('../../assets/rai/anim/breathing.webp'),
  cheer: require('../../assets/rai/anim/cheer.webp'),
  walk: require('../../assets/rai/anim/walk.webp'),
};

const alt: Record<RaiState, string> = {
  idle: 'Rai', welcome: 'Rai waving', happy: 'Rai clapping', thinking: 'Rai thinking', focus: 'Rai focused', celebrate: 'Rai celebrating',
  levelup: 'Rai holding a star', encouraging: 'Rai giving a thumbs up', breathing: 'Rai meditating', comeback: 'Rai welcoming you back',
  cheer: 'Rai cheering you on', walk: 'Rai walking forward',
};

export function Rai({ state = 'idle', size = 140, breathe }: { state?: RaiState; size?: number; breathe?: number }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  const pop = useState(() => new Animated.Value(0.9))[0];
  const animated = !reduce && anim[state] !== undefined;

  useEffect(() => {
    if (reduce) {
      // Reduce Motion: settle at rest, no loops.
      pop.setValue(1);
      a.setValue(0);
      return;
    }
    // Frame animations already move; stills get a soft code-driven bob so nothing is ever frozen.
    const period = breathe ?? 2200;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    pop.setValue(0.82);
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    return () => loop.stop();
  }, [state, reduce, breathe]); // eslint-disable-line react-hooks/exhaustive-deps

  const scale = a.interpolate({ inputRange: [0, 1], outputRange: breathe ? [0.94, 1.05] : animated ? [1, 1] : [1, 1.03] });
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [0, animated ? 0 : -4] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', bottom: size * 0.03, width: size * 0.46, height: size * 0.06, borderRadius: size, backgroundColor: colors.primaryEdge, opacity: 0.14 }} />
      <Animated.View style={{ transform: [{ scale: Animated.multiply(pop, scale) }, { translateY }] }}>
        <Image
          source={animated ? anim[state] : still[state]}
          autoplay
          contentFit="contain"
          accessibilityRole="image"
          accessibilityLabel={alt[state]}
          style={{ width: size, height: size }}
        />
      </Animated.View>
    </View>
  );
}

/** Rai next to a speech bubble. */
export function RaiSays({ state, children, size = 96 }: { state?: RaiState; children: React.ReactNode; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Rai state={state} size={size} />
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', left: -6, bottom: 18, width: 16, height: 16, borderRadius: 4, backgroundColor: colors.surface, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: colors.line, transform: [{ rotate: '45deg' }] }} />
        <View style={{ backgroundColor: colors.surface, borderRadius: 22, padding: 14, borderWidth: 1, borderColor: colors.line, ...elevation(1) }}>{children}</View>
        <View style={{ position: 'absolute', left: -5, bottom: 19, width: 14, height: 14, borderRadius: 3, backgroundColor: colors.surface, transform: [{ rotate: '45deg' }] }} />
      </View>
    </View>
  );
}
