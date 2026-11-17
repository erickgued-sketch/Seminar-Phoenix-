// Level Player: LEARN → REINFORCE → REFLECT → APPLY (personalised) → done.
// PROVE happens later from Today (evidence), and REINFORCE LATER via spaced review (?review=1).
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, PanResponder, Pressable, View } from 'react-native';
import { Art } from '@/components/Art';
import { Clip } from '@/components/Clip';
import { Icon } from '@/components/Icon';
import { ExerciseView, shuffle } from '@/components/Exercises';
import { Confetti, CountUp, Float, PopIn, Rays, Slide } from '@/components/fx';
import { Rai, RaiSays } from '@/components/Rai';
import { Bar, Button, Card, Enter, Field, IconButton, Label, Note, Pill, Screen, Txt, haptic } from '@/components/ui';
import { chapterOf, levelById, path } from '@/content/curriculum';
import { chapterArt } from '@/content/art';
import { useLang, useT } from '@/lib/i18n';
import { play } from '@/lib/sound';
import { today } from '@/lib/dates';
import { milestoneOf } from '@/lib/progress';
import { activeGoal, useStore } from '@/lib/store';
import { chapterTint, colors, elevation, radius, space } from '@/theme/tokens';

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
  const [dir, setDir] = useState<1 | -1>(1);
  const [streakUp, setStreakUp] = useState(0); // > 0 when this completion extended the daily streak

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
    play(ok ? 'correct' : 'wrong');
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
      play('complete');
      return setPhase('done');
    }
    setPhase('reflect');
  };
  const restart = () => {
    setHearts(HEARTS); setCorrect(0); setExI(0); setCard(0); setResult(null); setAttempt((a) => a + 1); setPhase('learn');
  };
  const finish = () => {
    const firstToday = useStore.getState().streak.lastActive !== today();
    completeLevel(level.id, { score, reflection: reflection.trim(), commit: commit.trim() || level.apply[lang] });
    const m = milestoneOf(level.id);
    // One sound per beat: the moment itself, then (if earned) the streak flame as the stats land.
    play(m?.kind === 'program' ? 'celebrate' : m?.kind === 'chapter' ? 'unlock' : n % 5 === 0 ? 'levelup' : 'complete');
    if (firstToday) {
      setStreakUp(useStore.getState().streak.current);
      setTimeout(() => play('streak', 0.8), 1100);
    }
    haptic('ok');
    setPhase('done');
  };
  const exit = () => (first === '1' ? router.replace('/today') : router.canGoBack() ? router.back() : router.replace('/journey'));

  // ---------- top bar ----------
  const top = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm }}>
      <IconButton icon="close" plain label={t('Salir del nivel', 'Leave level')} onPress={exit} color={colors.text3} />
      <View style={{ flex: 1 }}><Bar value={at / steps} color={colors.success} height={16} /></View>
      {!isReview ? (
        <View accessible accessibilityLabel={t(`${hearts} vidas`, `${hearts} hearts`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 44, justifyContent: 'flex-end' }}>
          <Icon name="heart" color={colors.danger} size={22} filled />
          <Txt v="h3" color={colors.danger}>{Math.max(0, hearts)}</Txt>
        </View>
      ) : <Icon name="repeat" color={colors.infoDeep} size={22} weight={2.4} />}
    </View>
  );

  // ---------- LEARN ----------
  if (phase === 'learn') {
    const c = level.cards[card];
    const last = card === level.cards.length - 1;
    const go = (d: 1 | -1) => {
      if (d === 1 && last) { play('card'); return setPhase('reinforce'); }
      const to = card + d;
      if (to < 0) return;
      setDir(d); play('card', 0.7); haptic(); setCard(to);
    };
    // Swipe left = next card, swipe right = previous (buttons stay as the accessible path).
    const swipe = PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_e, g) => { if (g.dx < -50) go(1); else if (g.dx > 50) go(-1); },
    });
    return (
      <Screen footer={
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {card > 0 ? <Button kind="ghost" label="" icon="back" a11y={t('Anterior', 'Previous')} sound={null} onPress={() => go(-1)} style={{ width: 64 }} /> : null}
          <Button testID="next-card" style={{ flex: 1 }} sound={null} iconRight={last ? 'bolt' : 'arrow'} label={last ? t('¡A practicar!', 'Let’s practice!') : t('Siguiente', 'Next')} onPress={() => go(1)} />
        </View>
      }>
        {top}
        <Slide k={`c${card}`} dir={dir}>
          <View style={{ gap: space.md }} {...swipe.panHandlers}>
            {card === 0 ? (
              <View style={{ borderRadius: radius.lg, overflow: 'hidden', ...elevation(1) }}>
                <Image source={chapterArt[chapterOf(level.chapter).art]} style={{ width: '100%', height: 176 }} resizeMode="cover" accessibilityIgnoresInvertColors />
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: chapterTint[(level.chapter - 1) % chapterTint.length] }} />
                <View style={{ position: 'absolute', left: 12, top: 12, backgroundColor: colors.glass, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Txt v="label" color={colors.primaryDeep}>{t(`NIVEL ${n}`, `LEVEL ${n}`)} · {chapterOf(level.chapter).title[lang].toUpperCase()}</Txt>
                </View>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityLabel={`${card + 1} / ${level.cards.length}`}>
              {level.cards.map((_, i) => <View key={i} style={{ flex: i === card ? 2.4 : 1, height: 6, borderRadius: 3, backgroundColor: i <= card ? colors.primary : colors.line }} />)}
            </View>
            <Card level={2} style={{ gap: space.md, padding: space.lg }}>
              <Label>{card === 0 ? level.title[lang] : `${t('Tarjeta', 'Card')} ${card + 1} / ${level.cards.length}`}</Label>
              <Txt v="h1">{c.title[lang]}</Txt>
              <Txt v="body" style={{ fontSize: 18, lineHeight: 28 }}>{c.body[lang]}</Txt>
              <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.md, gap: 6, borderLeftWidth: 4, borderLeftColor: colors.primary }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="sparkle" color={colors.primaryDeep} size={16} weight={2.3} />
                  <Txt v="label" color={colors.primaryDeep}>{t('EJEMPLO', 'EXAMPLE')}</Txt>
                </View>
                <Txt v="body" color={colors.text}>{c.example[lang]}</Txt>
              </View>
            </Card>
            {last ? <RaiSays state="encouraging"><Txt v="label" color={colors.primaryDeep}>{t('RECUERDA ESTO', 'REMEMBER THIS')}</Txt><Txt v="bodyBold">{level.principle[lang]}</Txt></RaiSays> : null}
            {last && level.caveat ? <Note>{level.caveat[lang]}</Note> : null}
            {card === 0 ? <Txt v="small" color={colors.text3}>{t(`Fuente: Seminario Fénix, pp. ${level.pages[0]}–${level.pages[level.pages.length - 1]}. Lección original, sin texto copiado.`, `Source: Seminario Fénix, pp. ${level.pages[0]}–${level.pages[level.pages.length - 1]}. Original lesson, no copied text.`)}</Txt> : null}
            {card === 0 && level.cards.length > 1 ? <Txt v="small" color={colors.text3} center>{t('Desliza o toca «Siguiente»', 'Swipe or tap “Next”')}</Txt> : null}
          </View>
        </Slide>
      </Screen>
    );
  }

  // ---------- REINFORCE ----------
  if (phase === 'reinforce') {
    return (
      <Screen footerBg={result === null ? undefined : result ? colors.successSoft : colors.dangerSoft} footer={result !== null ? (
        <Enter k={`${exI}-${String(result)}`}>
          <View style={{ gap: space.sm }} accessibilityLiveRegion="polite">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Rai state={result ? 'happy' : 'encouraging'} size={72} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: result ? colors.success : colors.danger, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={result ? 'check' : 'refresh'} color={result ? colors.onSuccess : colors.onDanger} size={16} weight={3} />
                  </View>
                  <Txt v="h2" color={result ? colors.successDeep : colors.dangerDeep}>{result ? t('¡Correcto!', 'Correct!') : t('Casi. Mira por qué:', 'Almost. Here is why:')}</Txt>
                </View>
                <Txt v="body" color={colors.text}>{ex.why[lang]}</Txt>
              </View>
            </View>
            <Button testID="continue" kind={result ? 'success' : 'danger'} iconRight="arrow" label={t('Continuar', 'Continue')} onPress={next} />
          </View>
        </Enter>
      ) : undefined}>
        {top}
        {isReview ? <Label color={colors.infoDeep}>{`${t('Repaso', 'Review')} · ${level.title[lang]}`}</Label> : null}
        <Slide k={`e${exI}-${attempt}`}>
          <View style={{ paddingTop: space.sm }}>
            <ExerciseView key={`${exI}-${attempt}`} ex={ex} lang={lang} seed={`${level.id}-${exI}`} locked={result !== null} onResult={answer} t={t} />
          </View>
        </Slide>
      </Screen>
    );
  }

  // ---------- out of hearts: supportive, never shaming ----------
  if (phase === 'rest') {
    return (
      <Screen footer={<Button testID="retry" icon="refresh" label={t('Repasar las tarjetas', 'Review the cards')} onPress={restart} />}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md }}>
          <Rai state="breathing" size={200} breathe={4000} />
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Icon name="clock" color={colors.primaryDeep} size={16} weight={2.4} /><Label>{t('Reflexiona · 30 segundos', 'Reflect · 30 seconds')}</Label></View>
            <RaiSays state="thinking"><Txt v="bodyBold">{level.reflect[lang]}</Txt></RaiSays>
            <Field testID="reflect-input" multiline value={reflection} onChangeText={setReflection} placeholder={t('Escribe lo primero que te venga a la mente…', 'Write the first thing that comes to mind…')} />
            <Note color={colors.text3}>{t('Tu reflexión es privada y se guarda en tu dispositivo.', 'Your reflection is private and stored on your device.')}</Note>
          </View>
        </Enter>
      </Screen>
    );
  }

  // ---------- APPLY ----------
  if (phase === 'apply') {
    return (
      <Screen footer={<Button testID="commit" kind="success" icon="check" label={t('Me comprometo a hacerlo hoy', 'I commit to doing it today')} onPress={finish} />}>
        {top}
        <Enter>
          <View style={{ gap: space.md }}>
            <Label>{`${t('Aplica', 'Apply')} · ${level.applyMinutes} min`}</Label>
            <Card level={2} style={{ gap: space.sm, flexDirection: 'row', alignItems: 'flex-start' }}>
              <Art name="goal" size={56} />
              <View style={{ flex: 1, gap: space.sm }}>
              <Txt v="h2">{t('Tu acción de hoy', 'Your action for today')}</Txt>
              <Txt v="body" style={{ fontSize: 17 }}>{level.apply[lang]}</Txt>
              </View>
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
  // A staged reveal: hero (clip or rays + Rai) → headline → stats pop in one by one → takeaway card.
  const ms = isReview ? null : milestoneOf(level.id);
  const milestone = !isReview && !ms && n % 5 === 0;
  const headline = isReview ? t('¡Repaso hecho!', 'Review done!')
    : ms?.kind === 'program' ? t('¡Completaste el programa Fénix!', 'You completed the Fénix program!')
    : ms?.kind === 'chapter' ? t(`Capítulo ${ms.next.n} desbloqueado`, `Chapter ${ms.next.n} unlocked`)
    : first === '1' ? t('Cumpliste tu primera promesa', 'You kept your first promise')
    : milestone ? t(`¡Hito: nivel ${n}!`, `Milestone: level ${n}!`) : t('¡Nivel completado!', 'Level complete!');
  return (
    <Screen tint={milestone || ms ? colors.primarySoft : undefined} footer={<Button testID="done" iconRight="arrow" label={first === '1' ? t('Ver mi programa', 'See my program') : ms?.kind === 'chapter' ? t('Empezar el capítulo', 'Start the chapter') : t('Continuar', 'Continue')} onPress={exit} />}>
      <Confetti k={level.id} count={isReview ? 18 : ms ? 70 : milestone ? 60 : 40} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.md, paddingVertical: space.md }}>
        {ms ? (
          <PopIn>
            <Clip testID="milestone-clip" name={ms.kind === 'program' ? 'complete' : 'unlock'} style={{ width: 236, height: 236, borderRadius: radius.xl, borderWidth: 4, borderColor: colors.surface, ...elevation(2) }} label={ms.kind === 'program' ? t('Rai levanta una estrella dorada', 'Rai raises a golden star') : t('Rai salta de alegría', 'Rai jumps for joy')} />
          </PopIn>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', width: 260, height: 240 }}>
            <Rays size={300} color={milestone ? colors.primary : colors.gold} />
            <Rai state={isReview ? 'happy' : milestone ? 'levelup' : 'celebrate'} size={220} />
          </View>
        )}
        <PopIn delay={150}>
          <Txt v="hero" center>{headline}</Txt>
        </PopIn>
        {ms?.kind === 'chapter' ? <Txt v="h3" color={colors.primaryDeep} center>{ms.next.title[lang]}</Txt> : null}
        {ms?.kind === 'program' ? <Txt v="body" color={colors.text2} center>{t(`${n} niveles completados. Sigue repasando y aplicando: ahí es donde ocurre el cambio.`, `${n} levels completed. Keep reviewing and applying: that is where the change happens.`)}</Txt> : null}
        {first === '1' ? <Txt v="body" color={colors.text2} center>{t('Tu próxima versión ya empezó.', 'Your next self has started.')}</Txt> : null}
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
          <PopIn delay={450}><Stat art="focus" label={t('Aciertos', 'Correct')} value={`${correct}/${exercises.length}`} /></PopIn>
          <PopIn delay={650}><Stat art="gem" label="XP" value={isReview ? 5 : 20 + Math.round(score / 10)} /></PopIn>
        </View>
        {streakUp > 0 ? (
          <PopIn delay={1100}>
            <Pill art="flame" value={t(`Racha: ${streakUp} ${streakUp === 1 ? 'día' : 'días'}`, `Streak: ${streakUp} ${streakUp === 1 ? 'day' : 'days'}`)} label={t(`Racha de ${streakUp} días`, `${streakUp}-day streak`)} />
          </PopIn>
        ) : null}
        {!isReview ? (
          <Enter delay={1250} style={{ alignSelf: 'stretch' }}>
            <Card level={2} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Float><Art name="star" size={34} /></Float>
                <Txt v="label" color={colors.primaryDeep}>{t('TE LLEVAS', 'YOU TAKE WITH YOU')}</Txt>
              </View>
              <Txt v="bodyBold" style={{ fontSize: 17 }}>{level.principle[lang]}</Txt>
              <Txt v="small" color={colors.text2}>{t('Repaso programado para mañana. Registra tu evidencia en «Hoy» cuando hayas aplicado la acción.', 'Review scheduled for tomorrow. Log your evidence in "Today" once you have applied the action.')}</Txt>
            </Card>
          </Enter>
        ) : null}
      </View>
    </Screen>
  );
}

function Stat({ label, value, art }: { label: string; value: string | number; art: 'focus' | 'gem' }) {
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, paddingVertical: 10, paddingHorizontal: space.md, alignItems: 'center', minWidth: 116, flexDirection: 'row', gap: 8, ...elevation(1) }}>
      <Art name={art} size={36} />
      <View>
        {typeof value === 'number' ? <CountUp to={value} prefix="+" color={colors.primaryDeep} /> : <Txt v="h2" color={colors.primaryDeep}>{value}</Txt>}
        <Txt v="label" color={colors.text2}>{label.toUpperCase()}</Txt>
      </View>
    </View>
  );
}
