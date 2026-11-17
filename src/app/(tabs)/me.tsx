// Profile & Progress: transparent score, stats, tools, preferences, and data controls.
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Share, View } from 'react-native';
import { Rai } from '@/components/Rai';
import { ScoreRing } from '@/components/ScoreRing';
import { Art, type ArtName } from '@/components/Art';
import { Bar, Button, Card, Chip, Field, Label, ListRow, Screen, Segment, Toggle, Txt } from '@/components/ui';
import { authored, totalLevels } from '@/content/curriculum';
import { today } from '@/lib/dates';
import { useLang, useT } from '@/lib/i18n';
import { cancelDaily, scheduleDaily } from '@/lib/notifications';
import { computeScore } from '@/lib/score';
import { snapshot, useStore, type CoachStyle } from '@/lib/store';
import { cloudEnabled } from '@/lib/supabase';
import { colors, elevation, radius, space } from '@/theme/tokens';

export default function Me() {
  const t = useT();
  const lang = useLang();
  const s = useStore();
  const score = computeScore(s, today());
  const done = authored.filter((l) => s.progress[l.id]).length;
  const applied = Object.values(s.progress).filter((p) => p.evidence).length;
  const [confirm, setConfirm] = useState(false);
  const [exported, setExported] = useState(false);
  const [reminder, setReminder] = useState<'idle' | 'on' | 'denied'>('idle');

  const exportData = async () => {
    const { hydrated, ...data } = snapshot();
    const json = JSON.stringify({ app: 'NEXTME AI', exportedAt: new Date().toISOString(), data }, null, 2);
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      a.download = `nextme-${today()}.json`;
      a.click();
    } else await Share.share({ title: 'NEXTME AI', message: json });
    setExported(true);
  };
  const link = (art: ArtName, es: string, en: string, subEs: string, subEn: string, href: string, testID: string) => (
    <ListRow testID={testID} art={art} title={t(es, en)} sub={t(subEs, subEn)} onPress={() => router.push(href as never)} />
  );

  return (
    <Screen>
      <View style={{ gap: space.md, paddingTop: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Rai state="idle" size={96} />
          <View style={{ flex: 1 }}>
            <Txt v="h1">{s.profile.name || t('Tu progreso', 'Your progress')}</Txt>
            <Txt v="bodyBold" color={colors.primaryDeep}>{t('Te estás convirtiendo en', 'You are becoming')}: {score.rank[lang]}</Txt>
          </View>
        </View>

        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <ScoreRing value={score.total} label="NEXTME" />
            <View style={{ flex: 1, gap: 4 }}>
              <Txt v="h3">NEXTME Score</Txt>
              <Txt v="small" color={colors.text2}>{t('Índice de actividad de tus últimos 7 días. Mide lo que practicaste, no tu valía, tu inteligencia ni tu salud mental.', 'An activity index of your last 7 days. It measures what you practiced, not your worth, intelligence or mental health.')}</Txt>
            </View>
          </View>
          {score.parts.map((p) => (
            <View key={p.key} style={{ gap: 3 }}>
              <View style={{ flexDirection: 'row' }}>
                <Txt v="bodyBold" style={{ flex: 1 }}>{p.label[lang]}</Txt>
                <Txt v="bodyBold" color={colors.text2}>{p.value}/{p.max}</Txt>
              </View>
              <Bar value={p.value / p.max} height={8} />
              <Txt v="small" color={colors.text3}>{p.hint[lang]}</Txt>
            </View>
          ))}
        </Card>

        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {([[`${done}/${totalLevels}`, t('Niveles', 'Levels'), 'trophy'], [String(applied), t('Aplicados', 'Applied'), 'shield'], [String(s.streak.current), t('Racha', 'Streak'), 'flame'], [String(s.xp), 'XP', 'gem']] as [string, string, ArtName][]).map(([v, k, art]) => (
            <View key={k} style={{ flex: 1, alignItems: 'center', paddingVertical: space.sm + 2, paddingHorizontal: 4, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, gap: 2, ...elevation(1) }}>
              <Art name={art} size={34} />
              <Txt v="h3" color={colors.text} numberOfLines={1} adjustsFontSizeToFit>{v}</Txt>
              <Txt v="label" color={colors.text2} style={{ fontSize: 10 }} numberOfLines={1}>{k.toUpperCase()}</Txt>
            </View>
          ))}
        </View>
        <Txt v="small" color={colors.text3}>{t(`Récord: ${s.streak.longest} días · ${s.streak.freezes} protector(es) de racha: si faltas un día, tu racha no se pierde.`, `Best: ${s.streak.longest} days · ${s.streak.freezes} streak freeze(s): miss one day and your streak is kept.`)}</Txt>

        <Label>{t('Herramientas', 'Tools')}</Label>
        {link('goal', 'Arquitecto de metas', 'Goal Architect', 'Meta, métrica y plan de 90 días', 'Goal, metric and 90-day plan', '/goal', 'link-goal')}
        {link('habits', 'Hábitos', 'Habits', 'Lo que repites se vuelve automático', 'What you repeat becomes automatic', '/habits', 'link-habits')}
        {link('review', 'Revisión CEO semanal', 'Weekly CEO Review', 'Tu semana en datos, en 5 minutos', 'Your week in data, in 5 minutes', '/review', 'link-review')}
        {link('future', 'Mi futuro yo', 'My future self', 'Proyección a partir de tus registros', 'A projection from your own records', '/future', 'link-future')}
        {link('vault', 'Bóveda de conocimiento', 'Knowledge Vault', 'Tus notas, que el coach también usa', 'Your notes, which the coach also uses', '/vault', 'link-vault')}
        {cloudEnabled ? link('shield', 'Cuenta y respaldo', 'Account & backup', 'Copia opcional en la nube', 'Optional cloud copy', '/account', 'link-account') : null}

        <Label>{t('Preferencias', 'Preferences')}</Label>
        <Card style={{ gap: space.md }}>
          <Field label={t('Tu nombre', 'Your name')} value={s.profile.name} onChangeText={(name) => s.setProfile({ name })} />
          <Field label={t('Mi identidad elegida', 'My chosen identity')} value={s.profile.identity} onChangeText={(identity) => s.setProfile({ identity })} placeholder={t('Soy una persona que cumple lo que se promete', 'I am a person who keeps my promises to myself')} />
          <View style={{ gap: 6 }}>
            <Txt v="label" color={colors.text2}>{t('APARIENCIA', 'APPEARANCE')}</Txt>
            <Segment testID="theme" value={s.profile.theme ?? 'system'} onChange={(theme) => s.setProfile({ theme })} options={[{ value: 'system', label: t('Sistema', 'System'), icon: 'auto' }, { value: 'light', label: t('Claro', 'Light'), icon: 'today' }, { value: 'dark', label: t('Oscuro', 'Dark'), icon: 'moon' }]} />
          </View>
          <View style={{ gap: 6 }}>
            <Txt v="label" color={colors.text2}>{t('IDIOMA', 'LANGUAGE')}</Txt>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Chip testID="set-es" label="Español" selected={lang === 'es'} onPress={() => s.setProfile({ lang: 'es' })} />
              <Chip testID="set-en" label="English" selected={lang === 'en'} onPress={() => s.setProfile({ lang: 'en' })} />
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <Txt v="label" color={colors.text2}>{t('ESTILO DEL COACH', 'COACH STYLE')}</Txt>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              {([['warm', 'Cálido', 'Warm'], ['direct', 'Directo', 'Direct'], ['elite', 'Élite', 'Elite']] as [CoachStyle, string, string][]).map(([k, es, en]) => <Chip key={k} label={t(es, en)} selected={s.profile.coachStyle === k} onPress={() => s.setProfile({ coachStyle: k })} />)}
            </View>
          </View>
          {Platform.OS !== 'web' ? (
            <View style={{ gap: 6 }}>
              <Field label={t('Recordatorio diario (HH:MM)', 'Daily reminder (HH:MM)')} value={s.profile.reminder} onChangeText={(reminder) => s.setProfile({ reminder })} />
              <View style={{ flexDirection: 'row', gap: space.sm }}>
                <Button small style={{ flex: 1 }} icon={reminder === 'on' ? 'check' : 'bell'} label={reminder === 'on' ? t('Activado', 'On') : t('Activar', 'Turn on')} disabled={!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.profile.reminder)} onPress={async () => setReminder((await scheduleDaily(s.profile.reminder, lang)) ? 'on' : 'denied')} />
                <Button small kind="ghost" style={{ flex: 1 }} label={t('Desactivar', 'Turn off')} onPress={async () => { await cancelDaily(); setReminder('idle'); }} />
              </View>
              {reminder === 'denied' ? <Txt v="small" color={colors.dangerDeep}>{t('Permiso de notificaciones denegado. Actívalo en los ajustes del sistema.', 'Notification permission denied. Enable it in system settings.')}</Txt> : null}
            </View>
          ) : null}
          <Toggle testID="sound-toggle" icon={s.profile.sound !== false ? 'sound' : 'mute'} label={t('Sonidos', 'Sounds')} hint={t('Toques, aciertos y celebraciones', 'Taps, correct answers and celebrations')} value={s.profile.sound !== false} onChange={(v) => s.setProfile({ sound: v })} />
          <Toggle testID="consent" icon="shield" label={t('Memoria del coach', 'Coach memory')} hint={t('El coach puede usar mis metas y registros para personalizar', 'The coach may use my goals and records to personalise')} value={s.profile.memoryConsent} onChange={(v) => s.setProfile({ memoryConsent: v })} />
        </Card>

        <Label>{t('Tus datos', 'Your data')}</Label>
        <Card style={{ gap: space.sm }}>
          <Txt v="small" color={colors.text2}>{cloudEnabled ? t('Tus datos viven en este dispositivo; la sincronización en la nube es opcional.', 'Your data lives on this device; cloud sync is optional.') : t('Todo se guarda solo en este dispositivo. No se envía nada a ningún servidor.', 'Everything is stored only on this device. Nothing is sent to any server.')}</Txt>
          <Button testID="export" kind="ghost" small icon={exported ? 'check' : 'download'} label={exported ? t('Exportado', 'Exported') : t('Exportar mis datos (JSON)', 'Export my data (JSON)')} onPress={exportData} />
          {confirm ? (
            <>
              <Txt v="small" color={colors.dangerDeep}>{t('Esto borra metas, hábitos, reflexiones y progreso de este dispositivo. No se puede deshacer.', 'This erases goals, habits, reflections and progress from this device. It cannot be undone.')}</Txt>
              <Button testID="delete-confirm" kind="danger" small label={t('Sí, borrar todo', 'Yes, erase everything')} onPress={() => { s.resetAll(); router.replace('/onboarding'); }} />
              <Button kind="ghost" small label={t('Cancelar', 'Cancel')} onPress={() => setConfirm(false)} />
            </>
          ) : <Button testID="delete" kind="danger" small icon="trash" label={t('Eliminar todos mis datos', 'Delete all my data')} onPress={() => setConfirm(true)} />}
        </Card>

        <Txt v="small" color={colors.text3} center>{t('NEXTME AI es una herramienta educativa de desarrollo personal inspirada en ideas del Seminario Fénix, reescritas como lecciones originales. No ofrece diagnóstico ni tratamiento médico o psicológico, ni asesoría financiera, y no garantiza resultados.', 'NEXTME AI is an educational personal-development tool inspired by ideas from the Seminario Fénix, rewritten as original lessons. It offers no medical or psychological diagnosis or treatment, no financial advice, and guarantees no results.')}</Txt>
        <Txt v="small" color={colors.text3} center>v0.1.0</Txt>
      </View>
    </Screen>
  );
}
