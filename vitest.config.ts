import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration.
 *
 * Kept separate from `vite.config.ts` on purpose: the app config pulls in the
 * PWA and Tailwind plugins, which do not belong in a Node test run.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts', 'src/services/**/*.ts'],
      exclude: ['**/*.test.ts', 'src/lib/supabase.ts'],
    },
  },
  define: {
    // The modules under test import `lib/supabase`, which reads these at load time.
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
    'import.meta.env.VITE_LOGODEV_TOKEN': '""',
    'import.meta.env.VITE_LOGO_DEV_TOKEN': '""',
  },
});
