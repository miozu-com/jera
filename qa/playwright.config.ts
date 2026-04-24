import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const STORYBOOK_URL = process.env.STORYBOOK_URL || 'http://localhost:6006';
const AUTH_FILE     = path.join(__dirname, '.auth', 'state.json');
const needsAuth     = STORYBOOK_URL.includes('admin.selify.ai');

export default defineConfig({
  testDir: './specs',
  timeout: 45000,
  retries: 0,
  reporter: 'list',
  globalSetup: needsAuth ? path.join(__dirname, 'global-setup.ts') : undefined,

  use: {
    baseURL:      STORYBOOK_URL,
    storageState: needsAuth ? AUTH_FILE : undefined,
    headless:     true,
    viewport:     { width: 1440, height: 900 },
    screenshot:   'only-on-failure',
    actionTimeout: 15000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
