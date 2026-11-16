import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const d: Record<string, React.ReactNode> = {
  today: <><Circle cx="12" cy="12" r="4.2" /><Path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7" /></>,
  journey: <><Path d="M7 19.500h6.500a3.500 3.500 0 0 0 0-7h-3a3.500 3.500 0 0 1 0-7H17" /><Circle cx="5" cy="19.500" r="1.800" /><Circle cx="19" cy="5.500" r="1.800" /></>,
  coach: <Path d="M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H11l-4.5 3.5v-3.5h-2A1.5 1.5 0 0 1 3 15V7a1.5 1.5 0 0 1 1.5-1.5Z" />,
  mind: <Path d="M12 20c-4.5-1-7.5-4-8-8 2.5 0 4.5 1 6 3-1-3-.5-7 2-10 2.500 3 3 7 2 10 1.500-2 3.500-3 6-3-.5 4-3.500 7-8 8Z" />,
  me: <><Circle cx="12" cy="8" r="3.8" /><Path d="M4.5 20.500c.8-4 3.800-6 7.500-6s6.700 2 7.500 6" /></>,
};
export function Icon({ name, color, size = 26 }: { name: keyof typeof d | string; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
      {d[name]}
    </Svg>
  );
}
