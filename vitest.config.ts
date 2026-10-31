import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration.
 *
 * Kept separate from `vite.config.ts` on purpose: the app config pulls in the
 * PWA and Tailwind plugins, which do not belong in a test run.
 *
 * Two projects instead of one environment: hook tests need a DOM and pay for
 * jsdom, while the pure logic suites run an order of magnitude faster in `node`.
 */
const sharedDefine = {
  // The modules under test import `lib/supabase`, which reads these at load time.
  'import.meta.env.VITE_SUPABASE_URL': '""',
  'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  'import.meta.env.VITE_LOGODEV_TOKEN': '""',
  'import.meta.env.VITE_LOGO_DEV_TOKEN': '""',
};

export default defineConfig({
  define: sharedDefine,
  test: {
    projects: [
      {
        define: sharedDefine,
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/lib/**/*.test.ts', 'src/services/**/*.test.ts', 'tests/**/*.test.ts'],
        },
      },
      {
        define: sharedDefine,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/hooks/**/*.test.tsx', 'src/**/*.test.tsx'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts', 'src/services/**/*.ts', 'src/hooks/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', 'src/lib/supabase.ts'],
    },
  },
});
