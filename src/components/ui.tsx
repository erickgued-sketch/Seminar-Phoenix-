// Reusable UI primitives (design system v2). Colours, depth, type, space and motion come from the
// theme tokens; styles are built per colour scheme, so every primitive works in light and dark.
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Art, type ArtName } from '@/components/Art';
import { Icon, type IconName } from '@/components/Icon';
import { play, type SoundName } from '@/lib/sound';
import { colors, elevation, motion, radius, space, themed, type } from '@/theme/tokens';

export const haptic = (kind: 'tap' | 'ok' | 'bad' = 'tap') => {
  if (Platform.OS === 'web') return;
  if (kind === 'tap') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  else Haptics.notificationAsync(kind === 'ok' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
};

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

type Variant = keyof typeof type;
export function Txt({ v = 'body', color = colors.text, center, style, ...p }: TextProps & { v?: Variant; color?: string; center?: boolean }) {
  return <Text {...p} accessibilityRole={v === 'hero' || v === 'h1' || v === 'h2' ? 'header' : p.accessibilityRole} style={[type[v] as TextStyle, { color }, center && { textAlign: 'center' }, style]} />;
}

const S = themed(() => ({
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', flexGrow: 1 } as ViewStyle,
  innerFixed: { flex: 1, minHeight: 0 } as ViewStyle,
  bloom: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 } as ViewStyle,
  footer: { paddingHorizontal: space.md, paddingTop: space.sm + 4, paddingBottom: space.md, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.line } as ViewStyle,
  footerInner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.sm } as ViewStyle,
  btnEdge: { borderRadius: radius.md, paddingBottom: 5 } as ViewStyle,
  btn: { minHeight: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: space.lg, overflow: 'hidden' } as ViewStyle,
  btnSmall: { minHeight: 44, paddingHorizontal: space.md } as ViewStyle,
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, height: '52%', backgroundColor: colors.gloss } as ViewStyle,
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md + 4, borderWidth: 1, borderColor: colors.line } as ViewStyle,
  chip: { minHeight: 44, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', gap: 6 } as ViewStyle,
  chipOn: { backgroundColor: colors.primarySoft, borderColor: colors.primary } as ViewStyle,
  input: { ...(type.body as TextStyle), color: colors.text, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 12, minHeight: 50 } as TextStyle,
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, minHeight: 56 } as ViewStyle,
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line } as ViewStyle,
  seg: { flexDirection: 'row', backgroundColor: colors.sunken, borderRadius: radius.md, padding: 4, gap: 4 } as ViewStyle,
  segItem: { flex: 1, minHeight: 40, borderRadius: radius.md - 4, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 8 } as ViewStyle,
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.pill, paddingLeft: 8, paddingRight: 12, minHeight: 36, borderWidth: 1, borderColor: colors.line } as ViewStyle,
  tile: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
}));

/** Page scaffold: warm ground with a soft bloom, safe areas, centred max width for tablets/web. */
export function Screen({ children, scroll = true, pad = true, footer, edges = ['top'], tint, footerBg }: { children: React.ReactNode; scroll?: boolean; pad?: boolean; footer?: React.ReactNode; edges?: ('top' | 'bottom')[]; tint?: string; footerBg?: string }) {
  const s = S();
  // A non-scrolling screen must be height-bounded (flex: 1 + minHeight: 0); otherwise an inner list grows with its
  // content, pushes the footer off-screen and nothing can scroll.
  const body = <View style={[s.inner, !scroll && s.innerFixed, pad && { paddingHorizontal: space.md }]}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={[tint ?? colors.bgBloom, colors.bg]} style={s.bloom} pointerEvents="none" />
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <ScrollView contentContainerStyle={{ paddingBottom: space.xl, flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {body}
            </ScrollView>
          ) : body}
          {footer ? (
            <SafeAreaView edges={['bottom']} style={[s.footer, footerBg ? { backgroundColor: footerBg, borderTopColor: footerBg } : null]}>
              <View style={s.footerInner}>{footer}</View>
            </SafeAreaView>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type BtnKind = 'primary' | 'success' | 'ghost' | 'info' | 'danger';
const btnColors = (k: BtnKind) =>
  ({
    primary: { bg: colors.primary, edge: colors.primaryEdge, fg: colors.onPrimary },
    success: { bg: colors.success, edge: colors.successEdge, fg: colors.onSuccess },
    info: { bg: colors.info, edge: colors.infoEdge, fg: colors.onInfo },
    danger: { bg: colors.dangerSoft, edge: colors.dangerLine, fg: colors.dangerDeep },
    ghost: { bg: colors.surface, edge: colors.lineStrong, fg: colors.text },
  })[k];

/** Chunky button that physically depresses on press. */
export function Button({ label, onPress, kind = 'primary', disabled, small, style, testID, sound = 'tap', icon, iconRight, a11y }: { label: string; onPress: () => void; kind?: BtnKind; disabled?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; testID?: string; sound?: SoundName | null; icon?: IconName; iconRight?: IconName; a11y?: string }) {
  const s = S();
  const y = useState(() => new Animated.Value(0))[0];
  const c = btnColors(kind);
  const to = (v: number) => Animated.timing(y, { toValue: v, duration: motion.press, useNativeDriver: true }).start();
  const solid = kind !== 'ghost' && kind !== 'danger';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={a11y ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={() => to(5)}
      onPressOut={() => to(0)}
      onPress={() => { haptic(); if (sound) play(sound, 0.6); onPress(); }}
      style={[{ opacity: disabled ? 0.42 : 1 }, style]}
    >
      <View style={[s.btnEdge, { backgroundColor: c.edge }]}>
        <Animated.View style={[s.btn, small && s.btnSmall, { backgroundColor: c.bg, transform: [{ translateY: y }] }, !solid && { borderWidth: 2, borderColor: c.edge }]}>
          {solid ? <View style={s.gloss} pointerEvents="none" /> : null}
          {icon ? <Icon name={icon} color={c.fg} size={small ? 18 : 20} weight={2.4} /> : null}
          {label ? <Txt v="h3" color={c.fg} center style={small && { fontSize: 15 }}>{label}</Txt> : null}
          {iconRight ? <Icon name={iconRight} color={c.fg} size={small ? 18 : 20} weight={2.4} /> : null}
        </Animated.View>
      </View>
    </Pressable>
  );
}

/** Round icon-only control (44 pt target). */
export function IconButton({ icon, onPress, label, testID, color, plain }: { icon: IconName; onPress: () => void; label: string; testID?: string; color?: string; plain?: boolean }) {
  const s = S();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} onPress={() => { haptic(); onPress(); }} style={({ pressed }) => [plain ? { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' } : s.round, pressed && { opacity: 0.6 }]}>
      <Icon name={icon} color={color ?? colors.text2} size={22} weight={2.4} />
    </Pressable>
  );
}

type Tone = 'surface' | 'alt' | 'sunken' | 'primary' | 'success' | 'info' | 'night';
const tones = (t: Tone): ViewStyle =>
  ({
    surface: {},
    alt: { backgroundColor: colors.surfaceAlt, borderColor: colors.surfaceAlt },
    sunken: { backgroundColor: colors.sunken, borderColor: colors.sunken },
    primary: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
    success: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
    info: { backgroundColor: colors.infoSoft, borderColor: colors.infoSoft },
    night: { backgroundColor: colors.night, borderColor: colors.night },
  })[t];

/** Surface. `level` sets depth by role: 0 flat, 1 actionable (default), 2 floating. */
export function Card({ children, style, onPress, label, testID, level = 1, tone = 'surface' }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string; testID?: string; level?: 0 | 1 | 2; tone?: Tone }) {
  const s = S();
  const scale = useState(() => new Animated.Value(1))[0];
  const base = [s.card, elevation(tone === 'surface' ? level : 0), tones(tone), style];
  if (!onPress) return <View testID={testID} style={base}>{children}</View>;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, ...motion.spring.snappy }).start();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPressIn={() => to(0.975)} onPressOut={() => to(1)} onPress={() => { haptic(); onPress(); }}>
      <Animated.View style={[base, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, testID, icon }: { label: string; selected?: boolean; onPress: () => void; testID?: string; icon?: IconName }) {
  const s = S();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={() => { haptic(); play('select', 0.5); onPress(); }} style={({ pressed }) => [s.chip, selected && s.chipOn, pressed && { opacity: 0.75 }]}>
      {icon ? <Icon name={icon} color={selected ? colors.primaryDeep : colors.text2} size={18} weight={2.4} /> : null}
      <Txt v="bodyBold" color={selected ? colors.text : colors.text} style={{ flexShrink: 1 }}>{label}</Txt>
    </Pressable>
  );
}

/** Segmented control for a small set of exclusive options. */
export function Segment<T extends string | number>({ options, value, onChange, testID }: { options: { value: T; label: string; icon?: IconName }[]; value: T; onChange: (v: T) => void; testID?: string }) {
  const s = S();
  return (
    <View style={s.seg} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={String(o.value)} testID={testID ? `${testID}-${o.value}` : undefined} accessibilityRole="tab" accessibilityLabel={o.label} accessibilityState={{ selected: on }} onPress={() => { if (on) return; haptic(); play('select', 0.5); onChange(o.value); }} style={[s.segItem, on && { backgroundColor: colors.surface, ...elevation(1) }]}>
            {o.icon ? <Icon name={o.icon} color={on ? colors.primaryDeep : colors.text3} size={17} weight={2.4} /> : null}
            <Txt v="bodyBold" color={on ? colors.text : colors.text2} style={{ fontSize: 14.5 }} numberOfLines={1}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Settings switch row: label, optional hint, animated track. */
export function Toggle({ label, hint, value, onChange, testID, icon }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void; testID?: string; icon?: IconName }) {
  const reduce = useReduceMotion();
  const x = useState(() => new Animated.Value(value ? 1 : 0))[0];
  useEffect(() => {
    if (reduce) x.setValue(value ? 1 : 0);
    else Animated.spring(x, { toValue: value ? 1 : 0, useNativeDriver: true, ...motion.spring.snappy }).start();
  }, [value, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Pressable testID={testID} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => { haptic(); play('select', 0.5); onChange(!value); }} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 4, minHeight: 48 }}>
      {icon ? <Icon name={icon} color={colors.text2} size={22} /> : null}
      <View style={{ flex: 1 }}>
        <Txt v="bodyBold">{label}</Txt>
        {hint ? <Txt v="small" color={colors.text2}>{hint}</Txt> : null}
      </View>
      <View style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: value ? colors.success : colors.locked, padding: 3 }}>
        <Animated.View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.knob, ...elevation(1), transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }} />
      </View>
    </Pressable>
  );
}

export function Bar({ value, color = colors.primary, height = 12 }: { value: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value));
  const reduce = useReduceMotion();
  const w = useState(() => new Animated.Value(pct))[0];
  useEffect(() => {
    if (reduce) w.setValue(pct);
    else Animated.spring(w, { toValue: pct, friction: 9, tension: 60, useNativeDriver: false }).start(); // width cannot use the native driver
  }, [pct, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }} style={{ height, borderRadius: height, backgroundColor: colors.line, overflow: 'hidden' }}>
      <Animated.View style={{ width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), height, borderRadius: height, backgroundColor: color }}>
        <View style={{ position: 'absolute', top: 2, left: 6, right: 6, height: Math.max(2, height * 0.22), borderRadius: height, backgroundColor: colors.gloss }} />
      </Animated.View>
    </View>
  );
}

export function Field({ label, style, onFocus, onBlur, ...p }: TextInputProps & { label?: string }) {
  const s = S();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Txt v="label" color={colors.text2}>{label.toUpperCase()}</Txt> : null}
      <TextInput
        accessibilityLabel={label ?? p.placeholder}
        placeholderTextColor={colors.text3}
        selectionColor={colors.primary}
        {...p}
        onFocus={(e) => { setFocus(true); onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); onBlur?.(e); }}
        style={[s.input, p.multiline && { minHeight: 92, textAlignVertical: 'top' }, focus && { borderColor: colors.primary }, style]}
      />
    </View>
  );
}

export function Header({ title, back = true, right }: { title: string; back?: boolean; right?: React.ReactNode }) {
  const s = S();
  return (
    <View style={s.header}>
      {back ? <IconButton icon="back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/today'))} /> : null}
      <Txt v="h2" style={{ flex: 1 }} numberOfLines={1}>{title}</Txt>
      {right}
    </View>
  );
}

export function Label({ children, color = colors.primaryDeep }: { children: string; color?: string }) {
  return <Txt v="label" color={color}>{children.toUpperCase()}</Txt>;
}

/** Fade + rise entrance; instant when the OS asks for reduced motion. `i` staggers siblings. */
export function Enter({ children, delay = 0, k, i = 0, style }: { children: React.ReactNode; delay?: number; k?: string | number; i?: number; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    a.setValue(reduce ? 1 : 0);
    if (!reduce) Animated.timing(a, { toValue: 1, duration: motion.enter, delay: delay + Math.min(i, 8) * 55, useNativeDriver: true }).start();
  }, [k, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={[{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }, style]}>{children}</Animated.View>;
}

/** Soft tinted square that carries a 3D illustration or a glyph. */
export function Tile({ art, icon, size = 52, tone = 'alt', color }: { art?: ArtName; icon?: IconName; size?: number; tone?: Tone; color?: string }) {
  const s = S();
  return (
    <View style={[s.tile, { width: size, height: size, backgroundColor: colors.surfaceAlt }, tones(tone)]}>
      {art ? <Art name={art} size={size * 0.78} /> : icon ? <Icon name={icon} color={color ?? colors.primaryDeep} size={size * 0.5} weight={2.3} /> : null}
    </View>
  );
}

/** Navigation row: illustration, title, optional detail, chevron. */
export function ListRow({ art, icon, title, sub, meta, onPress, testID, right, done }: { art?: ArtName; icon?: IconName; title: string; sub?: string; meta?: string; onPress?: () => void; testID?: string; right?: React.ReactNode; done?: boolean }) {
  return (
    <Card testID={testID} onPress={onPress} label={title} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.sm + 4 }}>
      <View>
        <Tile art={art} icon={icon} />
        {done ? <View style={{ position: 'absolute', right: -6, bottom: -6 }}><Check on size={22} /></View> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="h3">{title}</Txt>
        {sub ? <Txt v="small" color={colors.text2} numberOfLines={2}>{sub}</Txt> : null}
        {meta ? <Txt v="label" color={colors.primaryDeep} style={{ marginTop: 2 }}>{meta.toUpperCase()}</Txt> : null}
      </View>
      {right ?? (onPress ? <Icon name="next" color={colors.text3} size={20} weight={2.6} /> : null)}
    </Card>
  );
}

/** Checkbox mark with a small pop when it turns on. */
export function Check({ on, size = 28 }: { on: boolean; size?: number }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(on ? 1 : 0))[0];
  useEffect(() => {
    if (reduce || !on) a.setValue(on ? 1 : 0);
    else { a.setValue(0.4); Animated.spring(a, { toValue: 1, useNativeDriver: true, ...motion.spring.bouncy }).start(); }
  }, [on, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={{ width: size, height: size, borderRadius: size * 0.34, borderWidth: 2, borderColor: on ? colors.success : colors.lineStrong, backgroundColor: on ? colors.success : colors.surface, alignItems: 'center', justifyContent: 'center', transform: [{ scale: on ? a : 1 }] }}>
      {on ? <Icon name="check" color={colors.onSuccess} size={size * 0.64} weight={3.2} /> : null}
    </Animated.View>
  );
}

/** Compact stat: 3D mark or glyph + value. */
export function Pill({ art, icon, value, label, color }: { art?: ArtName; icon?: IconName; value: string | number; label: string; color?: string }) {
  const s = S();
  return (
    <View style={s.pill} accessible accessibilityLabel={label}>
      {art ? <Art name={art} size={24} /> : icon ? <Icon name={icon} color={color ?? colors.primaryDeep} size={18} weight={2.4} filled /> : null}
      <Txt v="bodyBold" style={{ fontFamily: type.h3.fontFamily }}>{value}</Txt>
    </View>
  );
}

/** Small inline note with an info glyph (caveats, privacy, honesty labels). */
export function Note({ children, color = colors.text2 }: { children: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <View style={{ marginTop: 2 }}><Icon name="info" color={color} size={16} weight={2.2} /></View>
      <Txt v="small" color={color} style={{ flex: 1 }}>{children}</Txt>
    </View>
  );
}

export function Empty({ art, title, body }: { art: ArtName; title: string; body: string }) {
  return (
    <View style={{ alignItems: 'center', padding: space.lg, gap: space.sm }}>
      <Art name={art} size={88} />
      <Txt v="h3" center>{title}</Txt>
      <Txt v="small" color={colors.text2} center>{body}</Txt>
    </View>
  );
}
