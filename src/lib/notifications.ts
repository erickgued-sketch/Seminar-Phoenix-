// Local daily reminder (no server needed). Native only — the web build has no scheduled notifications.
import { Platform } from 'react-native';
import type { Lang } from '@/content/types';

const ID = 'nextme-daily';

export async function scheduleDaily(time: string, lang: Lang): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const N = await import('expo-notifications');
  const perm = await N.requestPermissionsAsync();
  if (!perm.granted) return false;
  if (Platform.OS === 'android') await N.setNotificationChannelAsync('daily', { name: 'Daily', importance: N.AndroidImportance.DEFAULT });
  await N.cancelScheduledNotificationAsync(ID).catch(() => {});
  const [hour, minute] = time.split(':').map(Number);
  await N.scheduleNotificationAsync({
    identifier: ID,
    content: lang === 'en'
      ? { title: 'Your 3-minute level is ready', body: 'One principle, one action. Rai is waiting.' }
      : { title: 'Tu nivel de 3 minutos está listo', body: 'Un principio, una acción. Rai te espera.' },
    trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: 'daily' },
  });
  return true;
}
export async function cancelDaily(): Promise<void> {
  if (Platform.OS === 'web') return;
  const N = await import('expo-notifications');
  await N.cancelScheduledNotificationAsync(ID).catch(() => {});
}
