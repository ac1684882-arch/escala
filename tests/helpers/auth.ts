import { expect, type Page } from '@playwright/test';

export async function openLogin(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('login-form')).toBeVisible();
}

export async function login(page: Page, username: string, password = '123') {
  await openLogin(page);
  await page.getByTestId('login-input').fill(username);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('login-button').click();
}

export async function loginAsNurse(page: Page) {
  await login(page, 'ana.paula');
  await expect(page.getByTestId('nurse-dashboard')).toBeVisible();
}

export async function loginAsMaqueiro(page: Page, username = 'ricardo.oliveira') {
  await login(page, username);
  await expect(page.getByTestId('maqueiro-dashboard')).toBeVisible();
}
