import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * Sistema de Escala de Maqueiros
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
  
  /* Timeout por teste */
  timeout: 60 * 1000,

  /* Timeout padrÃ£o das asserÃ§Ãµes */
  expect: {
    timeout: 15 * 1000,
  },
  
  /* Configuração de retry */
  retries: process.env.CI ? 2 : 0,
  
  /* Paralelização */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter */
  reporter: 'html',
  
  /* Configurações compartilhadas */
  use: {
    /* URL base */
    baseURL: 'http://localhost:3000',
    
    /* Trace on first retry */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Projetos de teste (browsers) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Servidor de desenvolvimento */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
