// Execution mode / anti-procrastination timer: one task, one countdown, then log it.
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Rai } from '@/components/Rai';
import { Bar, Button, Card, Header, Screen, Txt, haptic } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme/tokens';

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Focus() {
  const { min, task } = useLocalSearchParams<{ min?: string; task?: string }>();
  const t = useT();
  const total = Math.max(1, Number(min) || 10) * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const addXp = useStore((s) => s.addXp);
  const touch = useStore((s) => s.touch);

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + left * 1000; // wall clock, so backgrounding the app does not stall the timer
    const id = setInterval(() => {
      const l = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) { setRunning(false); haptic('ok'); }
    }, 500);
    return () => clearInterval(id);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => { addXp(10); touch(); router.back(); };
  return (
    <Screen footer={left === 0 || left < total
      ? <><Button testID="focus-done" kind="success" label={t('Lo hice (+10 XP)', 'I did it (+10 XP)')} onPress={finish} />{left > 0 ? <Button kind="ghost" small label={running ? t('Pausar', 'Pause') : t('Reanudar', 'Resume')} onPress={() => setRunning(!running)} /> : null}</>
      : <Button testID="focus-start" label={t('Empezar ahora', 'Start now')} onPress={() => setRunning(true)} />}>
      <Header title={t(`Modo ${Math.round(total / 60)} min`, `${Math.round(total / 60)}-min mode`)} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md }}>
        <Rai state={left === 0 ? 'celebrate' : 'focus'} size={160} />
        <Txt v="hero" style={{ fontSize: 64, lineHeight: 70 }} accessibilityLiveRegion="none">{mmss(left)}</Txt>
        <View style={{ alignSelf: 'stretch' }}><Bar value={1 - left / total} color={colors.success} /></View>
        <Card style={{ alignSelf: 'stretch', gap: 4 }}>
          <Txt v="label" color={colors.primaryDeep}>{t('UNA SOLA COSA', 'ONE THING ONLY')}</Txt>
          <Txt v="bodyBold">{task || t('Tu siguiente acción más pequeña.', 'Your smallest next action.')}</Txt>
        </Card>
        <Txt v="small" color={colors.text2} center>{t('Sin teléfono, sin pestañas. Solo esto hasta que suene.', 'No phone, no tabs. Just this until it rings.')}</Txt>
      </View>
    </Screen>
  );
}
