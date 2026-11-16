// One screen renders every Mind Studio practice from its `mode`: list, text prompts, timer, steps.
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Rai } from '@/components/Rai';
import { Bar, Button, Card, Empty, Field, Header, Label, Screen, Txt, haptic } from '@/components/ui';
import { practiceById } from '@/content/practices';
import { useLang, useT } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { colors, radius, space } from '@/theme/tokens';
import { mmss } from '../focus';

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const lang = useLang();
  const p = practiceById(id);
  const logPractice = useStore((s) => s.logPractice);
  const affirmations = useStore((s) => s.affirmations);
  const setAffirmations = useStore((s) => s.setAffirmations);
  const journal = useStore((s) => s.journal);
  const history = journal.filter((j) => j.practiceId === id).slice(0, 5);

  const n = p?.mode === 'text' ? p.prompts!.length : p?.mode === 'steps' ? p.steps.length : (p?.listTarget ?? 0);
  const [items, setItems] = useState<string[]>(() => (p?.mode === 'affirm' && affirmations.length ? [...affirmations, ...Array(Math.max(0, n - affirmations.length)).fill('')] : Array(n).fill('')));
  const [checks, setChecks] = useState<boolean[]>(Array(n).fill(false));
  const [left, setLeft] = useState(p?.timerSeconds ?? 0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + left * 1000;
    const tick = setInterval(() => {
      const l = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) { setRunning(false); haptic('ok'); }
    }, 500);
    return () => clearInterval(tick);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return <Screen><Header title="" /><Empty emoji="🧭" title={t('Práctica no encontrada', 'Practice not found')} body="" /></Screen>;

  const filled = items.filter((x) => x.trim()).length;
  const total = p.timerSeconds ?? 0;
  const ready = p.mode === 'timer' ? left < total : p.mode === 'steps' ? checks.some(Boolean) : p.mode === 'list' || p.mode === 'affirm' ? filled >= Math.min(3, n) : filled >= 1;
  const save = () => {
    const out = p.mode === 'timer' ? [`${Math.round((total - left) / 60)} min`] : p.mode === 'steps' ? p.steps.filter((_, i) => checks[i]).map((s) => s[lang]) : p.mode === 'text' ? items.map((x, i) => (x.trim() ? `${p.prompts![i][lang]} ${x.trim()}` : '')).filter(Boolean) : items.map((x) => x.trim()).filter(Boolean);
    if (p.mode === 'affirm') setAffirmations(out);
    logPractice(p.id, out);
    setSaved(true);
  };
  const phase = Math.floor(((total - left) % 16) / 4); // box breathing: 4 × 4 s

  if (saved) {
    return (
      <Screen footer={<Button testID="practice-close" label={t('Listo', 'Done')} onPress={() => router.back()} />}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md }}>
          <Rai state="happy" size={180} />
          <Txt v="h1" center>{t('Práctica registrada', 'Practice logged')}</Txt>
          <Txt v="body" color={colors.text2} center>{t('+5 XP. Lo que practicas a diario es lo que cambia.', '+5 XP. What you practice daily is what changes.')}</Txt>
        </View>
      </Screen>
    );
  }

  return (
    <Screen footer={<Button testID="practice-save" kind="success" label={t('Guardar práctica', 'Save practice')} disabled={!ready} onPress={save} />}>
      <Header title={p.title[lang]} />
      <View style={{ gap: space.md }}>
        <Label color={p.origin === 'seminar' ? colors.primaryDeep : colors.infoDeep}>{`${p.minutes} min · ${p.origin === 'seminar' ? `${t('Seminario Fénix', 'Seminario Fénix')} p. ${p.pages.join(', ')}` : t('Práctica complementaria', 'Complementary practice')}`}</Label>
        <Txt v="body" style={{ fontSize: 17 }}>{p.what[lang]}</Txt>
        {p.note ? <Txt v="small" color={colors.text2}>ⓘ {p.note[lang]}</Txt> : null}

        {p.mode !== 'steps' && p.steps.length ? (
          <Card style={{ gap: 6 }}>
            {p.steps.map((s, i) => <Txt key={i} v="body">{i + 1}. {s[lang]}</Txt>)}
          </Card>
        ) : null}

        {p.mode === 'timer' ? (
          <View style={{ alignItems: 'center', gap: space.md }}>
            <Rai state="breathing" size={170} breathe={p.id === 'breathing' && running ? 4000 : undefined} />
            {p.id === 'breathing' && running ? <Txt v="h2" color={colors.infoDeep}>{[t('Inhala', 'Inhale'), t('Sostén', 'Hold'), t('Exhala', 'Exhale'), t('Sostén', 'Hold')][phase]}</Txt> : null}
            <Txt v="hero" style={{ fontSize: 56, lineHeight: 62 }}>{mmss(left)}</Txt>
            <View style={{ alignSelf: 'stretch' }}><Bar value={1 - left / total} color={colors.info} /></View>
            {left > 0 ? <Button testID="timer-toggle" kind={running ? 'ghost' : 'info'} label={running ? t('Pausar', 'Pause') : left < total ? t('Reanudar', 'Resume') : t('Comenzar', 'Begin')} onPress={() => setRunning(!running)} style={{ alignSelf: 'stretch' }} /> : null}
          </View>
        ) : null}

        {p.mode === 'steps' ? p.steps.map((s, i) => (
          <Pressable key={i} testID={`step-${i}`} accessibilityRole="checkbox" accessibilityState={{ checked: checks[i] }} onPress={() => { haptic(); setChecks(checks.map((c, j) => (j === i ? !c : c))); }} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', backgroundColor: checks[i] ? colors.successSoft : colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: checks[i] ? colors.success : colors.line, padding: space.md, minHeight: 56 }}>
            <Txt v="h3">{checks[i] ? '✓' : i + 1}</Txt>
            <Txt v="body" style={{ flex: 1 }}>{s[lang]}</Txt>
          </Pressable>
        )) : null}

        {p.mode === 'text' ? p.prompts!.map((q, i) => (
          <Field key={i} testID={`p-input-${i}`} label={q[lang]} multiline value={items[i]} onChangeText={(v) => setItems(items.map((x, j) => (j === i ? v : x)))} />
        )) : null}

        {p.mode === 'list' || p.mode === 'affirm' ? (
          <>
            <Txt v="small" color={colors.text2}>{filled} / {n}</Txt>
            {items.slice(0, Math.min(n, Math.max(3, filled + 1))).map((x, i) => (
              <Field key={i} testID={`p-input-${i}`} value={x} onChangeText={(v) => setItems(items.map((y, j) => (j === i ? v : y)))} placeholder={`${i + 1}. ${p.prompts?.[0]?.[lang] ?? ''}`} />
            ))}
          </>
        ) : null}

        {history.length ? (
          <View style={{ gap: space.sm, marginTop: space.md }}>
            <Label color={colors.text2}>{t('Tus últimas veces', 'Your recent entries')}</Label>
            {history.map((h) => (
              <Card key={h.id} style={{ gap: 2, padding: space.md }}>
                <Txt v="label" color={colors.text3}>{h.date}</Txt>
                {h.items.slice(0, 4).map((it, i) => <Txt key={i} v="small" numberOfLines={2}>• {it}</Txt>)}
              </Card>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
