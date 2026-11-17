import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { haptic, Txt, useReduceMotion } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { play } from '@/lib/sound';
import { colors, elevation, fonts, motion, radius } from '@/theme/tokens';

const TABS = [
  ['today', 'Hoy', 'Today'],
  ['journey', 'Camino', 'Journey'],
  ['coach', 'Coach', 'Coach'],
  ['mind', 'Mente', 'Mind'],
  ['me', 'Yo', 'Me'],
] as const;

function TabItem({ name, label, on, onPress }: { name: string; label: string; on: boolean; onPress: () => void }) {
  const reduce = useReduceMotion();
  const a = useState(() => new Animated.Value(on ? 1 : 0))[0];
  useEffect(() => {
    if (reduce) a.setValue(on ? 1 : 0);
    else Animated.spring(a, { toValue: on ? 1 : 0, useNativeDriver: true, ...motion.spring.snappy }).start();
  }, [on, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Pressable testID={`tab-${name}`} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: on }} onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 56, gap: 2 }}>
      <Animated.View style={{ position: 'absolute', top: 5, width: 54, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, opacity: a, transform: [{ scaleX: a.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }} />
      <Animated.View style={{ transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) }, { scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}>
        <Icon name={name} color={on ? colors.primaryDeep : colors.text3} size={24} weight={on ? 2.5 : 2.1} />
      </Animated.View>
      <Txt style={{ fontFamily: fonts.bodyBlack, fontSize: 11, lineHeight: 14 }} color={on ? colors.text : colors.text3}>{label}</Txt>
    </Pressable>
  );
}

/** Floating pill tab bar. It sits in the layout flow (not over the content), so no screen is ever covered by it. */
function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 12, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 10) }}>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', width: '100%', maxWidth: 536, alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 4, ...elevation(2) }}>
        {state.routes.map((route, i) => {
          const def = TABS.find((x) => x[0] === route.name);
          if (!def) return null;
          const on = state.index === i;
          return (
            <TabItem
              key={route.key}
              name={route.name}
              label={t(def[1], def[2])}
              on={on}
              onPress={() => {
                const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!on && !e.defaultPrevented) { haptic(); play('select', 0.4); navigateToTab(route.key); }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      {TABS.map(([name, es, en]) => <Tabs.Screen key={name} name={name} options={{ title: t(es, en) }} />)}
    </Tabs>
  );
}
