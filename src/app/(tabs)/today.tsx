// Today's Mission — the daily execution center: Morning Prime, the lesson, pending action,
// habits and the Evening Reflection. Session length (3/10/25 min) decides how much is shown.
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Pulse } from '@/components/fx';
import { Rai, RaiSays } from '@/components/Rai';
import { ScoreRing } from '@/components/ScoreRing';
import { Bar, Button, Card, Chip, Field, Label, Screen, Txt, haptic } from '@/components/ui';
import { path } from '@/content/curriculum';
import { practices } from '@/content/practices';
import { diffDays, today } from '@/lib/dates';
import { formatDate, useLang, useT } from '@/lib/i18n';
import { dueReviews, nextLevel, pendingEvidence } from '@/lib/progress';
import { computeScore } from '@/lib/score';
import { play } from '@/lib/sound';
import { activeGoal, habitsFor, useStore } from '@/lib/store';
import { colors, radius, space } from '@/theme/tokens';

export default function Today() {
  const t = useT();
  const lang = useLang();
  const s = useStore();
  const day = today();
  const log = s.days[day];
  const goal = activeGoal(s);
  const habits = habitsFor(s);
  const next = nextLevel(s);
  const due = dueReviews(s, day);
  const pending = pendingEvidence(s);
  const score = computeScore(s, day);
  const minutes = s.profile.minutes;
  const away = s.streak.lastActive ? diffDays(s.streak.lastActive, day) : 0;
  const doneToday = Object.values(s.progress).some((p) => p.completedAt === day);

  // Rai's nudge: always points at the single most useful next step.
  const nudge: { state: 'cheer' | 'happy' | 'thinking' | 'idle'; text: string } = !doneToday && next
    ? s.streak.current >= 2
      ? { state: 'cheer', text: t(`¡${s.streak.current} días seguidos! Tres minutos y la racha sigue viva.`, `${s.streak.current} days in a row! Three minutes and the streak stays alive.`) }
      : { state: 'cheer', text: t('¡Vamos! Tu nivel de hoy son solo tres minutos.', 'Let’s go! Today’s level takes just three minutes.') }
    : pending.length
      ? { state: 'thinking', text: t('Ya lo aprendiste. Ahora demuéstralo: registra qué hiciste.', 'You learned it. Now prove it: log what you did.') }
      : minutes > 3 && !log?.evening
        ? { state: 'idle', text: t('Buen avance. Cierra el día con tu reflexión nocturna.', 'Nice progress. Close the day with your evening reflection.') }
        : { state: 'happy', text: t('¡Día redondo! Mañana seguimos subiendo.', 'Great day! We keep climbing tomorrow.') };

  const [prios, setPrios] = useState(['', '', '']);
  const [evidence, setEvidence] = useState('');
  const first = pending[0];
  const hour = new Date().getHours();

  const tasks = [doneToday || !next, !!log?.prime, habits.length > 0 && habits.every((h) => log?.habits.includes(h.id)), !!log?.evening];
  const shown = minutes === 3 ? [tasks[0]] : tasks;
  const dayPct = shown.filter(Boolean).length / shown.length;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingTop: space.sm }}>
        <View style={{ flex: 1 }}>
          <Txt v="label" color={colors.text2}>{formatDate(day, lang).toUpperCase()}</Txt>
          <Txt v="h1">{t('Tu misión de hoy', 'Today’s mission')}</Txt>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Ver mi puntaje', 'See my score')} onPress={() => router.push('/me')}>
          <ScoreRing value={score.total} size={64} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm }}>
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 2, borderColor: colors.line }}>
          <Txt v="bodyBold" accessibilityLabel={t(`Racha de ${s.streak.current} días`, `${s.streak.current}-day streak`)}>🔥 {s.streak.current}</Txt>
        </View>
        <View style={{ flex: 1 }}><Bar value={dayPct} color={colors.success} /></View>
        <Txt v="label" color={colors.text2}>{Math.round(dayPct * 100)}%</Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
        {([3, 10, 25] as const).map((m) => <Chip key={m} testID={`session-${m}`} label={`${m} min`} selected={minutes === m} onPress={() => s.setProfile({ minutes: m })} />)}
      </View>

      <View style={{ gap: space.md, marginTop: space.md }}>
        {away > 2 ? (
          <RaiSays state="comeback"><Txt v="bodyBold">{t('¡Volviste! Eso es lo que cuenta. Empezamos de nuevo hoy, sin deudas.', 'You came back! That is what counts. We start fresh today, no debts.')}</Txt></RaiSays>
        ) : (
          <RaiSays state={nudge.state} size={104}><Txt v="bodyBold">{nudge.text}</Txt></RaiSays>
        )}

        {/* Identity + goal */}
        <Card testID="goal-card" onPress={() => router.push('/goal')} label={t('Abrir arquitecto de metas', 'Open goal architect')} style={{ gap: 6 }}>
          {s.profile.identity ? <Txt v="small" color={colors.primaryDeep} style={{ fontFamily: 'Nunito_800ExtraBold' }}>{t('Hoy soy', 'Today I am')}: {s.profile.identity}</Txt> : null}
          <Label>{t('Meta principal', 'Main goal')}</Label>
          {goal ? (
            <>
              <Txt v="h3">{goal.title}</Txt>
              <Bar value={goal.progress / 100} height={8} />
              <Txt v="small" color={colors.text2}>{t('Acción diaria', 'Daily action')}: {goal.dailyAction}</Txt>
            </>
          ) : (
            <>
              <Txt v="h3">{s.profile.goalText || t('Aún no has definido tu meta', 'You have not defined your goal yet')}</Txt>
              <Txt v="small" color={colors.infoDeep}>{t('Convertirla en un plan de 90 días →', 'Turn it into a 90-day plan →')}</Txt>
            </>
          )}
        </Card>

        {/* Lesson of the day */}
        {next ? (
          <Card style={{ gap: space.sm, borderWidth: 2, borderColor: doneToday ? colors.line : colors.primary }}>
            <Label>{doneToday ? t('Siguiente nivel', 'Next level') : t('Lección de hoy · 3 min', 'Today’s lesson · 3 min')}</Label>
            <Txt v="h2">{next.title[lang]}</Txt>
            <Txt v="small" color={colors.text2}>{t('Nivel', 'Level')} {path.find((p) => p.id === next.id)?.n} · {next.cards.length} {t('tarjetas', 'cards')} · {next.exercises.length} {t('ejercicios', 'exercises')}</Txt>
            <Pulse on={!doneToday}>
              <Button testID="start-level" label={doneToday ? t('Hacer otro nivel', 'Do another level') : t('Empezar', 'Start')} kind={doneToday ? 'ghost' : 'primary'} onPress={() => router.push(`/level/${next.id}`)} />
            </Pulse>
          </Card>
        ) : (
          <Card style={{ gap: space.sm, alignItems: 'center' }}>
            <Rai state="levelup" size={110} />
            <Txt v="h3" center>{t('Completaste todos los niveles publicados', 'You completed every published level')}</Txt>
            <Txt v="small" color={colors.text2} center>{t('Los siguientes se publican al generarse y validarse. Sigue con repasos, hábitos y prácticas.', 'The next ones are published once generated and validated. Keep going with reviews, habits and practices.')}</Txt>
          </Card>
        )}

        {due.length ? (
          <Card testID="review-card" onPress={() => router.push(`/level/${due[0].id}?review=1`)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Txt v="h1">🔁</Txt>
            <View style={{ flex: 1 }}>
              <Txt v="h3">{t(`Repaso pendiente (${due.length})`, `Review due (${due.length})`)}</Txt>
              <Txt v="small" color={colors.text2}>{due[0].title[lang]} · 1 min</Txt>
            </View>
          </Card>
        ) : null}

        {/* PROVE: evidence of application */}
        {first ? (
          <Card style={{ gap: space.sm }}>
            <Label color={colors.successDeep}>{t('Acción pendiente · demuestra que lo aplicaste', 'Pending action · show you applied it')}</Label>
            <Txt v="h3">{first.title[lang]}</Txt>
            <Txt v="small" color={colors.text2}>{t('Tu compromiso', 'Your commitment')}: {s.progress[first.id].commit}</Txt>
            <Field testID="evidence-input" multiline value={evidence} onChangeText={setEvidence} placeholder={first.prove[lang]} />
            <Button testID="save-evidence" kind="success" small label={t('Registrar evidencia (+15 XP)', 'Log evidence (+15 XP)')} disabled={evidence.trim().length < 3} sound={null} onPress={() => { s.addEvidence(first.id, evidence.trim()); setEvidence(''); haptic('ok'); play('xp'); }} />
            <Txt v="small" color={colors.text3}>{t('Basta una frase: una decisión, acción o resultado. Nada privado que no quieras escribir.', 'One sentence is enough: a decision, action or result. Nothing private you would rather not write.')}</Txt>
          </Card>
        ) : null}

        {minutes > 3 ? (
          <>
            {/* Morning Prime */}
            <Card style={{ gap: space.sm }}>
              <Label>{t('Morning Prime · tus 3 prioridades', 'Morning Prime · your top 3')}</Label>
              {log?.prime ? (
                log.prime.priorities.map((p, i) => p ? (
                  <Pressable key={i} testID={`prio-${i}`} accessibilityRole="checkbox" accessibilityState={{ checked: log.prime!.done[i] }} onPress={() => { haptic(); if (!log.prime!.done[i]) play('check'); s.togglePriority(i); }} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 }}>
                    <Check on={log.prime!.done[i]} />
                    <Txt v="body" style={[{ flex: 1 }, log.prime!.done[i] && { textDecorationLine: 'line-through', color: colors.text3 }]}>{p}</Txt>
                  </Pressable>
                ) : null)
              ) : (
                <>
                  <Txt v="small" color={colors.text2}>{goal ? t(`¿Qué tres acciones de hoy te acercan a «${goal.title}»?`, `Which three actions today move you toward "${goal.title}"?`) : t('¿Cuáles son las tres cosas más valiosas que harás hoy?', 'What are the three most valuable things you will do today?')}</Txt>
                  {prios.map((p, i) => <Field key={i} testID={`prio-input-${i}`} value={p} onChangeText={(v) => setPrios(prios.map((x, j) => (j === i ? v : x)))} placeholder={`${i + 1}.`} />)}
                  <Button testID="save-prime" small label={t('Fijar mis prioridades', 'Set my priorities')} disabled={!prios.some((p) => p.trim())} onPress={() => s.setPrime(prios.map((p) => p.trim()))} />
                </>
              )}
            </Card>

            {/* Habits */}
            <Card style={{ gap: space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}><Label>{t('Hábitos de hoy', 'Today’s habits')}</Label></View>
                <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push('/habits')}><Txt v="small" color={colors.infoDeep}>{t('Gestionar', 'Manage')}</Txt></Pressable>
              </View>
              {habits.length ? habits.map((h) => {
                const on = !!log?.habits.includes(h.id);
                return (
                  <Pressable key={h.id} testID={`habit-${h.name}`} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => { haptic(on ? 'tap' : 'ok'); if (!on) play('check'); s.toggleHabit(h.id); }} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 }}>
                    <Check on={on} />
                    <Txt v="body" style={{ flex: 1 }}>{h.name}</Txt>
                  </Pressable>
                );
              }) : <Txt v="small" color={colors.text2}>{t('Aún no tienes hábitos. Crea el primero y asócialo a tu meta.', 'No habits yet. Create the first one and link it to your goal.')}</Txt>}
            </Card>

            {/* Evening Reflection */}
            <Card testID="evening-card" onPress={() => router.push('/evening')} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: hour >= 18 && !log?.evening ? colors.night : colors.surface }}>
              <Txt v="h1">{log?.evening ? '✅' : '🌙'}</Txt>
              <View style={{ flex: 1 }}>
                <Txt v="h3" color={hour >= 18 && !log?.evening ? '#fff' : colors.text}>{t('Reflexión nocturna', 'Evening reflection')}</Txt>
                <Txt v="small" color={hour >= 18 && !log?.evening ? '#D9D3EE' : colors.text2}>{log?.evening ? t('Hecha. Puedes editarla.', 'Done. You can edit it.') : t('4 preguntas · 2 min', '4 questions · 2 min')}</Txt>
              </View>
            </Card>
          </>
        ) : null}

        {minutes === 25 ? (
          <Card testID="practice-suggestion" onPress={() => router.push(`/practice/${practices[new Date().getDate() % practices.length].id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Txt v="h1">{practices[new Date().getDate() % practices.length].icon}</Txt>
            <View style={{ flex: 1 }}>
              <Label>{t('Práctica sugerida', 'Suggested practice')}</Label>
              <Txt v="h3">{practices[new Date().getDate() % practices.length].title[lang]}</Txt>
            </View>
          </Card>
        ) : null}

        <Button kind="ghost" label={t('¿Atascado? Habla con tu coach', 'Stuck? Talk to your coach')} onPress={() => router.push('/coach')} />
      </View>
    </Screen>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <View style={{ width: 28, height: 28, borderRadius: 9, borderWidth: 2, borderColor: on ? colors.success : colors.line, backgroundColor: on ? colors.success : colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      {on ? <Txt v="bodyBold" color="#173B00">✓</Txt> : null}
    </View>
  );
}
