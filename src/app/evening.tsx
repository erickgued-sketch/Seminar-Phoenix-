// Evening Reflection — four questions. Answers feed the Weekly CEO Review and tomorrow's nudge.
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { RaiSays } from '@/components/Rai';
import { Button, Field, Header, Screen, Txt } from '@/components/ui';
import { today } from '@/lib/dates';
import { useT } from '@/lib/i18n';
import { pendingEvidence } from '@/lib/progress';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme/tokens';

export default function Evening() {
  const t = useT();
  const prev = useStore((s) => s.days[today()]?.evening);
  const prime = useStore((s) => s.days[today()]?.prime);
  const pending = useStore((s) => pendingEvidence(s).length);
  const setEvening = useStore((s) => s.setEvening);
  const [e, setE] = useState(prev ?? { won: '', learned: '', off: '', tomorrow: '' });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof e) => (v: string) => setE({ ...e, [k]: v });

  if (saved) {
    // Adjustment is derived only from what the user recorded today.
    const missed = prime ? prime.priorities.filter((p, i) => p && !prime.done[i]) : [];
    const tip = missed.length
      ? t(`Quedó pendiente «${missed[0]}». Ponla primera mañana y hazla antes de abrir el correo.`, `"${missed[0]}" is still open. Put it first tomorrow and do it before opening email.`)
      : pending
        ? t(`Tienes ${pending} acción(es) aprendida(s) sin evidencia. Mañana, registra una.`, `You have ${pending} learned action(s) with no evidence. Tomorrow, log one.`)
        : t('Día cerrado. Mañana empieza por tu prioridad número uno.', 'Day closed. Tomorrow, start with your number-one priority.');
    return (
      <Screen footer={<Button testID="evening-close" label={t('Cerrar el día', 'Close the day')} onPress={() => router.back()} />}>
        <View style={{ flex: 1, justifyContent: 'center', gap: space.md }}>
          <RaiSays state="happy" size={120}><Txt v="label" color={colors.primaryDeep}>{t('AJUSTE PARA MAÑANA', 'ADJUSTMENT FOR TOMORROW')}</Txt><Txt v="bodyBold">{tip}</Txt></RaiSays>
          {e.tomorrow ? <Txt v="body" color={colors.text2} center>{t('Tú dijiste', 'You said')}: «{e.tomorrow}»</Txt> : null}
        </View>
      </Screen>
    );
  }
  return (
    <Screen footer={<Button testID="evening-save" label={t('Guardar reflexión', 'Save reflection')} disabled={!Object.values(e).some((v) => v.trim())} onPress={() => { setEvening(e); setSaved(true); }} />}>
      <Header title={t('Reflexión nocturna', 'Evening reflection')} />
      <View style={{ gap: space.md }}>
        <Txt v="small" color={colors.text2}>{t('Dos minutos. Responde con honestidad; nadie más lo lee.', 'Two minutes. Answer honestly; no one else reads it.')}</Txt>
        <Field testID="ev-won" label={t('¿Qué logré hoy?', 'What did I achieve today?')} multiline value={e.won} onChangeText={set('won')} />
        <Field testID="ev-learned" label={t('¿Qué aprendí?', 'What did I learn?')} multiline value={e.learned} onChangeText={set('learned')} />
        <Field testID="ev-off" label={t('¿Qué no salió como esperaba?', 'What did not go as expected?')} multiline value={e.off} onChangeText={set('off')} />
        <Field testID="ev-tomorrow" label={t('¿Qué haré diferente mañana?', 'What will I do differently tomorrow?')} multiline value={e.tomorrow} onChangeText={set('tomorrow')} />
      </View>
    </Screen>
  );
}
