import { expect, test } from '@playwright/test';

test('crea, publica, compra y rechaza un segundo check-in', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Centlalia, inicio' })).toBeVisible();

  await page.getByRole('button', { name: 'Crear borrador' }).click();
  await expect(page.getByText('Evento creado como borrador.')).toBeVisible();
  await page.getByRole('button', { name: 'Publicar evento' }).click();

  await page.getByRole('button', { name: 'Asistente' }).click();
  await page.getByRole('button', { name: 'Comprar boleto demo' }).click();
  await expect(page.getByTestId(/ticket-tkt-/)).toBeVisible();
  await page.getByRole('button', { name: 'Presentar para acceso' }).click();

  await page.getByRole('button', { name: 'Staff' }).click();
  await page.getByRole('button', { name: 'Validar entrada' }).click();
  await expect(page.getByText('Acceso validado y boleto marcado como utilizado.')).toBeVisible();

  await page.getByRole('button', { name: 'Reintentar mismo acceso' }).click();
  await expect(page.locator('.notice-error')).toContainText('este boleto ya fue utilizado');
});

test('permite iniciar otra sesion sin borrar cuentas on-chain', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'centlalia-onchain-proof-v1',
      JSON.stringify({ event: 'sesion-anterior' }),
    );
  });
  await page.goto('/');

  const newSession = page.getByRole('button', { name: 'Iniciar nueva sesión' });
  await expect(newSession).toBeVisible();
  await newSession.click();

  await expect(newSession).not.toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('centlalia-onchain-proof-v1')))
    .toBeNull();
});
