// Short cinematic clips (Higgsfield image-to-video, docs/ASSET_LIBRARY.md), played with expo-video.
// Always muted (the app's own sounds carry the moment), no controls, no fullscreen or PiP.
// Under Reduce Motion the poster still is shown instead, so nothing moves.
import { useEventListener } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useReduceMotion } from './ui';

export const clips = {
  welcome: require('../../assets/clips/welcome.mp4'),
  unlock: require('../../assets/clips/unlock.mp4'),
  complete: require('../../assets/clips/complete.mp4'),
} as const;
const posters = {
  welcome: require('../../assets/onboarding/hero.webp'),
  unlock: require('../../assets/clips/unlock-poster.webp'),
  complete: require('../../assets/clips/complete-poster.webp'),
} as const;
export type ClipName = keyof typeof clips;

export function Clip({ name, loop = false, onEnd, style, label, testID }: { name: ClipName; loop?: boolean; onEnd?: () => void; style?: StyleProp<ViewStyle>; label: string; testID?: string }) {
  const reduce = useReduceMotion();
  const player = useVideoPlayer(clips[name], (p) => {
    p.loop = loop;
    p.muted = true;
    p.audioMixingMode = 'mixWithOthers'; // never interrupt the user's music
  });
  useEffect(() => {
    if (reduce) player.pause();
    else player.play();
  }, [reduce, player]);
  useEventListener(player, 'playToEnd', () => onEnd?.());

  return (
    <View testID={testID} style={[{ overflow: 'hidden' }, style]} accessible accessibilityRole="image" accessibilityLabel={label}>
      {reduce ? (
        <Image source={posters[name]} contentFit="cover" style={{ width: '100%', height: '100%' }} />
      ) : (
        <VideoView
          player={player}
          nativeControls={false}
          contentFit="cover"
          fullscreenOptions={{ enable: false }}
          allowsPictureInPicture={false}
          playsInline
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </View>
  );
}
