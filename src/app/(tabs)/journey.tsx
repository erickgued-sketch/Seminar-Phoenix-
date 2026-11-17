// My Journey — the winding map of the whole Fénix program.
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, Pressable, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Rai } from '@/components/Rai';
import { Bar, Button, Card, Label, Screen, Txt, haptic, useReduceMotion } from '@/components/ui';
import { chapterArt } from '@/content/art';
import { authored, chapters, path, totalLevels, type PathNode } from '@/content/curriculum';
import { today } from '@/lib/dates';
import { useLang, useT } from '@/lib/i18n';
import { dueReviews, isUnlocked, nextLevel } from '@/lib/progress';
import { useStore } from '@/lib/store';
import { chapterTint, colors, elevation, radius, space } from '@/theme/tokens';

const OFFSETS = [0, 52, 84, 52, 0, -52, -84, -52];

export default function Journey() {
  const t = useT();
  const lang = useLang();
  const progress = useStore((s) => s.progress);
  const s = { progress };
  const current = nextLevel(s);
  const due = dueReviews(s, today());
  const done = authored.filter((l) => progress[l.id]).length;
  const [info, setInfo] = useState<PathNode | null>(null);

  return (
    <Screen>
      <View style={{ paddingTop: space.sm, gap: 6 }}>
        <Txt v="label" color={colors.text2}>{t('PROGRAMA FÉNIX', 'FÉNIX PROGRAM')}</Txt>
        <Txt v="h1">{t(`Nivel ${Math.min(done + 1, totalLevels)} de tu ascenso`, `Level ${Math.min(done + 1, totalLevels)} of your rise`)}</Txt>
        <Bar value={done / totalLevels} />
        <Txt v="small" color={colors.text2}>{t(`${done} de ${totalLevels} niveles · ${authored.length} publicados`, `${done} of ${totalLevels} levels · ${authored.length} published`)}</Txt>
      </View>

      {due.length ? (
        <View style={{ marginTop: space.md }}>
          <Button testID="journey-review" kind="info" label={t(`Repasar ahora (${due.length})`, `Review now (${due.length})`)} onPress={() => router.push(`/level/${due[0].id}?review=1`)} />
        </View>
      ) : null}

      {chapters.map((ch) => {
        const nodes = path.filter((p) => p.chapter === ch.n);
        const chDone = nodes.filter((nd) => progress[nd.id]).length;
        return (
          <View key={ch.n} style={{ marginTop: space.lg }}>
            <View style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, ...elevation(1) }}>
              <Image source={chapterArt[ch.art]} style={{ width: '100%', height: 132 }} resizeMode="cover" accessibilityIgnoresInvertColors />
              <View style={{ height: 4, backgroundColor: chapterTint[(ch.n - 1) % chapterTint.length] }} />
              <View style={{ padding: space.md, backgroundColor: colors.surface, gap: 2 }}>
                <Txt v="label" color={colors.primaryDeep}>{t('CAPÍTULO', 'CHAPTER')} {ch.n} · {chDone}/{nodes.length}</Txt>
                <Txt v="h2">{ch.title[lang]}</Txt>
                <Txt v="small" color={colors.text2}>{ch.subtitle[lang]}</Txt>
              </View>
            </View>
            <View style={{ alignItems: 'center', paddingVertical: space.md, gap: space.md }}>
              {nodes.map((nd, i) => {
                const isDone = !!progress[nd.id];
                const isCurrent = nd.kind === 'level' && current?.id === nd.id;
                const unlocked = nd.kind === 'level' && isUnlocked(s, nd.id);
                const title = nd.kind === 'level' ? nd.level.title[lang] : nd.bp.title[lang];
                const x = OFFSETS[i % OFFSETS.length];
                const nx = OFFSETS[(i + 1) % OFFSETS.length];
                return (
                  <View key={nd.id} style={{ transform: [{ translateX: x }], alignItems: 'center' }}>
                    {i < nodes.length - 1 ? (
                      <View pointerEvents="none" style={{ position: 'absolute', top: 92, left: '50%', width: 0, height: 0 }}>
                        {[0.2, 0.45, 0.7].map((f) => <View key={f} style={{ position: 'absolute', width: 7, height: 7, borderRadius: 4, left: -3.5 + (nx - x) * f, top: 18 + f * 34, backgroundColor: isDone ? colors.goldEdge : colors.lineStrong, opacity: isDone ? 0.8 : 1 }} />)}
                      </View>
                    ) : null}
                    {isCurrent ? <View style={[{ position: 'absolute', top: -14, zIndex: 2 }, OFFSETS[i % OFFSETS.length] > 0 ? { right: '50%', marginRight: 44 } : { left: '50%', marginLeft: 44 }]} pointerEvents="none"><Rai state="walk" size={96} /></View> : null}
                    <Node
                      n={nd.n}
                      state={isDone ? 'done' : isCurrent ? 'current' : nd.kind === 'blueprint' ? 'soon' : 'locked'}
                      label={`${t('Nivel', 'Level')} ${nd.n}: ${title}`}
                      testID={`node-${nd.n}`}
                      onPress={() => {
                        haptic();
                        if (nd.kind === 'level' && unlocked) router.push(`/level/${nd.id}`);
                        else setInfo(nd);
                      }}
                    />
                    <Txt v="small" center color={isDone || isCurrent ? colors.text : colors.text3} style={{ maxWidth: 150, marginTop: 4, fontFamily: 'Nunito_700Bold' }} numberOfLines={2}>{title}</Txt>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      {info ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end' }} pointerEvents="box-none">
          <Pressable accessibilityLabel={t('Cerrar', 'Close')} style={{ position: 'absolute', top: 0, bottom: 0, left: -space.md, right: -space.md, backgroundColor: colors.scrim }} onPress={() => setInfo(null)} />
          <Card level={2} style={{ gap: space.sm, marginBottom: space.md }}>
            <Label>{`${t('Nivel', 'Level')} ${info.n}`}</Label>
            <Txt v="h2">{info.kind === 'level' ? info.level.title[lang] : info.bp.title[lang]}</Txt>
            <Txt v="body">{info.kind === 'level' ? info.level.principle[lang] : info.bp.principle[lang]}</Txt>
            <Txt v="small" color={colors.text2}>
              {info.kind === 'level'
                ? t('Completa el nivel anterior para desbloquearlo.', 'Complete the previous level to unlock it.')
                : t(`Lección en preparación. Está vinculada al seminario (pp. ${info.bp.pages[0]}–${info.bp.pages[info.bp.pages.length - 1]}) y se publicará cuando el motor de contenido la genere y pase la validación.`, `Lesson in preparation. It is mapped to the seminar (pp. ${info.bp.pages[0]}–${info.bp.pages[info.bp.pages.length - 1]}) and will be published once the content engine generates it and it passes validation.`)}
            </Txt>
            <Button kind="ghost" small label={t('Entendido', 'Got it')} onPress={() => setInfo(null)} />
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

function Node({ n, state, onPress, label, testID }: { n: number; state: 'done' | 'current' | 'locked' | 'soon'; onPress: () => void; label: string; testID: string }) {
  const reduce = useReduceMotion();
  const pulse = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (state !== 'current' || reduce) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [state, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  const c = { done: [colors.gold, colors.goldEdge, colors.onGold], current: [colors.primary, colors.primaryEdge, colors.onPrimary], locked: [colors.locked, colors.lockedEdge, colors.text3], soon: [colors.bg, colors.locked, colors.text3] }[state];
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={`${label}. ${state}`} onPress={onPress}>
      {state === 'current' ? <Animated.View style={{ position: 'absolute', width: 84, height: 84, left: -6, top: -6, borderRadius: 42, backgroundColor: colors.primary, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.32] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }} /> : null}
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c[1], paddingBottom: 6 }}>
        <View style={{ flex: 1, borderRadius: 36, backgroundColor: c[0], alignItems: 'center', justifyContent: 'center', borderWidth: state === 'soon' ? 2 : 0, borderColor: colors.locked, borderStyle: 'dashed' }}>
          {state === 'done' ? <Icon name="star" color={c[2]} size={30} filled weight={1.6} /> : state === 'locked' ? <Icon name="lock" color={c[2]} size={24} weight={2.4} /> : <Txt v="h2" color={c[2]}>{n}</Txt>}
        </View>
      </View>
    </Pressable>
  );
}
