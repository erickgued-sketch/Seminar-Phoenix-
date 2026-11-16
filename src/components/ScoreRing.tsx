import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme/tokens';
import { Txt } from './ui';

export function ScoreRing({ value, size = 112, label }: { value: number; size?: number; label?: string }) {
  const stroke = size * 0.11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <View accessibilityRole="image" accessibilityLabel={`${label ?? 'Score'} ${value} / 100`} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.primary} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} />
      </Svg>
      <Txt v="h1" style={{ fontSize: size * 0.3, lineHeight: size * 0.34 }}>{value}</Txt>
      {label ? <Txt v="label" color={colors.text2} style={{ fontSize: 10 }}>{label}</Txt> : null}
    </View>
  );
}
