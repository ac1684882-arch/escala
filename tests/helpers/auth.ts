import { expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://iwvtfyuxwfgknqurkvcf.supabase.co';
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dnRmeXV4d2Zna25xdXJrdmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzU5ODMsImV4cCI6MjA5ODI1MTk4M30.lYjKUHX2tblPiZX5VzBqSu2TJkSk4aw5vn0W_SJd0bg';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const E2E_PASSWORD = '123456';
export const ADMIN_EMAIL = (process.env.VITE_ADMIN_EMAIL || 'admin@escala.local').trim().toLowerCase();
export const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || 'Admin@123';
export const E2E_MAQUEIRO_EMAIL = 'e2e.maqueiro@escala.test';
export const E2E_FIXO_EMAIL = 'e2e.fixo@escala.test';

let ensuredUsers = false;

export async function ensureTestUsers() {
  if (ensuredUsers) return;

  const { error } = await supabase.from('usuarios').upsert([
    {
      id: 'e2e-maqueiro',
      nome: 'E2E Maqueiro Normal',
      matricula: 'E2E-MAQ',
      login: E2E_MAQUEIRO_EMAIL,
      senha: E2E_PASSWORD,
      role: 'maqueiro',
      turno: 'manha',
      tipo: 'normal',
      ativo: true,
    },
    {
      id: 'e2e-fixo',
      nome: 'E2E Maqueiro Fixo',
      matricula: 'E2E-FIXO',
      login: E2E_FIXO_EMAIL,
      senha: E2E_PASSWORD,
      role: 'maqueiro',
      turno: 'tarde',
      tipo: 'fixo_sabado',
      ativo: true,
    },
  ]);

  if (error) throw error;
  ensuredUsers = true;
}

export async function openLogin(page: Page) {
  await ensureTestUsers();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('login-form')).toBeVisible();
}

export async function login(page: Page, email: string, password = E2E_PASSWORD) {
  await openLogin(page);
  await page.getByTestId('login-input').fill(email);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('login-button').click();
}

export async function loginAsNurse(page: Page) {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page.getByTestId('nurse-dashboard')).toBeVisible();
}

export async function loginAsMaqueiro(page: Page, email = E2E_MAQUEIRO_EMAIL) {
  await login(page, email);
  await expect(page.getByTestId('maqueiro-dashboard')).toBeVisible();
}
