// AI Success Coach. Every answer: insight (with its source) → why → action < 5 min → question,
// then execution modes 2/10/25. Sources are labelled so the user can tell what comes from the
// seminar, from their own vault, from their records, and from the coach itself.
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Rai } from '@/components/Rai';
import { Button, Chip, Field, Screen, Txt } from '@/components/ui';
import { askCoach } from '@/lib/coach';
import { modes } from '@/lib/coach/compose';
import { useLang, useT } from '@/lib/i18n';
import { uid, useStore, type CoachReply } from '@/lib/store';
import { cloudEnabled } from '@/lib/supabase';
import { colors, radius, space } from '@/theme/tokens';

export default function Coach() {
  const t = useT();
  const lang = useLang();
  const chat = useStore((s) => s.chat);
  const pushChat = useStore((s) => s.pushChat);
  const clearChat = useStore((s) => s.clearChat);
  const style = useStore((s) => s.profile.coachStyle);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const send = async (msg: string) => {
    const m = msg.trim();
    if (!m || busy) return;
    setText(''); setError(false); setBusy(true);
    pushChat({ id: uid(), role: 'user', text: m, at: new Date().toISOString() });
    try {
      const reply = await askCoach(m);
      pushChat({ id: uid(), role: 'coach', reply, at: new Date().toISOString() });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  const starters = [
    t('¿Qué principio puedo aplicar hoy para mejorar mi disciplina?', 'Which principle can I apply today to improve my discipline?'),
    t('Estoy posponiendo una tarea importante', 'I am postponing an important task'),
    t('Me preocupa algo y no dejo de darle vueltas', 'I am worried about something and keep ruminating'),
    t('¿Cómo escribo bien una meta?', 'How do I write a goal properly?'),
  ];

  return (
    <Screen scroll={false} footer={
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}><Field testID="coach-input" value={text} onChangeText={setText} placeholder={t('Escribe a tu coach…', 'Message your coach…')} onSubmitEditing={() => send(text)} returnKeyType="send" /></View>
        <Button testID="coach-send" label="➤" onPress={() => send(text)} disabled={!text.trim() || busy} style={{ width: 60 }} />
      </View>
    }>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: space.sm }}>
        <View style={{ flex: 1 }}>
          <Txt v="h1">Coach</Txt>
          <Txt v="small" color={colors.text2}>{{ warm: t('Estilo cálido', 'Warm style'), direct: t('Estilo directo', 'Direct style'), elite: t('Estilo élite', 'Elite style') }[style]} · {cloudEnabled ? t('IA en la nube + local', 'Cloud AI + local') : t('modo local fundamentado', 'grounded local mode')}</Txt>
        </View>
        {chat.length ? <Pressable accessibilityRole="button" hitSlop={10} onPress={clearChat}><Txt v="small" color={colors.infoDeep}>{t('Borrar chat', 'Clear chat')}</Txt></Pressable> : null}
      </View>

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ gap: space.md, paddingVertical: space.md }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {!chat.length ? (
          <View style={{ alignItems: 'center', gap: space.md }}>
            <Rai state="thinking" size={150} />
            <Txt v="h3" center>{t('Cuéntame qué te frena o qué quieres lograr hoy.', 'Tell me what is holding you back or what you want to achieve today.')}</Txt>
            <Txt v="small" color={colors.text2} center>{t('Respondo con principios del programa y de tu bóveda, y siempre termino con una acción. No soy terapeuta ni asesor médico o financiero.', 'I answer with principles from the program and your vault, and always end with an action. I am not a therapist or a medical or financial adviser.')}</Txt>
            <View style={{ gap: space.sm, alignSelf: 'stretch' }}>
              {starters.map((q, i) => <Chip key={q} testID={`starter-${i}`} label={q} onPress={() => send(q)} />)}
            </View>
          </View>
        ) : null}
        {chat.map((m) => m.role === 'user' ? (
          <View key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '86%', backgroundColor: colors.primary, borderRadius: 20, borderBottomRightRadius: 6, padding: 12 }}>
            <Txt v="bodyBold" color={colors.onPrimary}>{m.text}</Txt>
          </View>
        ) : m.reply ? <ReplyCard key={m.id} r={m.reply} t={t} lang={lang} /> : null)}
        {busy ? <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}><ActivityIndicator color={colors.primaryDeep} /><Txt v="small" color={colors.text2}>{t('Buscando en el programa…', 'Searching the program…')}</Txt></View> : null}
        {error ? <Txt v="small" color={colors.dangerDeep}>{t('No pude responder. Revisa tu conexión e inténtalo de nuevo.', 'I could not answer. Check your connection and try again.')}</Txt> : null}
      </ScrollView>
    </Screen>
  );
}

function Row({ tag, color, children }: { tag: string; color: string; children: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Txt v="label" color={color}>{tag.toUpperCase()}</Txt>
      <Txt v="body">{children}</Txt>
    </View>
  );
}

function ReplyCard({ r, t, lang }: { r: CoachReply; t: (es: string, en: string) => string; lang: 'es' | 'en' }) {
  const src = r.source;
  const srcLabel = src.kind === 'seminar' || src.kind === 'practice'
    ? `${t('Seminario Fénix', 'Seminario Fénix')} · ${src.title}${src.pages.length ? ` · p. ${src.pages[0]}${src.pages.length > 1 ? `–${src.pages[src.pages.length - 1]}` : ''}` : ''}`
    : src.kind === 'vault' ? `${t('Tu bóveda', 'Your vault')} · ${src.title}` : t('Sin fuente: no encontré evidencia', 'No source: I found no evidence');
  return (
    <View testID="coach-reply" style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderBottomLeftRadius: 8, padding: space.md, gap: space.md, borderWidth: 2, borderColor: r.safety ? colors.danger : colors.line }}>
      <Row tag={t('Idea clave', 'Key insight')} color={colors.primaryDeep}>{r.insight}</Row>
      <View style={{ alignSelf: 'flex-start', backgroundColor: src.kind === 'none' ? colors.surfaceAlt : colors.infoSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
        <Txt v="small" color={src.kind === 'none' ? colors.text2 : colors.infoDeep} style={{ fontFamily: 'Nunito_700Bold' }}>{srcLabel}</Txt>
      </View>
      {r.caveat ? <Txt v="small" color={colors.text2}>ⓘ {r.caveat}</Txt> : null}
      <Row tag={t('Por qué importa · sugerencia del coach', 'Why it matters · coach suggestion')} color={colors.text2}>{r.why}</Row>
      {r.dataNote ? <Row tag={t('Tus datos', 'Your data')} color={colors.text2}>{r.dataNote}</Row> : null}
      <View style={{ backgroundColor: colors.successSoft, borderRadius: radius.md, padding: space.md, gap: 2 }}>
        <Txt v="label" color={colors.successDeep}>{t('ACCIÓN · MENOS DE 5 MIN', 'ACTION · UNDER 5 MIN')}</Txt>
        <Txt v="bodyBold">{r.action}</Txt>
      </View>
      <Row tag={t('Pregunta para ti', 'A question for you')} color={colors.primaryDeep}>{r.question}</Row>
      {!r.safety ? (
        <View style={{ gap: 6 }}>
          <Txt v="label" color={colors.text2}>{t('ELIGE TU MODO DE EJECUCIÓN', 'CHOOSE YOUR EXECUTION MODE')}</Txt>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {modes(lang).map((m) => <Button key={m.min} testID={`mode-${m.min}`} small kind="ghost" style={{ flex: 1 }} label={`${m.min} min`} onPress={() => router.push({ pathname: '/focus', params: { min: String(m.min), task: r.action } })} />)}
          </View>
        </View>
      ) : null}
      {r.engine === 'local' && src.kind !== 'none' ? <Txt v="small" color={colors.text3}>{t('Respuesta generada en tu dispositivo a partir del programa.', 'Answer generated on your device from the program.')}</Txt> : null}
    </View>
  );
}
