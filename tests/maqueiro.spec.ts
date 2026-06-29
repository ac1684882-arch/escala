import { test, expect } from '@playwright/test';
import { E2E_FIXO_EMAIL, loginAsMaqueiro } from './helpers/auth';

test.describe('Dashboard do Maqueiro', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMaqueiro(page);
  });

  test('deve exibir status da escala', async ({ page }) => {
    await expect(page.getByTestId('status-sabado')).toContainText('Sábado de Plantão');
    await expect(page.getByTestId('status-folga')).toContainText('Folga Compensatória');
    await expect(page.getByTestId('status-escala')).toContainText('Sua Escala Operacional');
  });

  test('deve exibir seletor de sábados', async ({ page }) => {
    await expect(page.getByTestId('sabado-selector')).toContainText('Escolher Sábado de Trabalho');
    await expect(page.getByRole('button', { name: /07\/2026/ }).first()).toBeVisible();
  });

  test('deve exibir calendário geral', async ({ page }) => {
    await page.getByText('Visualizar Escala Geral do Hospital').scrollIntoViewIfNeeded();

    await expect(page.getByTestId('calendar-view')).toBeVisible();
    await expect(page.getByTestId('calendar-title')).toContainText('Julho 2026');
  });

  test('deve mostrar informação sobre folgas bloqueadas', async ({ page }) => {
    await expect(page.getByTestId('folga-selector')).toContainText(/Folga Compensatória|folgas bloqueado/i);
  });

  test('deve exibir funcionários fixos corretamente', async ({ page }) => {
    await page.getByTestId('logout-button').click();
    await loginAsMaqueiro(page, E2E_FIXO_EMAIL);

    await expect(page.getByText('Escala Fixa Programada')).toBeVisible();
    await expect(page.getByText('todo Sábado')).toBeVisible();
    await expect(page.getByText('toda Segunda-feira')).toBeVisible();
  });

  test('deve navegar entre meses no calendário', async ({ page }) => {
    await page.getByText('Visualizar Escala Geral do Hospital').scrollIntoViewIfNeeded();

    await expect(page.getByTestId('calendar-title')).toContainText('Julho 2026');
  });
});
