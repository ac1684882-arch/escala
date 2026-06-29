import { test, expect } from '@playwright/test';
import { loginAsNurse } from './helpers/auth';

test.describe('Dashboard do Enfermeiro', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsNurse(page);
  });

  test('deve exibir métricas do dashboard', async ({ page }) => {
    await expect(page.getByTestId('metric-maqueiros-ativos')).toContainText('Maqueiros Ativos');
    await expect(page.getByTestId('metric-sabados-agendados')).toContainText('Sábados Agendados');
    await expect(page.getByTestId('metric-folgas-definidas')).toContainText('Folgas Definidas');
  });

  test('deve exibir calendário', async ({ page }) => {
    await expect(page.getByTestId('calendar-view')).toBeVisible();
    await expect(page.getByTestId('calendar-title')).toContainText('Julho 2026');
    await expect(page.getByText('Domingo').first()).toBeVisible();
    await expect(page.getByText('Segunda').first()).toBeVisible();
    await expect(page.getByText('Sábado').first()).toBeVisible();
  });

  test('deve navegar entre abas', async ({ page }) => {
    await page.getByTestId('tab-pessoal').click();
    await expect(page.getByText('Profissionais Cadastrados')).toBeVisible();

    await page.getByTestId('tab-configs').click();
    await expect(page.getByText('Regras Gerais da Escala')).toBeVisible();
  });

  test('deve filtrar calendário por turno', async ({ page }) => {
    await page.getByTestId('shift-filter').selectOption('manha');
    await expect(page.getByTestId('shift-filter')).toHaveValue('manha');
  });

  test('deve buscar maqueiro no calendário', async ({ page }) => {
    const calendar = page.getByTestId('calendar-view');

    await calendar.getByTestId('calendar-search').fill('E2E');
    await expect(calendar.getByText('E2E Maqueiro Fixo').first()).toBeVisible();
  });

  test('deve navegar entre meses', async ({ page }) => {
    await page.getByTestId('calendar-next').click();
    await expect(page.getByTestId('calendar-title')).toContainText('Agosto 2026');

    await page.getByTestId('calendar-prev').click();
    await expect(page.getByTestId('calendar-title')).toContainText('Julho 2026');
  });

  test('deve acessar aba de configurações', async ({ page }) => {
    await page.getByTestId('tab-configs').click();

    await expect(page.getByText('Vagas de maqueiros normais por Sábado')).toBeVisible();
    await expect(page.getByText('Liberação Manual de Folgas')).toBeVisible();
  });
});
