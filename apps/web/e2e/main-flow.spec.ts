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
