// Goal Architect: raw wish → defined goal → editable 90-day plan → approve to activate.
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { RaiSays } from '@/components/Rai';
import { Bar, Button, Card, Chip, Field, Header, Label, Screen, Txt, haptic } from '@/components/ui';
import { diffDays, today } from '@/lib/dates';
import { buildWeeks, draftIssues, toGoal, type Draft } from '@/lib/goalPlan';
import { formatDate, useLang, useT } from '@/lib/i18n';
import { play } from '@/lib/sound';
import { activeGoal, uid, useStore, type Week } from '@/lib/store';
import { colors, space } from '@/theme/tokens';

export default function GoalArchitect() {
  const t = useT();
  const lang = useLang();
  const s = useStore();
  const goal = activeGoal(s);
  const [editing, setEditing] = useState(!goal);
  const [step, setStep] = useState<'define' | 'plan'>('define');
  const [d, setD] = useState<Draft>(() => goal
    ? { title: goal.title, why: goal.why, metric: goal.metric, days: Math.max(7, diffDays(today(), goal.deadline)), obstacles: goal.obstacles, dailyAction: goal.dailyAction, identity: goal.identity }
    : { title: s.profile.goalText, why: s.profile.why, metric: '', days: 90, obstacles: '', dailyAction: '', identity: s.profile.identity });
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [habit, setHabit] = useState(true);
  const set = (k: keyof Draft) => (v: string) => setD({ ...d, [k]: v });
  const issues = draftIssues(d, lang);

  // ---------- active goal dashboard ----------
  if (goal && !editing) {
    const left = diffDays(today(), goal.deadline);
    const nextWeek = goal.weeks.find((w) => !w.done);
    return (
      <Screen>
        <Header title={t('Mi meta', 'My goal')} right={<Pressable accessibilityRole="button" hitSlop={10} onPress={() => setEditing(true)}><Txt v="small" color={colors.infoDeep}>{t('Editar', 'Edit')}</Txt></Pressable>} />
        <View style={{ gap: space.md }}>
          <Card style={{ gap: space.sm }}>
            {goal.identity ? <Txt v="small" color={colors.primaryDeep} style={{ fontFamily: 'Nunito_800ExtraBold' }}>{goal.identity}</Txt> : null}
            <Txt v="h1">{goal.title}</Txt>
            <Bar value={goal.progress / 100} />
            <Txt v="small" color={colors.text2}>{goal.progress}% · {left >= 0 ? t(`faltan ${left} días`, `${left} days left`) : t('fecha cumplida: revisa y redefine', 'deadline passed: review and redefine')} · {formatDate(goal.deadline, lang)}</Txt>
            <Row k={t('Indicador', 'Metric')} v={goal.metric} />
            <Row k={t('Mi porqué', 'My why')} v={goal.why} />
            <Row k={t('Acción diaria', 'Daily action')} v={goal.dailyAction} />
            {goal.obstacles ? <Row k={t('Obstáculo previsto', 'Expected obstacle')} v={goal.obstacles} /> : null}
          </Card>
          {nextWeek ? <RaiSays state="focus"><Txt v="label" color={colors.primaryDeep}>{t('ESTA SEMANA', 'THIS WEEK')}</Txt><Txt v="bodyBold">{nextWeek.focus}</Txt></RaiSays> : null}
          <Label>{t('Plan semanal', 'Weekly plan')}</Label>
          {goal.weeks.map((w) => (
            <Pressable key={w.week} testID={`week-${w.week}`} accessibilityRole="checkbox" accessibilityState={{ checked: w.done }} onPress={() => { haptic(w.done ? 'tap' : 'ok'); if (!w.done) play('check'); s.toggleWeek(goal.id, w.week); }} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', minHeight: 48 }}>
              <View style={{ width: 28, height: 28, borderRadius: 9, borderWidth: 2, borderColor: w.done ? colors.success : colors.line, backgroundColor: w.done ? colors.success : colors.surface, alignItems: 'center', justifyContent: 'center' }}>{w.done ? <Txt v="bodyBold" color="#173B00">✓</Txt> : null}</View>
              <Txt v="body" style={{ flex: 1 }} color={w.done ? colors.text3 : colors.text}><Txt v="bodyBold" color={w.done ? colors.text3 : colors.text}>{t('S', 'W')}{w.week} · </Txt>{w.focus}</Txt>
            </Pressable>
          ))}
          <Button kind="ghost" label={t('Ver mi futuro yo', 'See my future self')} onPress={() => router.push('/future')} />
          <Button kind="danger" small label={t('Eliminar esta meta', 'Delete this goal')} onPress={() => { s.removeGoal(goal.id); setEditing(true); }} />
        </View>
      </Screen>
    );
  }

  // ---------- step 2: review and approve the plan ----------
  if (step === 'plan') {
    return (
      <Screen footer={<><Button testID="goal-approve" kind="success" sound={null} label={t('Aprobar y activar plan', 'Approve and activate plan')} onPress={() => {
        const g = { ...toGoal(d, lang, goal?.id), weeks };
        s.saveGoal(g);
        s.setProfile({ goalText: g.title, why: g.why, identity: g.identity });
        if (habit && !s.habits.some((h) => h.name === g.dailyAction && !h.archived)) s.saveHabit({ id: uid(), name: g.dailyAction, area: 'goal', perWeek: 5, goalId: g.id, createdAt: today() });
        play('levelup');
        setStep('define'); setEditing(false);
      }} /><Button kind="ghost" small label={t('Volver a editar', 'Back to editing')} onPress={() => setStep('define')} /></>}>
        <Header title={t('Tu plan de 90 días', 'Your 90-day plan')} back={false} />
        <View style={{ gap: space.md }}>
          <Card style={{ gap: 6 }}>
            <Txt v="h2">{d.title}</Txt>
            <Row k={t('Indicador', 'Metric')} v={d.metric} />
            <Row k={t('Fecha', 'Date')} v={`${d.days} ${t('días', 'days')}`} />
            <Row k={t('Acción diaria', 'Daily action')} v={d.dailyAction} />
          </Card>
          <Txt v="small" color={colors.text2}>{t('Edita cada semana para que el plan sea tuyo. Es un punto de partida, no una garantía de resultado.', 'Edit each week to make the plan yours. It is a starting point, not a guarantee of results.')}</Txt>
          {weeks.map((w, i) => (
            <Field key={w.week} testID={`plan-week-${w.week}`} label={`${t('Semana', 'Week')} ${w.week}`} value={w.focus} onChangeText={(v) => setWeeks(weeks.map((x, j) => (j === i ? { ...x, focus: v } : x)))} />
          ))}
          <Chip label={`${habit ? '✓ ' : ''}${t('Crear hábito con mi acción diaria (5×/semana)', 'Create a habit from my daily action (5×/week)')}`} selected={habit} onPress={() => setHabit(!habit)} />
        </View>
      </Screen>
    );
  }

  // ---------- step 1: define ----------
  return (
    <Screen footer={<Button testID="goal-build" label={t('Construir mi plan', 'Build my plan')} disabled={issues.length > 0} onPress={() => { setWeeks(buildWeeks(d.days, lang)); setStep('plan'); }} />}>
      <Header title={t('Arquitecto de metas', 'Goal Architect')} />
      <View style={{ gap: space.md }}>
        <RaiSays state="thinking"><Txt v="bodyBold">{t('Una meta clara, escrita, con fecha y con razones. Así la plantea el seminario (pp. 125–136).', 'A clear, written goal with a date and reasons. That is how the seminar frames it (pp. 125–136).')}</Txt></RaiSays>
        <Field testID="g-title" label={t('1 · ¿Qué quieres lograr exactamente?', '1 · What exactly do you want to achieve?')} value={d.title} onChangeText={set('title')} placeholder={t('Mantener una conversación de 30 min en inglés', 'Hold a 30-minute conversation in Spanish')} multiline />
        <Field testID="g-why" label={t('2 · ¿Por qué lo quieres? (tus razones)', '2 · Why do you want it? (your reasons)')} value={d.why} onChangeText={set('why')} multiline />
        <Field testID="g-metric" label={t('3 · ¿Cómo sabrás que lo lograste? (con un número)', '3 · How will you know you made it? (with a number)')} value={d.metric} onChangeText={set('metric')} placeholder={t('3 conversaciones de 30 min sin traductor', '3 conversations of 30 min without a translator')} />
        <View style={{ gap: 6 }}>
          <Label color={colors.text2}>{t('4 · Fecha límite', '4 · Deadline')}</Label>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {[30, 60, 90].map((n) => <Chip key={n} testID={`g-days-${n}`} label={`${n} ${t('días', 'days')}`} selected={d.days === n} onPress={() => setD({ ...d, days: n })} />)}
          </View>
        </View>
        <Field testID="g-obstacle" label={t('5 · ¿Cuál es tu mayor obstáculo previsible?', '5 · What is your biggest foreseeable obstacle?')} value={d.obstacles} onChangeText={set('obstacles')} />
        <Field testID="g-action" label={t('6 · Acción diaria que depende solo de ti', '6 · Daily action that depends only on you')} value={d.dailyAction} onChangeText={set('dailyAction')} placeholder={t('Practicar 15 min de conversación', 'Practice 15 min of conversation')} />
        <Field testID="g-identity" label={t('7 · ¿Quién eres mientras lo logras? (identidad, opcional)', '7 · Who are you while achieving it? (identity, optional)')} value={d.identity} onChangeText={set('identity')} placeholder={t('Soy una persona que practica cada día', 'I am a person who practices every day')} />
        {issues.map((i) => <Txt key={i} v="small" color={colors.text2}>• {i}</Txt>)}
        {goal ? <Button kind="ghost" small label={t('Cancelar', 'Cancel')} onPress={() => setEditing(false)} /> : null}
      </View>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View>
      <Txt v="label" color={colors.text2}>{k.toUpperCase()}</Txt>
      <Txt v="body">{v || '—'}</Txt>
    </View>
  );
}
