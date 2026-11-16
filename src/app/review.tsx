// Weekly CEO Review — a personal strategy session built only from what you recorded.
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { RaiSays } from '@/components/Rai';
import { ScoreRing } from '@/components/ScoreRing';
import { Bar, Button, Card, Chip, Header, Label, Screen, Txt } from '@/components/ui';
import { levelById } from '@/content/curriculum';
import { today } from '@/lib/dates';
import { formatDate, useLang, useT } from '@/lib/i18n';
import { buildReview } from '@/lib/review';
import { computeScore } from '@/lib/score';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme/tokens';

export default function Review() {
  const t = useT();
  const lang = useLang();
  const s = useStore();
  const [back, setBack] = useState(0);
  const r = buildReview(s, today(), back);
  const score = computeScore(s, today());
  const empty = !r.levels.length && !r.evidence && !r.prioritiesSet && !r.wins.length && !r.practices && r.habitRows.every((h) => !h.hits);
  const focus = {
    goal: t('Define tu meta en el Arquitecto de metas: sin ella no hay nada que revisar.', 'Define your goal in the Goal Architect: without it there is nothing to review.'),
    apply: t('Tienes aprendizaje sin aplicar. Esta semana: registra evidencia de dos niveles antes de avanzar.', 'You have learning that is not applied. This week: log evidence for two levels before moving on.'),
    habits: t('Tus hábitos van por debajo del objetivo. Reduce uno a su versión mínima y protégelo.', 'Your habits are below target. Shrink one to its minimum version and protect it.'),
    reflect: t('Te falta cierre diario. Haz la reflexión nocturna al menos tres noches.', 'You lack daily closure. Do the evening reflection at least three nights.'),
    learn: t('Buen ritmo de ejecución. Añade tres niveles nuevos esta semana.', 'Good execution rhythm. Add three new levels this week.'),
    keep: t('Semana sólida. Mantén el sistema y sube un poco la exigencia de tu acción diaria.', 'Solid week. Keep the system and raise the bar slightly on your daily action.'),
  }[r.nextFocus];
  const list = (title: string, items: string[], none: string) => (
    <Card style={{ gap: 6 }}>
      <Label>{title}</Label>
      {items.length ? items.map((x, i) => <Txt key={i} v="body">• {x}</Txt>) : <Txt v="small" color={colors.text3}>{none}</Txt>}
    </Card>
  );
  return (
    <Screen>
      <Header title={t('Revisión CEO semanal', 'Weekly CEO Review')} />
      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip label={t('Esta semana', 'This week')} selected={back === 0} onPress={() => setBack(0)} />
          <Chip label={t('Semana anterior', 'Last week')} selected={back === 1} onPress={() => setBack(1)} />
        </View>
        <Txt v="small" color={colors.text2}>{formatDate(r.from, lang)} → {formatDate(r.to, lang)}</Txt>
        {empty ? (
          <RaiSays state="encouraging"><Txt v="bodyBold">{t('Aún no hay registros esta semana. Completa un nivel, marca un hábito o haz tu reflexión y vuelve aquí.', 'No records this week yet. Complete a level, check a habit or do your reflection and come back.')}</Txt></RaiSays>
        ) : (
          <>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <ScoreRing value={score.total} size={92} label="SCORE" />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="h3">{score.rank[lang]}</Txt>
                <Txt v="small" color={colors.text2}>{t(`Niveles: ${r.levels.length} · Evidencias: ${r.evidence} · Prácticas: ${r.practices} · Prioridades: ${r.prioritiesDone}/${r.prioritiesSet}`, `Levels: ${r.levels.length} · Evidence: ${r.evidence} · Practices: ${r.practices} · Priorities: ${r.prioritiesDone}/${r.prioritiesSet}`)}</Txt>
              </View>
            </Card>
            {r.goal ? (
              <Card style={{ gap: 6 }}>
                <Label>{t('Meta', 'Goal')}</Label>
                <Txt v="h3">{r.goal.title}</Txt>
                <Bar value={r.goal.progress / 100} height={8} />
                {r.goal.nextWeek ? <Txt v="small" color={colors.text2}>{t('Siguiente hito', 'Next milestone')}: {r.goal.nextWeek}</Txt> : null}
              </Card>
            ) : null}
            {r.habitRows.length ? (
              <Card style={{ gap: space.sm }}>
                <Label>{t('Hábitos', 'Habits')}</Label>
                {r.habitRows.map((h) => (
                  <View key={h.name} style={{ gap: 4 }}>
                    <Txt v="body">{h.name} · {h.hits}/{h.target}</Txt>
                    <Bar value={h.hits / h.target} color={h.hits >= h.target ? colors.success : colors.primary} height={8} />
                  </View>
                ))}
              </Card>
            ) : null}
            {list(t('Qué aprendí', 'What I learned'), [...r.levels.map((id) => levelById(id)!.principle[lang]), ...r.lessons], t('Sin niveles ni aprendizajes registrados.', 'No levels or lessons recorded.'))}
            {list(t('Qué funcionó', 'What worked'), r.wins, t('No registraste logros en tus reflexiones.', 'You logged no wins in your reflections.'))}
            {list(t('Qué se pospuso', 'What was postponed'), r.postponed, t('Nada pendiente de tus prioridades.', 'Nothing left over from your priorities.'))}
            {list(t('Obstáculos', 'Obstacles'), r.obstacles, t('No registraste obstáculos.', 'You logged no obstacles.'))}
          </>
        )}
        <RaiSays state="focus"><Txt v="label" color={colors.primaryDeep}>{t('PRIORIDAD PARA LA PRÓXIMA SEMANA', 'PRIORITY FOR NEXT WEEK')}</Txt><Txt v="bodyBold">{focus}</Txt></RaiSays>
        <Txt v="small" color={colors.text3}>{t('Esta revisión resume solo lo que registraste; no evalúa tu valía ni tu salud.', 'This review only summarises what you recorded; it does not assess your worth or health.')}</Txt>
        <Button kind="ghost" label={t('Hablarlo con el coach', 'Discuss it with the coach')} onPress={() => router.push('/coach')} />
      </View>
    </Screen>
  );
}
