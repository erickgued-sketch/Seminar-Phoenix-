// Conversational onboarding (< 2 minutes). No sign-up wall: it drops straight into Level 1.
import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Clip } from '@/components/Clip';
import { Rai, RaiSays } from '@/components/Rai';
import { Bar, Button, Chip, Enter, Field, Screen, Txt } from '@/components/ui';
import { totalLevels } from '@/content/curriculum';
import { useT } from '@/lib/i18n';
import { useStore, type CoachStyle } from '@/lib/store';
import { colors, palettes, radius, space } from '@/theme/tokens';

const AREAS: [string, string, string][] = [
  ['work', 'Trabajo y carrera', 'Work & career'], ['health', 'Salud y energía', 'Health & energy'], ['money', 'Dinero', 'Money'],
  ['relationships', 'Relaciones', 'Relationships'], ['mind', 'Mentalidad', 'Mindset'], ['discipline', 'Disciplina', 'Discipline'],
  ['learning', 'Aprendizaje', 'Learning'], ['purpose', 'Propósito', 'Purpose'],
];

export default function Onboarding() {
  const t = useT();
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const [step, setStep] = useState(0);
  const [areas, setAreas] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [why, setWhy] = useState('');
  const [minutes, setMinutes] = useState<3 | 10 | 25>(10);
  const [style, setStyle] = useState<CoachStyle>('warm');

  useEffect(() => {
    // Spanish is the base language; switch only if the device is clearly set to English.
    try { if (getLocales()[0]?.languageCode === 'en') setProfile({ lang: 'en' }); } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step !== 5) return;
    setProfile({ onboarded: true, areas, goalText: goal.trim(), why: why.trim(), minutes, coachStyle: style });
    const id = setTimeout(() => router.replace('/level/l01?first=1'), 1600);
    return () => clearTimeout(id);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (step === 0) {
    return (
      <Screen pad={false} scroll={false} edges={[]} footer={
        <>
          <Button testID="start" label={t('Empezar', 'Get started')} onPress={() => setStep(1)} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.sm }}>
            <Chip testID="lang-es" label="Español" selected={profile.lang === 'es'} onPress={() => setProfile({ lang: 'es' })} />
            <Chip testID="lang-en" label="English" selected={profile.lang === 'en'} onPress={() => setProfile({ lang: 'en' })} />
          </View>
        </>
      }>
        <View style={{ flex: 1 }}>
          <Clip name="welcome" loop style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} label={t('Rai mira un amanecer sobre un camino', 'Rai looks at a sunrise over a path')} />
          <View style={{ padding: space.lg, paddingTop: space.xxl + space.md, gap: space.sm }}>
            {/* The sunrise art is light in both appearances, so this text keeps the light palette's ink. */}
            <Txt v="label" color={palettes.light.primaryEdge}>NEXTME AI</Txt>
            <Txt v="hero" color={palettes.light.text} style={{ fontSize: 38, lineHeight: 42 }}>{t('Conviértete en tu próxima versión.', 'Become your next self.')}</Txt>
            <Txt v="h3" color={palettes.light.text2}>{t('Una acción a la vez.', 'One action at a time.')}</Txt>
          </View>
        </View>
      </Screen>
    );
  }

  if (step === 5) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md }}>
          <Rai state="walk" size={190} />
          <Txt v="h1" center>{t('Preparando tu programa…', 'Building your program…')}</Txt>
          <Txt v="body" color={colors.text2} center>{t(`${totalLevels} niveles · ${minutes} min al día`, `${totalLevels} levels · ${minutes} min a day`)}</Txt>
        </View>
      </Screen>
    );
  }

  const canNext = step === 1 ? areas.length > 0 : step === 2 ? goal.trim().length >= 4 : true;
  return (
    <Screen footer={<Button testID="ob-next" label={step === 4 ? t('Empezar mi primer nivel', 'Start my first level') : t('Continuar', 'Continue')} disabled={!canNext} onPress={() => setStep(step + 1)} />}>
      <View style={{ paddingVertical: space.md }}><Bar value={step / 5} height={10} /></View>
      <Enter k={step}>
        <View style={{ gap: space.md }}>
          {step === 1 ? (
            <>
              <RaiSays state="welcome"><Txt v="bodyBold">{t('Soy Rai. ¿Qué áreas de tu vida quieres mejorar? Elige hasta tres.', 'I’m Rai. Which areas of your life do you want to improve? Pick up to three.')}</Txt></RaiSays>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {AREAS.map(([k, es, en]) => (
                  <Chip key={k} testID={`area-${k}`} label={t(es, en)} selected={areas.includes(k)} onPress={() => setAreas(areas.includes(k) ? areas.filter((a) => a !== k) : areas.length < 3 ? [...areas, k] : areas)} />
                ))}
              </View>
            </>
          ) : step === 2 ? (
            <>
              <RaiSays state="thinking"><Txt v="bodyBold">{t('¿Qué quieres lograr? Dímelo con tus palabras; luego lo afinamos juntos.', 'What do you want to achieve? Say it in your own words; we will sharpen it together.')}</Txt></RaiSays>
              <Field testID="goal-input" label={t('Quiero…', 'I want to…')} value={goal} onChangeText={setGoal} placeholder={t('mejorar mi inglés y ser mejor líder', 'improve my Spanish and become a better leader')} />
              <Field testID="why-input" label={t('¿Por qué es importante para ti? (opcional)', 'Why does it matter to you? (optional)')} value={why} onChangeText={setWhy} multiline placeholder={t('Porque…', 'Because…')} />
            </>
          ) : step === 3 ? (
            <>
              <RaiSays state="encouraging"><Txt v="bodyBold">{t('¿Cuánto tiempo puedes dedicar al día? Con tres minutos ya se avanza.', 'How much time can you give each day? Three minutes already moves you forward.')}</Txt></RaiSays>
              {([3, 10, 25] as const).map((m) => (
                <Chip key={m} testID={`min-${m}`} label={`${m} min · ${m === 3 ? t('un nivel', 'one level') : m === 10 ? t('nivel + hábitos + reflexión', 'level + habits + reflection') : t('sesión completa con práctica', 'full session with practice')}`} selected={minutes === m} onPress={() => setMinutes(m)} />
              ))}
            </>
          ) : (
            <>
              <RaiSays state="focus"><Txt v="bodyBold">{t('¿Cómo prefieres que te acompañe tu coach?', 'How would you like your coach to work with you?')}</Txt></RaiSays>
              {([['warm', 'Cálido', 'Warm', 'Empático, positivo y cercano.', 'Empathetic, positive and close.'], ['direct', 'Directo', 'Direct', 'Claro, práctico y sin rodeos.', 'Clear, practical, no detours.'], ['elite', 'Élite', 'Elite', 'Exigente, estratégico y orientado a resultados.', 'Demanding, strategic, results-driven.']] as const).map(([k, es, en, des, den]) => (
                <View key={k} style={{ borderRadius: radius.md }}>
                  <Chip testID={`style-${k}`} label={`${t(es, en)} — ${t(des, den)}`} selected={style === k} onPress={() => setStyle(k)} />
                </View>
              ))}
              <Txt v="small" color={colors.text3}>{t('Sin registro: tu progreso se guarda en este dispositivo. Podrás cambiar todo esto después.', 'No sign-up: your progress is saved on this device. You can change all of this later.')}</Txt>
            </>
          )}
        </View>
      </Enter>
    </Screen>
  );
}
