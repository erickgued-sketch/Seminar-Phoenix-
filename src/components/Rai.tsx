// Rai, the NextMe tiger. Art generated with Higgsfield (see docs/ASSET_LIBRARY.md) from one
// master reference so every state is the same character. Motion (breathing, bounce) is done in
// code so it stays light and respects reduce-motion.
import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { useReduceMotion } from './ui';

const art = {
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
} as const;
export type RaiState = keyof typeof art;

const alt: Record<RaiState, string> = {
  idle: 'Rai', welcome: 'Rai waving', happy: 'Rai smiling', thinking: 'Rai thinking', focus: 'Rai focused', celebrate: 'Rai celebrating',
  levelup: 'Rai holding a star', encouraging: 'Rai giving a thumbs up', breathing: 'Rai meditating', comeback: 'Rai welcoming you back',
};

export function Rai({ state = 'idle', size = 140, breathe }: { state?: RaiState; size?: number; breathe?: number }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  const pop = useState(() => new Animated.Value(0.9))[0];

  useEffect(() => {
    if (reduce) {
      // Reduce Motion: settle at rest, no loops.
      pop.setValue(1);
      a.setValue(0);
      return;
    }
    // Idle "breathing": slow for calm states, quicker bounce for celebrations.
    const period = breathe ?? (state === 'celebrate' || state === 'levelup' ? 520 : 2200);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
    return () => loop.stop();
  }, [state, reduce, breathe]); // eslint-disable-line react-hooks/exhaustive-deps

  const lively = state === 'celebrate' || state === 'levelup';
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: breathe ? [0.92, 1.06] : [1, 1.03] });
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [0, lively ? -10 : -3] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', bottom: size * 0.02, width: size * 0.5, height: size * 0.07, borderRadius: size, backgroundColor: colors.primaryEdge, opacity: 0.14 }} />
      <Animated.View style={{ transform: [{ scale: Animated.multiply(pop, scale) }, { translateY }] }}>
        <Image source={art[state]} accessibilityRole="image" accessibilityLabel={alt[state]} style={{ width: size, height: size }} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

/** Rai next to a speech bubble. */
export function RaiSays({ state, children, size = 96 }: { state?: RaiState; children: React.ReactNode; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Rai state={state} size={size} />
      <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 20, borderBottomLeftRadius: 6, padding: 14, borderWidth: 2, borderColor: colors.line }}>{children}</View>
    </View>
  );
}
