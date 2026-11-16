// Mind Studio — guided practices from the seminar (plus clearly-labelled complements).
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { RaiSays } from '@/components/Rai';
import { Card, Label, Screen, Txt } from '@/components/ui';
import { practices } from '@/content/practices';
import { today } from '@/lib/dates';
import { useLang, useT } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme/tokens';

export default function Mind() {
  const t = useT();
  const lang = useLang();
  const doneToday = useStore((s) => s.days[today()]?.practices) ?? []; // fallback outside the selector keeps it referentially stable
  const journal = useStore((s) => s.journal);
  return (
    <Screen>
      <View style={{ paddingTop: space.sm, gap: space.md }}>
        <Txt v="h1">{t('Estudio mental', 'Mind Studio')}</Txt>
        <RaiSays state="breathing"><Txt v="bodyBold">{t('Aquí practicas lo aprendido: gratitud, reflexión, meditación, afirmaciones, metas y más.', 'This is where you practice what you learn: gratitude, reflection, meditation, affirmations, goals and more.')}</Txt></RaiSays>
        {practices.map((p) => {
          const count = journal.filter((j) => j.practiceId === p.id).length;
          return (
            <Card key={p.id} testID={`practice-${p.id}`} onPress={() => router.push(`/practice/${p.id}`)} label={p.title[lang]} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <Txt v="h1" style={{ fontSize: 34, lineHeight: 42 }}>{doneToday.includes(p.id) ? '✅' : p.icon}</Txt>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="h3">{p.title[lang]}</Txt>
                <Txt v="small" color={colors.text2} numberOfLines={2}>{p.what[lang]}</Txt>
                <Label color={p.origin === 'seminar' ? colors.primaryDeep : colors.infoDeep}>{`${p.minutes} min · ${p.origin === 'seminar' ? `${t('Seminario', 'Seminar')} p. ${p.pages[0]}` : t('Complemento', 'Complement')}${count ? ` · ${count}×` : ''}`}</Label>
              </View>
            </Card>
          );
        })}
        <Txt v="small" color={colors.text3} center>{t('Prácticas de reflexión y atención. No son tratamiento médico ni psicológico.', 'Reflection and attention practices. They are not medical or psychological treatment.')}</Txt>
      </View>
    </Screen>
  );
}
