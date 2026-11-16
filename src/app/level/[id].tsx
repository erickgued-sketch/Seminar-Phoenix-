// Level Player: LEARN → REINFORCE → REFLECT → APPLY (personalised) → done.
// PROVE happens later from Today (evidence), and REINFORCE LATER via spaced review (?review=1).
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { ExerciseView, shuffle } from '@/components/Exercises';
import { Rai, RaiSays } from '@/components/Rai';
import { Bar, Button, Card, Enter, Field, Label, Screen, Txt, haptic } from '@/components/ui';
import { chapterOf, levelById, path } from '@/content/curriculum';
import { chapterArt } from '@/content/art';
import { useLang, useT } from '@/lib/i18n';
import { activeGoal, useStore } from '@/lib/store';
import { colors, radius, space } from '@/theme/tokens';

type Phase = 'learn' | 'reinforce' | 'reflect' | 'apply' | 'done' | 'rest';
const HEARTS = 5;

export default function LevelPlayer() {
  const { id, review, first } = useLocalSearchParams<{ id: string; review?: string; first?: string }>();
  const t = useT();
  const lang = useLang();
  const level = levelById(id);
  const isReview = review === '1';
  const goal = useStore(activeGoal);
  const goalText = useStore((s) => s.profile.goalText);
  const completeLevel = useStore((s) => s.completeLevel);
  const reviewLevel = useStore((s) => s.reviewLevel);

  const exercises = useMemo(() => {
    if (!level) return [];
    return isReview ? shuffle(level.exercises, `${level.id}-r`).slice(0, 3) : level.exercises;
  }, [level, isReview]);

  const [phase, setPhase] = useState<Phase>(isReview ? 'reinforce' : 'learn');
  const [card, setCard] = useState(0);
  const [exI, setExI] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [reflection, setReflection] = useState('');
  const [commit, setCommit] = useState('');
  const [attempt, setAttempt] = useState(0);

  if (!level) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', gap: space.md }}>
          <Rai state="thinking" />
          <Txt v="h2" center>{t('Este nivel aún no está disponible', 'This level is not available yet')}</Txt>
          <Button label={t('Volver al camino', 'Back to the journey')} onPress={() => router.replace('/journey')} />
        </View>
      </Screen>
    );
  }

  const n = path.find((p) => p.id === level.id)?.n ?? 0;
  const steps = isReview ? exercises.length : level.cards.length + exercises.length + 2;
  const at = phase === 'learn' ? card : phase === 'reinforce' ? (isReview ? 0 : level.cards.length) + exI + (result !== null ? 1 : 0) : phase === 'reflect' ? steps - 2 : phase === 'apply' ? steps - 1 : steps;
  const ex = exercises[exI];
  const score = Math.round((correct / Math.max(1, exercises.length)) * 100);
  const personal = goal?.title || goalText;

  const answer = (ok: boolean) => {
    haptic(ok ? 'ok' : 'bad');
    setResult(ok);
    if (ok) setCorrect((c) => c + 1);
    else setHearts((h) => h - 1);
  };
  const next = () => {
    const outOfHearts = hearts <= 0;
    setResult(null);
    if (outOfHearts && !isReview) return setPhase('rest');
    if (exI + 1 < exercises.length) return setExI(exI + 1);
    if (isReview) {
      reviewLevel(level.id, correct >= exercises.length - 1);
      return setPhase('done');
    }
    setPhase('reflect');
  };
  const restart = () => {
    setHearts(HEARTS); setCorrect(0); setExI(0); setCard(0); setResult(null); setAttempt((a) => a + 1); setPhase('learn');
  };
  const finish = () => {
    completeLevel(level.id, { score, reflection: reflection.trim(), commit: commit.trim() || level.apply[lang] });
    setPhase('done');
  };
  const exit = () => (first === '1' ? router.replace('/today') : router.canGoBack() ? router.back() : router.replace('/journey'));

  // ---------- top bar ----------
  const top = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Salir del nivel', 'Leave level')} hitSlop={12} onPress={exit} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Txt v="h2" color={colors.text3}>✕</Txt>
      </Pressable>
      <View style={{ flex: 1 }}><Bar value={at / steps} color={colors.success} height={14} /></View>
      {!isReview ? <Txt v="h3" color={colors.danger} accessibilityLabel={t(`${hearts} vidas`, `${hearts} hearts`)}>♥ {Math.max(0, hearts)}</Txt> : null}
    </View>
  );

  // ---------- LEARN ----------
  if (phase === 'learn') {
    const c = level.cards[card];
    const last = card === level.cards.length - 1;
    return (
      <Screen footer={
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {card > 0 ? <Button kind="ghost" label="‹" onPress={() => setCard(card - 1)} style={{ width: 64 }} /> : null}
          <Button testID="next-card" style={{ flex: 1 }} label={last ? t('¡A practicar!', 'Let’s practice!') : t('Siguiente', 'Next')} onPress={() => (last ? setPhase('reinforce') : setCard(card + 1))} />
        </View>
      }>
        {top}
        <Enter k={`c${card}`}>
          <View style={{ gap: space.md }}>
            {card === 0 ? (
              <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
                <Image source={chapterArt[chapterOf(level.chapter).art]} style={{ width: '100%', height: 150 }} resizeMode="cover" accessibilityIgnoresInvertColors />
                <View style={{ position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(255,248,238,0.92)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Txt v="label" color={colors.primaryDeep}>{t(`NIVEL ${n}`, `LEVEL ${n}`)} · {level.title[lang].toUpperCase()}</Txt>
                </View>
              </View>
            ) : <Label>{`${t('Tarjeta', 'Card')} ${card + 1} / ${level.cards.length}`}</Label>}
            <Card style={{ gap: space.md }}>
              <Txt v="h1">{c.title[lang]}</Txt>
              <Txt v="body" style={{ fontSize: 18, lineHeight: 27 }}>{c.body[lang]}</Txt>
              <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.md, gap: 4 }}>
                <Txt v="label" color={colors.primaryDeep}>{t('EJEMPLO', 'EXAMPLE')}</Txt>
                <Txt v="body" color={colors.text}>{c.example[lang]}</Txt>
              </View>
            </Card>
            {last ? <RaiSays state="encouraging"><Txt v="label" color={colors.primaryDeep}>{t('RECUERDA ESTO', 'REMEMBER THIS')}</Txt><Txt v="bodyBold">{level.principle[lang]}</Txt></RaiSays> : null}
            {last && level.caveat ? <Txt v="small" color={colors.text2}>ⓘ {level.caveat[lang]}</Txt> : null}
            {card === 0 ? <Txt v="small" color={colors.text3}>{t(`Fuente: Seminario Fénix, pp. ${level.pages[0]}–${level.pages[level.pages.length - 1]}. Lección original, sin texto copiado.`, `Source: Seminario Fénix, pp. ${level.pages[0]}–${level.pages[level.pages.length - 1]}. Original lesson, no copied text.`)}</Txt> : null}
          </View>
        </Enter>
      </Screen>
    );
  }

  // ---------- REINFORCE ----------
  if (phase === 'reinforce') {
    return (
      <Screen footer={result !== null ? (
        <View style={{ gap: space.sm }} accessibilityLiveRegion="polite">
          <Txt v="h3" color={result ? colors.successDeep : colors.dangerDeep}>{result ? t('¡Correcto!', 'Correct!') : t('Casi. Mira por qué:', 'Almost. Here is why:')}</Txt>
          <Txt v="body">{ex.why[lang]}</Txt>
          <Button testID="continue" kind={result ? 'success' : 'primary'} label={t('Continuar', 'Continue')} onPress={next} />
        </View>
      ) : undefined}>
        {top}
        {isReview ? <Label color={colors.infoDeep}>{`${t('Repaso', 'Review')} · ${level.title[lang]}`}</Label> : null}
        <Enter k={`e${exI}-${attempt}`}>
          <View style={{ paddingTop: space.sm }}>
            <ExerciseView key={`${exI}-${attempt}`} ex={ex} lang={lang} seed={`${level.id}-${exI}`} locked={result !== null} onResult={answer} t={t} />
          </View>
        </Enter>
      </Screen>
    );
  }

  // ---------- out of hearts: supportive, never shaming ----------
  if (phase === 'rest') {
    return (
      <Screen footer={<Button testID="retry" label={t('Repasar las tarjetas', 'Review the cards')} onPress={restart} />}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md }}>
          <Rai state="breathing" size={180} />
          <Txt v="h1" center>{t('Respira. Vas bien.', 'Breathe. You are doing fine.')}</Txt>
          <Txt v="body" color={colors.text2} center>{t('Equivocarte es parte de aprender. Repasemos las tarjetas con calma y lo intentas de nuevo.', 'Mistakes are part of learning. Let’s calmly review the cards and try again.')}</Txt>
        </View>
      </Screen>
    );
  }

  // ---------- REFLECT ----------
  if (phase === 'reflect') {
    return (
      <Screen footer={<><Button testID="reflect-next" label={t('Continuar', 'Continue')} onPress={() => setPhase('apply')} disabled={reflection.trim().length < 3} /><Pressable accessibilityRole="button" onPress={() => setPhase('apply')} style={{ minHeight: 44, justifyContent: 'center' }}><Txt v="small" color={colors.text2} center>{t('Prefiero no escribirlo ahora', 'I’d rather not write it now')}</Txt></Pressable></>}>
        {top}
        <Enter>
          <View style={{ gap: space.md }}>
            <Label>{t('Reflexiona · 30 segundos', 'Reflect · 30 seconds')}</Label>
            <RaiSays state="thinking"><Txt v="bodyBold">{level.reflect[lang]}</Txt></RaiSays>
            <Field testID="reflect-input" multiline value={reflection} onChangeText={setReflection} placeholder={t('Escribe lo primero que te venga a la mente…', 'Write the first thing that comes to mind…')} />
            <Txt v="small" color={colors.text3}>{t('Tu reflexión es privada y se guarda en tu dispositivo.', 'Your reflection is private and stored on your device.')}</Txt>
          </View>
        </Enter>
      </Screen>
    );
  }

  // ---------- APPLY ----------
  if (phase === 'apply') {
    return (
      <Screen footer={<Button testID="commit" kind="success" label={t('Me comprometo a hacerlo hoy', 'I commit to doing it today')} onPress={finish} />}>
        {top}
        <Enter>
          <View style={{ gap: space.md }}>
            <Label>{`${t('Aplica', 'Apply')} · ${level.applyMinutes} min`}</Label>
            <Card style={{ gap: space.sm }}>
              <Txt v="h2">{t('Tu acción de hoy', 'Your action for today')}</Txt>
              <Txt v="body" style={{ fontSize: 17 }}>{level.apply[lang]}</Txt>
            </Card>
            {personal ? (
              <View style={{ backgroundColor: colors.infoSoft, borderRadius: radius.md, padding: space.md, gap: 4 }}>
                <Txt v="label" color={colors.infoDeep}>{t('PARA TU META', 'FOR YOUR GOAL')}</Txt>
                <Txt v="body">{t(`Aplícalo a «${personal}»: ¿en qué momento concreto de hoy lo harás?`, `Apply it to "${personal}": at which specific moment today will you do it?`)}</Txt>
              </View>
            ) : null}
            <Field testID="commit-input" label={t('Cuándo y dónde lo haré (opcional)', 'When and where I will do it (optional)')} value={commit} onChangeText={setCommit} placeholder={t('Hoy a las 18:00, antes de cenar…', 'Today at 6pm, before dinner…')} />
            <Txt v="small" color={colors.text2}>{t('Mañana te preguntaré qué pasó. Aprender sin aplicar no cuenta como progreso completo.', 'Tomorrow I will ask what happened. Learning without applying does not count as full progress.')}</Txt>
          </View>
        </Enter>
      </Screen>
    );
  }

  // ---------- DONE ----------
  return (
    <Screen footer={<Button testID="done" label={first === '1' ? t('Ver mi programa', 'See my program') : t('Continuar', 'Continue')} onPress={exit} />}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md }}>
        <Rai state={isReview ? 'happy' : n % 5 === 0 ? 'levelup' : 'celebrate'} size={200} />
        <Txt v="hero" center>{isReview ? t('¡Repaso hecho!', 'Review done!') : first === '1' ? t('Cumpliste tu primera promesa', 'You kept your first promise') : t('¡Nivel completado!', 'Level complete!')}</Txt>
        {first === '1' ? <Txt v="body" color={colors.text2} center>{t('Tu próxima versión ya empezó.', 'Your next self has started.')}</Txt> : null}
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Stat label={t('Aciertos', 'Correct')} value={`${correct}/${exercises.length}`} />
          <Stat label="XP" value={isReview ? '+5' : `+${20 + Math.round(score / 10)}`} />
        </View>
        {!isReview ? (
          <Card style={{ alignSelf: 'stretch', gap: 4 }}>
            <Txt v="label" color={colors.primaryDeep}>{t('TE LLEVAS', 'YOU TAKE WITH YOU')}</Txt>
            <Txt v="bodyBold">{level.principle[lang]}</Txt>
            <Txt v="small" color={colors.text2}>{t('Repaso programado para mañana. Registra tu evidencia en «Hoy» cuando hayas aplicado la acción.', 'Review scheduled for tomorrow. Log your evidence in "Today" once you have applied the action.')}</Txt>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, paddingVertical: 10, paddingHorizontal: space.lg, alignItems: 'center' }}>
      <Txt v="h2" color={colors.primaryDeep}>{value}</Txt>
      <Txt v="label" color={colors.text2}>{label.toUpperCase()}</Txt>
    </View>
  );
}
