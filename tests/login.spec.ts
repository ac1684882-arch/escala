import { test, expect } from '@playwright/test';
import { E2E_MAQUEIRO_EMAIL, E2E_NURSE_EMAIL, login, openLogin } from './helpers/auth';

test.describe('Sistema de Login', () => {
  test('deve exibir tela de login', async ({ page }) => {
    await openLogin(page);

    await expect(page.getByRole('heading', { name: 'Prefeitura do Rio' })).toBeVisible();
    await expect(page.getByTestId('login-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('deve fazer login como enfermeiro', async ({ page }) => {
    await login(page, E2E_NURSE_EMAIL);

    await expect(page.getByTestId('nurse-dashboard')).toBeVisible();
    await expect(page.getByTestId('metric-maqueiros-ativos')).toContainText('Maqueiros Ativos');
  });

  test('deve fazer login como maqueiro', async ({ page }) => {
    await login(page, E2E_MAQUEIRO_EMAIL);

    await expect(page.getByTestId('maqueiro-dashboard')).toBeVisible();
    await expect(page.getByTestId('status-escala')).toContainText('Sua Escala Operacional');
  });

  test('deve criar cadastro de funcionário com nome, email e senha', async ({ page }) => {
    const timestamp = Date.now();

    await openLogin(page);
    await page.getByRole('button', { name: 'Criar Cadastro' }).click();
    await page.getByTestId('register-name').fill(`Funcionario Real ${timestamp}`);
    await page.getByTestId('register-email').fill(`funcionario.${timestamp}@escala.test`);
    await page.getByTestId('register-password').fill('senha123');
    await page.getByTestId('register-button').click();

    await expect(page.getByTestId('maqueiro-dashboard')).toBeVisible();
  });
});
