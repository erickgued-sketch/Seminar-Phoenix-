// Future Self — illustrative trajectories with explicit assumptions (never a guaranteed prediction).
import React, { useState } from 'react';
import { View } from 'react-native';
import { RaiSays } from '@/components/Rai';
import { Bar, Card, Chip, Empty, Header, Label, Screen, Txt } from '@/components/ui';
import { lastNDays, today } from '@/lib/dates';
import { scenarios } from '@/lib/future';
import { useT } from '@/lib/i18n';
import { activeGoal, habitsFor, useStore } from '@/lib/store';
import { colors, space } from '@/theme/tokens';

export default function Future() {
  const t = useT();
  const s = useStore();
  const habits = habitsFor(s);
  const goal = activeGoal(s);
  const [sel, setSel] = useState(0);
  const [mins, setMins] = useState(15);
  const h = habits[Math.min(sel, habits.length - 1)];
  if (!h) {
    return <Screen><Header title={t('Mi futuro yo', 'My future self')} /><Empty emoji="🔭" title={t('Necesito un hábito para proyectar', 'I need a habit to project')} body={t('Crea un hábito en Hoy → Hábitos. La proyección usa tus registros reales.', 'Create a habit in Today → Habits. The projection uses your real records.')} /></Screen>;
  }
  const last28 = lastNDays(today(), 28).filter((d) => s.days[d]?.habits.includes(h.id)).length;
  const current = Math.round((last28 / 4) * 10) / 10;
  const sc = scenarios(current, h.perWeek, mins);
  const max = Math.max(...sc.map((x) => x.reps365), 1);
  const names = { current: t('Si sigo como voy', 'If I continue as now'), steady: t('Si cumplo mi objetivo', 'If I meet my target'), stretch: t('Si subo dos días', 'If I add two days') };
  return (
    <Screen>
      <Header title={t('Mi futuro yo', 'My future self')} />
      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {habits.map((x, i) => <Chip key={x.id} label={x.name} selected={i === sel} onPress={() => setSel(i)} />)}
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <Txt v="small" color={colors.text2}>{t('Minutos por vez:', 'Minutes each time:')}</Txt>
          {[5, 15, 30, 60].map((m) => <Chip key={m} label={String(m)} selected={mins === m} onPress={() => setMins(m)} />)}
        </View>
        {sc.map((x) => (
          <Card key={x.key} style={{ gap: 6, borderWidth: 2, borderColor: x.key === 'steady' ? colors.primary : colors.surface }}>
            <Label color={x.key === 'current' ? colors.text2 : colors.primaryDeep}>{names[x.key]}</Label>
            <Txt v="h2">{x.reps365} {t('repeticiones en un año', 'repetitions in a year')}</Txt>
            <Bar value={x.reps365 / max} color={x.key === 'current' ? colors.text3 : colors.success} height={10} />
            <Txt v="small" color={colors.text2}>{x.perWeek}×/{t('semana', 'week')} · {x.reps90} {t('en 90 días', 'in 90 days')} · ≈{x.hours365} h/{t('año', 'year')}</Txt>
          </Card>
        ))}
        <RaiSays state="thinking"><Txt v="bodyBold">{goal ? t(`Cada repetición de «${h.name}» es un voto por «${goal.title}».`, `Each repetition of "${h.name}" is a vote for "${goal.title}".`) : t('La diferencia entre escenarios es solo constancia semanal.', 'The gap between scenarios is just weekly consistency.')}</Txt></RaiSays>
        <Card style={{ gap: 4, backgroundColor: colors.surfaceAlt }}>
          <Label color={colors.text2}>{t('Supuestos', 'Assumptions')}</Label>
          <Txt v="small" color={colors.text2}>{t(`• «Como voy» = tu promedio real de las últimas 4 semanas (${current}×/semana).\n• Aritmética simple: veces por semana × semanas. No incluye pausas, enfermedad ni cambios de vida.\n• Es una ilustración de constancia, no una predicción ni una garantía de resultados.`, `• "As now" = your real average over the last 4 weeks (${current}×/week).\n• Simple arithmetic: times per week × weeks. It ignores breaks, illness and life changes.\n• It illustrates consistency; it is not a prediction or a guarantee of results.`)}</Txt>
        </Card>
      </View>
    </Screen>
  );
}
