// Any unknown path (deep link typo, static host without SPA fallback) goes back to the start.
import { Redirect } from 'expo-router';
import React from 'react';

export default function NotFound() {
  return <Redirect href="/" />;
}
