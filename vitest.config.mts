import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests cover the pure logic and content (no React Native runtime needed).
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@react-native-async-storage/async-storage': fileURLToPath(new URL('./tests/stubs/async-storage.ts', import.meta.url)),
    },
  },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
