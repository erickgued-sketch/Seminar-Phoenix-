import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { Icon } from '@/components/Icon';
import { useT } from '@/lib/i18n';
import { colors, fonts } from '@/theme/tokens';

export default function TabsLayout() {
  const t = useT();
  const tab = (name: string, es: string, en: string) => (
    <Tabs.Screen name={name} options={{ title: t(es, en), tabBarIcon: ({ color }) => <Icon name={name} color={String(color)} /> }} />
  );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabelStyle: { fontFamily: fonts.bodyBlack, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, borderTopWidth: 1, height: 68, paddingTop: 6, paddingBottom: 10 },
      }}
    >
      {tab('today', 'Hoy', 'Today')}
      {tab('journey', 'Camino', 'Journey')}
      {tab('coach', 'Coach', 'Coach')}
      {tab('mind', 'Mente', 'Mind')}
      {tab('me', 'Yo', 'Me')}
    </Tabs>
  );
}
