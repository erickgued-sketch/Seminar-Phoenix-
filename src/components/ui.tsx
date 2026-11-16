// Reusable UI primitives. All colors/spacing come from theme tokens.
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo, Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type TextProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, motion, radius, shadow, space, type } from '@/theme/tokens';

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

/** Page scaffold: cream background with a soft warm bloom, safe areas, centered max width for tablets/web. */
export function Screen({ children, scroll = true, pad = true, footer, edges = ['top'] }: { children: React.ReactNode; scroll?: boolean; pad?: boolean; footer?: React.ReactNode; edges?: ('top' | 'bottom')[] }) {
  const body = <View style={[styles.inner, pad && { paddingHorizontal: space.md }]}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={['#FFE8CC', colors.bg]} style={styles.bloom} pointerEvents="none" />
      <SafeAreaView style={{ flex: 1 }} edges={footer ? [...edges, 'bottom'] : edges}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <ScrollView contentContainerStyle={{ paddingBottom: space.xl, flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {body}
            </ScrollView>
          ) : body}
          {footer ? <View style={styles.footer}><View style={styles.footerInner}>{footer}</View></View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type BtnKind = 'primary' | 'success' | 'ghost' | 'info' | 'danger';
const btnColors: Record<BtnKind, { bg: string; edge: string; fg: string }> = {
  primary: { bg: colors.primary, edge: colors.primaryEdge, fg: colors.onPrimary },
  success: { bg: colors.success, edge: colors.successDeep, fg: '#173B00' },
  info: { bg: colors.info, edge: colors.infoDeep, fg: '#04283B' },
  danger: { bg: colors.dangerSoft, edge: '#F3BDBD', fg: colors.dangerDeep },
  ghost: { bg: colors.surface, edge: colors.line, fg: colors.text },
};

/** Chunky button that physically depresses on press. */
export function Button({ label, onPress, kind = 'primary', disabled, small, style, testID }: { label: string; onPress: () => void; kind?: BtnKind; disabled?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; testID?: string }) {
  const y = useState(() => new Animated.Value(0))[0];
  const c = btnColors[kind];
  const to = (v: number) => Animated.timing(y, { toValue: v, duration: motion.press, useNativeDriver: true }).start();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={() => to(4)}
      onPressOut={() => to(0)}
      onPress={() => { haptic(); onPress(); }}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
    >
      <View style={[styles.btnEdge, { backgroundColor: c.edge }]}>
        <Animated.View style={[styles.btn, small && styles.btnSmall, { backgroundColor: c.bg, transform: [{ translateY: y }] }, kind === 'ghost' && { borderWidth: 2, borderColor: colors.line }]}>
          <Txt v="h3" color={c.fg} center style={small && { fontSize: 15 }}>{label}</Txt>
        </Animated.View>
      </View>
    </Pressable>
  );
}

export function Card({ children, style, onPress, label, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; label?: string; testID?: string }) {
  if (!onPress) return <View style={[styles.card, style]}>{children}</View>;
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={() => { haptic(); onPress(); }} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.985 }] }, style]}>
      {children}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, testID }: { label: string; selected?: boolean; onPress: () => void; testID?: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={() => { haptic(); onPress(); }} style={[styles.chip, selected && styles.chipOn]}>
      <Txt v="bodyBold" color={selected ? colors.onPrimary : colors.text}>{label}</Txt>
    </Pressable>
  );
}

export function Bar({ value, color = colors.primary, height = 12 }: { value: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }} style={{ height, borderRadius: height, backgroundColor: colors.line, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

export function Field({ label, style, ...p }: TextInputProps & { label?: string }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Txt v="label" color={colors.text2}>{label.toUpperCase()}</Txt> : null}
      <TextInput accessibilityLabel={label ?? p.placeholder} placeholderTextColor={colors.text3} {...p} style={[styles.input, p.multiline && { minHeight: 88, textAlignVertical: 'top' }, style]} />
    </View>
  );
}

export function Header({ title, back = true, right }: { title: string; back?: boolean; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={() => (router.canGoBack() ? router.back() : router.replace('/today'))} style={styles.backBtn}>
          <Txt v="h2" color={colors.text2}>‹</Txt>
        </Pressable>
      ) : null}
      <Txt v="h2" style={{ flex: 1 }} numberOfLines={1}>{title}</Txt>
      {right}
    </View>
  );
}

export function Label({ children, color = colors.primaryDeep }: { children: string; color?: string }) {
  return <Txt v="label" color={color}>{children.toUpperCase()}</Txt>;
}

/** Fade + rise entrance; instant when the OS asks for reduced motion. */
export function Enter({ children, delay = 0, k }: { children: React.ReactNode; delay?: number; k?: string | number }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    a.setValue(reduce ? 1 : 0);
    if (!reduce) Animated.timing(a, { toValue: 1, duration: motion.enter, delay, useNativeDriver: true }).start();
  }, [k, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>{children}</Animated.View>;
}

export function Empty({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <View style={{ alignItems: 'center', padding: space.lg, gap: space.sm }}>
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <Txt v="h3" center>{title}</Txt>
      <Txt v="small" color={colors.text2} center>{body}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', flexGrow: 1 },
  bloom: { position: 'absolute', top: 0, left: 0, right: 0, height: 280 },
  footer: { paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.md, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.line },
  footerInner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.sm },
  btnEdge: { borderRadius: radius.md, paddingBottom: 4 },
  btn: { minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.lg, marginBottom: 0, marginTop: -0 },
  btnSmall: { minHeight: 44, paddingHorizontal: space.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md + 4, ...shadow.card },
  chip: { minHeight: 44, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primaryDeep },
  input: { ...(type.body as TextStyle), color: colors.text, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 12, minHeight: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, minHeight: 56 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.line },
});
