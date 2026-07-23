import { expect, test } from '@playwright/test';

test('presenta la portada y enlaza la actividad on-chain reciente', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Noche Solar' })).toBeVisible();
  await expect(page.getByText('Evento destacado · Próximamente')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Últimos eventos' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explorar cartelera' })).toHaveAttribute(
    'href',
    '/events',
  );
});

test('expone el marketplace y protege las herramientas de organizer', async ({ page }) => {
  await page.goto('/events');

  await expect(
    page.getByRole('heading', { name: 'Eventos que se pueden verificar.' }),
  ).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Marketplace' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await page.getByRole('link', { name: 'Crear evento' }).click();
  await expect(page).toHaveURL(/\/organizer\/events\/new$/);
  await expect(page.getByRole('link', { name: 'Crear evento' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('link', { name: 'Mis eventos' })).not.toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('heading', { name: 'Crear evento' })).toBeVisible();
  await expect(page.getByText('Conecta la wallet organizer para continuar.')).toBeVisible();

  await page.getByRole('link', { name: 'Mis eventos' }).click();
  await expect(page.getByRole('heading', { name: 'Mis eventos' })).toBeVisible();
  await expect(page.getByText('Conecta la wallet organizer para ver sus eventos.')).toBeVisible();
});

test('crea, publica, compra y rechaza un segundo check-in', async ({ page }) => {
  await page.goto('/demo');
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
  await page.goto('/validation');

  const newSession = page.getByRole('button', { name: 'Iniciar nueva sesión' });
  await expect(newSession).toBeVisible();
  await newSession.click();

  await expect(newSession).not.toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('centlalia-onchain-proof-v1')))
    .toBeNull();
});
