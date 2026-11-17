// The four reinforce mini-games (+ scenario, a multiple-choice variant).
// Each one reports a single boolean through onResult and never shames a wrong answer.
import React, { useMemo, useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import type { Exercise, Lang } from '@/content/types';
import { play } from '@/lib/sound';
import { colors, radius, space, themed } from '@/theme/tokens';
import { Feedback } from './fx';
import { Icon } from './Icon';
import { Button, Txt, haptic } from './ui';

/** Deterministic shuffle so a level always looks the same (and tests are stable). */
export function shuffle<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Never hand back the solved order.
  if (out.length > 1 && out.every((v, i) => v === arr[i])) out.push(out.shift()!);
  return out;
}

type Props = { ex: Exercise; lang: Lang; seed: string; locked: boolean; onResult: (correct: boolean) => void; t: (es: string, en: string) => string };

const kindLabel = (ex: Exercise, t: Props['t']) =>
  ({ mc: t('Elige la respuesta', 'Choose the answer'), scenario: t('¿Qué harías?', 'What would you do?'), fill: t('Completa la frase', 'Fill in the blank'), order: t('Ordena las palabras', 'Arrange the words'), match: t('Une las parejas', 'Match the pairs') })[ex.type];

export function ExerciseView(p: Props) {
  // Wrong answers shake, right answers pop — feedback you can feel before reading it.
  const [fx, setFx] = useState({ shake: 0, pop: 0 });
  const onResult = (ok: boolean) => {
    setFx((f) => (ok ? { ...f, pop: f.pop + 1 } : { ...f, shake: f.shake + 1 }));
    p.onResult(ok);
  };
  const q = { ...p, onResult };
  return (
    <Feedback shake={fx.shake} pop={fx.pop} style={{ gap: space.md }}>
      <Txt v="label" color={colors.primaryDeep}>{kindLabel(p.ex, p.t).toUpperCase()}</Txt>
      {p.ex.type === 'order' ? <Order {...q} /> : p.ex.type === 'match' ? <Match {...q} /> : <Choice {...q} />}
    </Feedback>
  );
}

function Choice({ ex, lang, locked, onResult, t }: Props) {
  const styles = S();
  const [sel, setSel] = useState<number | null>(null);
  if (ex.type === 'order' || ex.type === 'match') return null;
  return (
    <View style={{ gap: space.md }}>
      <Txt v="h2">{ex.q[lang]}</Txt>
      <View style={{ gap: space.sm }} accessibilityRole="radiogroup">
        {ex.options.map((o, i) => {
          const on = sel === i;
          const right = locked && i === ex.answer;
          const wrong = locked && on && i !== ex.answer;
          return (
            <Pressable
              key={i}
              testID={`opt-${i}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: on, disabled: locked }}
              disabled={locked}
              onPress={() => { haptic(); play('select', 0.5); setSel(i); }}
              style={({ pressed }) => [styles.opt, styles.optRow, on && styles.optOn, right && styles.optRight, wrong && styles.optWrong, pressed && { transform: [{ translateY: 2 }], borderBottomWidth: 2, marginBottom: 2 }]}
            >
              <View style={[styles.badge, on && { backgroundColor: colors.info, borderColor: colors.info }, right && { backgroundColor: colors.success, borderColor: colors.success }, wrong && { backgroundColor: colors.danger, borderColor: colors.danger }]}>
                {right ? <Icon name="check" color={colors.onSuccess} size={16} weight={3.2} /> : wrong ? <Icon name="close" color={colors.onDanger} size={15} weight={3.2} /> : <Txt v="label" color={on ? colors.onInfo : colors.text2} style={{ letterSpacing: 0 }}>{'ABCDEF'[i]}</Txt>}
              </View>
              <Txt v="bodyBold" style={{ flex: 1 }} color={right ? colors.successDeep : wrong ? colors.dangerDeep : colors.text}>{o[lang]}</Txt>
            </Pressable>
          );
        })}
      </View>
      {!locked ? <Button testID="check" label={t('Comprobar', 'Check')} disabled={sel === null} onPress={() => onResult(sel === ex.answer)} /> : null}
    </View>
  );
}

function Order({ ex, lang, seed, locked, onResult, t }: Props) {
  const styles = S();
  const tokens = ex.type === 'order' ? ex.tokens[lang] : [];
  const pool = useMemo(() => shuffle(tokens.map((w, i) => ({ w, i })), seed), [seed, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const [picked, setPicked] = useState<number[]>([]);
  if (ex.type !== 'order') return null;
  const answer = picked.map((i) => tokens[i]).join(' ');
  return (
    <View style={{ gap: space.md }}>
      <Txt v="h2">{ex.q[lang]}</Txt>
      <View style={styles.answerRow} accessibilityLabel={answer || t('Respuesta vacía', 'Empty answer')}>
        {picked.map((i) => (
          <Pressable key={i} disabled={locked} accessibilityRole="button" accessibilityLabel={`${tokens[i]}, ${t('quitar', 'remove')}`} onPress={() => { haptic(); play('tap', 0.5); setPicked(picked.filter((x) => x !== i)); }} style={[styles.tile, styles.tileOn]}>
            <Txt v="bodyBold">{tokens[i]}</Txt>
          </Pressable>
        ))}
      </View>
      <View style={styles.tiles}>
        {pool.map(({ w, i }) => {
          const used = picked.includes(i);
          return (
            <Pressable key={i} testID={`tile-${i}`} disabled={locked || used} accessibilityRole="button" accessibilityLabel={w} onPress={() => { haptic(); play('select', 0.5); setPicked([...picked, i]); }} style={[styles.tile, used && { opacity: 0.22, borderStyle: 'dashed' }]}>
              <Txt v="bodyBold">{w}</Txt>
            </Pressable>
          );
        })}
      </View>
      {locked ? <Txt v="small" color={colors.text2}>{t('Orden correcto: ', 'Correct order: ')}{tokens.join(' ')}</Txt> : (
        <Button testID="check" label={t('Comprobar', 'Check')} disabled={picked.length !== tokens.length} onPress={() => onResult(answer === tokens.join(' '))} />
      )}
    </View>
  );
}

function Match({ ex, lang, seed, locked, onResult, t }: Props) {
  const styles = S();
  const pairs = ex.type === 'match' ? ex.pairs : [];
  const right = useMemo(() => shuffle(pairs.map((_, i) => i), seed), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [a, setA] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [miss, setMiss] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  if (ex.type !== 'match') return null;
  const tapB = (i: number) => {
    if (a === null) return;
    if (a === i) {
      haptic('ok');
      play('check', 0.7);
      const next = [...done, i];
      setDone(next);
      setA(null);
      if (next.length === pairs.length) onResult(miss === 0);
    } else {
      haptic('bad');
      play('wrong', 0.5);
      setMiss(miss + 1);
      setFlash(i);
      setTimeout(() => setFlash(null), 350);
      setA(null);
    }
  };
  return (
    <View style={{ gap: space.md }}>
      <Txt v="h2">{ex.q[lang]}</Txt>
      <Txt v="small" color={colors.text2}>{t('Toca una tarjeta de la izquierda y luego su pareja.', 'Tap a card on the left, then its match.')}</Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1, gap: space.sm }}>
          {pairs.map((p, i) => (
            <Pressable key={i} testID={`ma-${i}`} disabled={locked || done.includes(i)} accessibilityRole="button" accessibilityState={{ selected: a === i }} onPress={() => { haptic(); play('select', 0.5); setA(i); }} style={[styles.opt, styles.matchCell, a === i && styles.optOn, done.includes(i) && styles.optRight]}>
              <Txt v="small" style={{ fontFamily: 'Nunito_700Bold' }}>{p.a[lang]}</Txt>
            </Pressable>
          ))}
        </View>
        <View style={{ flex: 1, gap: space.sm }}>
          {right.map((i) => (
            <Pressable key={i} testID={`mb-${i}`} disabled={locked || done.includes(i)} accessibilityRole="button" onPress={() => tapB(i)} style={[styles.opt, styles.matchCell, done.includes(i) && styles.optRight, flash === i && styles.optWrong]}>
              <Txt v="small" style={{ fontFamily: 'Nunito_700Bold' }}>{pairs[i].b[lang]}</Txt>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const S = themed(() => ({
  opt: { minHeight: 58, borderRadius: radius.md, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.lineStrong, backgroundColor: colors.surface, paddingHorizontal: space.md, paddingVertical: 12, justifyContent: 'center' } as ViewStyle,
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12 } as ViewStyle,
  optOn: { borderColor: colors.info, backgroundColor: colors.infoSoft } as ViewStyle,
  optRight: { borderColor: colors.success, backgroundColor: colors.successSoft } as ViewStyle,
  optWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft } as ViewStyle,
  badge: { width: 30, height: 30, borderRadius: 10, borderWidth: 2, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  matchCell: { minHeight: 72, paddingHorizontal: 10 } as ViewStyle,
  answerRow: { minHeight: 64, flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, borderBottomWidth: 2, borderBottomColor: colors.lineStrong, paddingBottom: space.sm, alignContent: 'flex-start' } as ViewStyle,
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' } as ViewStyle,
  tile: { minHeight: 46, paddingHorizontal: 14, borderRadius: radius.sm, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.lineStrong, backgroundColor: colors.surface, justifyContent: 'center' } as ViewStyle,
  tileOn: { borderColor: colors.info, backgroundColor: colors.infoSoft } as ViewStyle,
}));
