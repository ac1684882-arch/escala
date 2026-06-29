import { test, expect } from '@playwright/test';
import { login, openLogin } from './helpers/auth';

test.describe('Sistema de Login', () => {
  test('deve exibir tela de login', async ({ page }) => {
    await openLogin(page);

    await expect(page.getByRole('heading', { name: 'Prefeitura do Rio' })).toBeVisible();
    await expect(page.getByTestId('login-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('deve fazer login como enfermeiro', async ({ page }) => {
    await login(page, 'ana.paula');

    await expect(page.getByTestId('nurse-dashboard')).toBeVisible();
    await expect(page.getByTestId('metric-maqueiros-ativos')).toContainText('Maqueiros Ativos');
  });

  test('deve fazer login como maqueiro', async ({ page }) => {
    await login(page, 'joao.silva');

    await expect(page.getByTestId('maqueiro-dashboard')).toBeVisible();
    await expect(page.getByTestId('status-escala')).toContainText('Sua Escala Operacional');
  });
});
