import { Redirect } from 'expo-router';
import React from 'react';
import { useStore } from '@/lib/store';

export default function Index() {
  const onboarded = useStore((s) => s.profile.onboarded);
  return <Redirect href={onboarded ? '/today' : '/onboarding'} />;
}
