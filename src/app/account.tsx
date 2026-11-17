// Optional account: email code sign-in + manual backup/restore. Shown only when a backend is configured.
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { RaiSays } from '@/components/Rai';
import { Button, Card, Empty, Field, Header, Screen, Txt } from '@/components/ui';
import { backupNow, currentEmail, deleteCloudData, restore, sendCode, signOut, verifyCode } from '@/lib/backup';
import { useT } from '@/lib/i18n';
import { cloudEnabled } from '@/lib/supabase';
import { colors, space } from '@/theme/tokens';

export default function Account() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [signedIn, setSignedIn] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { currentEmail().then(setSignedIn); }, []);
  const run = async (fn: () => Promise<string | null>, ok: string) => {
    setBusy(true); setMsg('');
    const err = await fn().catch((e) => String(e));
    setBusy(false); setMsg(err ?? ok);
    return !err;
  };
  if (!cloudEnabled) return <Screen><Header title={t('Cuenta', 'Account')} /><Empty art="shield" title={t('Modo solo dispositivo', 'Device-only mode')} body={t('Esta compilación no tiene servidor configurado. Tu progreso se guarda en este dispositivo; usa «Exportar mis datos» para una copia.', 'This build has no server configured. Your progress is saved on this device; use "Export my data" for a copy.')} /></Screen>;
  return (
    <Screen>
      <Header title={t('Cuenta y respaldo', 'Account & backup')} />
      <View style={{ gap: space.md }}>
        {signedIn ? (
          <Card style={{ gap: space.sm }}>
            <Txt v="h3">{signedIn}</Txt>
            <Button label={t('Respaldar ahora', 'Back up now')} disabled={busy} onPress={() => run(backupNow, t('Respaldo guardado.', 'Backup saved.'))} />
            <Button kind="ghost" label={t('Restaurar en este dispositivo', 'Restore to this device')} disabled={busy} onPress={() => run(restore, t('Datos restaurados.', 'Data restored.'))} />
            <Button kind="danger" small label={t('Borrar mis datos del servidor', 'Delete my data from the server')} disabled={busy} onPress={() => run(deleteCloudData, t('Datos del servidor eliminados.', 'Server data deleted.'))} />
            <Button kind="ghost" small label={t('Cerrar sesión', 'Sign out')} onPress={async () => { await signOut(); setSignedIn(null); }} />
          </Card>
        ) : (
          <>
            <RaiSays state="encouraging"><Txt v="bodyBold">{t('Protege tu progreso y tu racha. Te enviamos un código; sin contraseñas.', 'Protect your progress and streak. We send you a code; no passwords.')}</Txt></RaiSays>
            <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            {sent ? <Field label={t('Código de 6 dígitos', '6-digit code')} value={code} onChangeText={setCode} keyboardType="number-pad" /> : null}
            <Button label={sent ? t('Verificar', 'Verify') : t('Enviar código', 'Send code')} disabled={busy || !/.+@.+\..+/.test(email) || (sent && code.length < 6)} onPress={async () => {
              if (!sent) { if (await run(() => sendCode(email.trim()), t('Código enviado.', 'Code sent.'))) setSent(true); }
              else if (await run(() => verifyCode(email.trim(), code.trim()), '')) setSignedIn(email.trim());
            }} />
          </>
        )}
        {msg ? <Txt v="small" color={colors.text2} accessibilityLiveRegion="polite">{msg}</Txt> : null}
        <Txt v="small" color={colors.text3}>{t('El respaldo incluye metas, hábitos, progreso y reflexiones. El historial del chat no se sube.', 'The backup includes goals, habits, progress and reflections. Chat history is not uploaded.')}</Txt>
      </View>
    </Screen>
  );
}
