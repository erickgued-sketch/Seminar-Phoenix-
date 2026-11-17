// Motion effects: confetti, shake, pop, count-up. All of them render their end state
// immediately when the OS "Reduce Motion" setting is on.
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';
import { Txt, useReduceMotion } from './ui';

const PALETTE = [colors.primary, colors.success, colors.info, colors.gold, colors.danger, colors.violet];

/** A burst of confetti that fans out from the top-centre and falls. Remount (change `k`) to replay. */
export function Confetti({ k, count = 36 }: { k: string | number; count?: number }) {
  const reduce = useReduceMotion();
  const t = useState(() => new Animated.Value(0))[0];
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Deterministic pseudo-random layout so renders are stable.
        const r = (n: number) => ((Math.sin((i + 1) * 12.9898 * n) * 43758.5453) % 1 + 1) % 1;
        return { x: (r(1) - 0.5) * 340, y: 260 + r(2) * 420, rot: (r(3) - 0.5) * 900, size: 7 + r(4) * 8, color: PALETTE[i % PALETTE.length], delay: r(5) * 0.25, round: i % 3 === 0 };
      }),
    [count],
  );
  useEffect(() => {
    if (reduce) return;
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: 1900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [k, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  if (reduce) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {pieces.map((p, i) => {
        const prog = t.interpolate({ inputRange: [p.delay, 1], outputRange: [0, 1], extrapolate: 'clamp' });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute', top: 90, left: '50%', width: p.size, height: p.round ? p.size : p.size * 0.5, borderRadius: p.round ? p.size : 2, backgroundColor: p.color,
              opacity: t.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateX: prog.interpolate({ inputRange: [0, 1], outputRange: [0, p.x] }) },
                { translateY: prog.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, -70, p.y] }) },
                { rotate: prog.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] }) },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

/** Horizontal shake when `n` changes (wrong answer) and a springy pop when `pop` changes (right answer). */
export function Feedback({ shake = 0, pop = 0, children, style }: { shake?: number; pop?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const x = useState(() => new Animated.Value(0))[0];
  const s = useState(() => new Animated.Value(1))[0];
  useEffect(() => {
    if (!shake || reduce) return;
    Animated.sequence([-9, 9, -6, 6, -3, 0].map((v) => Animated.timing(x, { toValue: v, duration: 55, useNativeDriver: true }))).start();
  }, [shake, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pop || reduce) return;
    s.setValue(0.94);
    Animated.spring(s, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
  }, [pop, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={[style, { transform: [{ translateX: x }, { scale: s }] }]}>{children}</Animated.View>;
}

/** Number that counts up to `to` (e.g. XP earned). */
export function CountUp({ to, prefix = '', duration = 900, style, color }: { to: number; prefix?: string; duration?: number; style?: StyleProp<TextStyle>; color?: string }) {
  const reduce = useReduceMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p === 1) clearInterval(id);
    }, 33);
    return () => clearInterval(id);
  }, [to, duration, reduce]);
  return <Txt v="h2" color={color} style={style}>{prefix}{reduce ? to : n}</Txt>;
}

/** Slides content in from the side it logically comes from (next = from the right). */
export function Slide({ k, dir = 1, children }: { k: string | number; dir?: 1 | -1; children: React.ReactNode }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    a.setValue(reduce ? 1 : 0);
    if (!reduce) Animated.spring(a, { toValue: 1, friction: 9, tension: 70, useNativeDriver: true }).start();
  }, [k, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={{ opacity: a.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }), transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [46 * dir, 0] }) }, { scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
      {children}
    </Animated.View>
  );
}

/** Gentle endless pulse for the thing you want tapped next. */
export function Pulse({ children, on = true, scale = 1.04 }: { children: React.ReactNode; on?: boolean; scale?: number }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (!on || reduce) { a.setValue(0); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [on, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={{ transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, scale] }) }] }}>{children}</Animated.View>;
}

/** Slow rotating sunburst behind a hero illustration (completion moments). Static under Reduce Motion. */
export function Rays({ size = 320, color = colors.gold }: { size?: number; color?: string }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  const grow = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (reduce) { grow.setValue(1); return; }
    Animated.spring(grow, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }).start();
    const loop = Animated.loop(Animated.timing(a, { toValue: 1, duration: 16000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center', opacity: grow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }), transform: [{ scale: grow }, { rotate: a.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
      {Array.from({ length: 12 }, (_, i) => (
        <View key={i} style={{ position: 'absolute', width: size * 0.07, height: size, alignItems: 'center', transform: [{ rotate: `${i * 30}deg` }] }}>
          <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.035, borderRightWidth: size * 0.035, borderBottomWidth: size * 0.5, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, transform: [{ rotate: '180deg' }] }} />
        </View>
      ))}
    </Animated.View>
  );
}

/** Scale-in with overshoot, optionally delayed — for staged reveals (stats, badges). */
export function PopIn({ children, delay = 0, k, style }: { children: React.ReactNode; delay?: number; k?: string | number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    a.setValue(reduce ? 1 : 0);
    if (!reduce) Animated.sequence([Animated.delay(delay), Animated.spring(a, { toValue: 1, friction: 5, tension: 130, useNativeDriver: true })]).start();
  }, [k, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={[style, { opacity: a.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }), transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}>{children}</Animated.View>;
}

/** Gentle vertical float for illustrations. */
export function Float({ children, range = 5, period = 2600 }: { children: React.ReactNode; range?: number; period?: number }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (reduce) { a.setValue(0); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [reduce, period]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={{ transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -range] }) }] }}>{children}</Animated.View>;
}
