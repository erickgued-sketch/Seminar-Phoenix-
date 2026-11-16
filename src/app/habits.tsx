// Habit Builder: weekly frequency, 7-day strip, consistency and link to the active goal.
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Bar, Button, Card, Chip, Empty, Field, Header, Label, Screen, Txt, haptic } from '@/components/ui';
import { lastNDays, parse, today } from '@/lib/dates';
import { useLang, useT } from '@/lib/i18n';
import { activeGoal, habitsFor, uid, useStore } from '@/lib/store';
import { colors, space } from '@/theme/tokens';

const AREAS: [string, string, string][] = [['health', 'Salud', 'Health'], ['work', 'Trabajo', 'Work'], ['mind', 'Mente', 'Mind'], ['money', 'Dinero', 'Money'], ['family', 'Familia', 'Family'], ['learning', 'Aprendizaje', 'Learning']];

export default function Habits() {
  const t = useT();
  const lang = useLang();
  const s = useStore();
  const goal = activeGoal(s);
  const habits = habitsFor(s);
  const week = lastNDays(today(), 7).reverse();
  const month = lastNDays(today(), 28);
  const [name, setName] = useState('');
  const [area, setArea] = useState('health');
  const [perWeek, setPerWeek] = useState(5);
  const [link, setLink] = useState(true);

  const add = () => {
    s.saveHabit({ id: uid(), name: name.trim(), area, perWeek, goalId: link ? goal?.id : undefined, createdAt: today() });
    setName('');
  };
  return (
    <Screen>
      <Header title={t('Hábitos', 'Habits')} />
      <View style={{ gap: space.md }}>
        {!habits.length ? <Empty emoji="🌱" title={t('Tu primer hábito', 'Your first habit')} body={t('Empieza con uno pequeño que dependa solo de ti. El seminario insiste: lo que repites se vuelve automático.', 'Start with a small one that depends only on you. The seminar insists: what you repeat becomes automatic.')} /> : null}
        {habits.map((h) => {
          const hits = week.filter((d) => s.days[d]?.habits.includes(h.id)).length;
          const m = month.filter((d) => s.days[d]?.habits.includes(h.id)).length;
          const prev = lastNDays(week[0], 8).slice(1).filter((d) => s.days[d]?.habits.includes(h.id)).length;
          return (
            <Card key={h.id} style={{ gap: space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Txt v="h3">{h.name}</Txt>
                  <Txt v="small" color={colors.text2}>{hits}/{h.perWeek} {t('esta semana', 'this week')} · {m} {t('en 28 días', 'in 28 days')} · {hits > prev ? '↗' : hits < prev ? '↘' : '→'} {t('vs. semana anterior', 'vs. last week')}</Txt>
                  {h.goalId && goal?.id === h.goalId ? <Txt v="small" color={colors.infoDeep}>↳ {goal.title}</Txt> : null}
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={t(`Archivar ${h.name}`, `Archive ${h.name}`)} hitSlop={10} onPress={() => s.archiveHabit(h.id)}><Txt v="small" color={colors.text3}>{t('Archivar', 'Archive')}</Txt></Pressable>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {week.map((d) => {
                  const on = !!s.days[d]?.habits.includes(h.id);
                  return (
                    <Pressable key={d} testID={`h-${h.name}-${d}`} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={d} onPress={() => { haptic(); s.toggleHabit(h.id, d); }} style={{ alignItems: 'center', gap: 4, minWidth: 40, minHeight: 56 }}>
                      <Txt v="label" color={d === today() ? colors.primaryDeep : colors.text3}>{parse(d).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { weekday: 'narrow' }).toUpperCase()}</Txt>
                      <View style={{ width: 34, height: 34, borderRadius: 12, borderWidth: 2, borderColor: on ? colors.success : colors.line, backgroundColor: on ? colors.success : colors.surface, alignItems: 'center', justifyContent: 'center' }}>{on ? <Txt v="bodyBold" color="#173B00">✓</Txt> : null}</View>
                    </Pressable>
                  );
                })}
              </View>
              <Bar value={hits / h.perWeek} color={colors.success} height={8} />
              {hits < Math.ceil(h.perWeek / 2) && week.indexOf(today()) >= 0 ? <Txt v="small" color={colors.text2}>{t('Sugerencia: hazlo más pequeño o átalo a algo que ya haces cada día.', 'Tip: make it smaller or attach it to something you already do daily.')}</Txt> : null}
            </Card>
          );
        })}
        <Card style={{ gap: space.sm }}>
          <Label>{t('Nuevo hábito', 'New habit')}</Label>
          <Field testID="habit-name" value={name} onChangeText={setName} placeholder={t('Leer 15 minutos', 'Read 15 minutes')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {AREAS.map(([k, es, en]) => <Chip key={k} label={t(es, en)} selected={area === k} onPress={() => setArea(k)} />)}
          </View>
          <Txt v="small" color={colors.text2}>{t('Veces por semana', 'Times per week')}</Txt>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <Chip key={n} testID={`pw-${n}`} label={String(n)} selected={perWeek === n} onPress={() => setPerWeek(n)} />)}
          </View>
          {goal ? <Chip label={`${link ? '✓ ' : ''}${t('Vincular a mi meta', 'Link to my goal')}`} selected={link} onPress={() => setLink(!link)} /> : null}
          <Button testID="habit-add" label={t('Añadir hábito', 'Add habit')} disabled={name.trim().length < 2} onPress={add} />
        </Card>
      </View>
    </Screen>
  );
}
