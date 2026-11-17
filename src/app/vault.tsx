// Knowledge Vault — the user's own authorised notes. Stored on-device; the coach searches them
// together with the program and cites them as "Your vault".
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Card, Empty, Field, Header, Label, Screen, Txt } from '@/components/ui';
import { search } from '@/lib/coach/retrieval';
import { useLang, useT } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { colors, space } from '@/theme/tokens';

export default function Vault() {
  const t = useT();
  const lang = useLang();
  const vault = useStore((s) => s.vault);
  const addVault = useStore((s) => s.addVault);
  const removeVault = useStore((s) => s.removeVault);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const hits = q.trim().length > 2 ? search(q, lang, vault, 5) : [];
  return (
    <Screen>
      <Header title={t('Bóveda de conocimiento', 'Knowledge Vault')} />
      <View style={{ gap: space.md }}>
        <Txt v="small" color={colors.text2}>{t('Pega notas, resúmenes o apuntes propios o que tengas derecho a usar. Convertimos ideas en acciones; nunca copiamos ni redistribuimos el texto original.', 'Paste notes, summaries or material you own or have the right to use. We turn ideas into actions; we never copy or redistribute the original text.')}</Txt>
        <Card style={{ gap: space.sm }}>
          <Label>{t('Buscar en el programa y en tu bóveda', 'Search the program and your vault')}</Label>
          <Field testID="vault-q" value={q} onChangeText={setQ} placeholder={t('disciplina, miedo, metas…', 'discipline, fear, goals…')} />
          {hits.map((h) => (
            <View key={h.chunk.id} style={{ gap: 2, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.line }}>
              <Txt v="label" color={h.chunk.kind === 'vault' ? colors.infoDeep : colors.primaryDeep}>{h.chunk.kind === 'vault' ? t('TU BÓVEDA', 'YOUR VAULT') : `SEMINARIO · P. ${h.chunk.pages[0] ?? ''}`} · {h.chunk.title[lang].toUpperCase()}</Txt>
              <Txt v="small" numberOfLines={3}>{h.chunk.text[lang]}</Txt>
            </View>
          ))}
          {q.trim().length > 2 && !hits.length ? <Txt v="small" color={colors.text3}>{t('Sin resultados.', 'No results.')}</Txt> : null}
          <Button kind="ghost" small label={t('Preguntar al coach', 'Ask the coach')} onPress={() => router.push('/coach')} />
        </Card>
        <Card style={{ gap: space.sm }}>
          <Label>{t('Añadir material', 'Add material')}</Label>
          <Field testID="vault-title" value={title} onChangeText={setTitle} placeholder={t('Título (p. ej. Notas de mi libro)', 'Title (e.g. Notes from my book)')} />
          <Field testID="vault-text" value={text} onChangeText={setText} multiline placeholder={t('Pega aquí el texto…', 'Paste the text here…')} style={{ minHeight: 140 }} />
          <Button testID="vault-add" label={t('Guardar en mi bóveda', 'Save to my vault')} disabled={title.trim().length < 2 || text.trim().length < 30} onPress={() => { addVault(title.trim(), text.trim().slice(0, 60000)); setTitle(''); setText(''); }} />
        </Card>
        {vault.length ? vault.map((v) => (
          <Card key={v.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Txt v="h3">{v.title}</Txt>
              <Txt v="small" color={colors.text2}>{v.addedAt} · {v.text.length.toLocaleString()} {t('caracteres', 'characters')}</Txt>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t(`Eliminar ${v.title}`, `Delete ${v.title}`)} hitSlop={10} onPress={() => removeVault(v.id)}><Txt v="small" color={colors.dangerDeep}>{t('Eliminar', 'Delete')}</Txt></Pressable>
          </Card>
        )) : <Empty art="vault" title={t('Tu bóveda está vacía', 'Your vault is empty')} body={t('El coach ya conoce el programa Fénix. Añade tus notas para que también las use.', 'The coach already knows the Fénix program. Add your notes so it uses them too.')} />}
      </View>
    </Screen>
  );
}
