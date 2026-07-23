'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { address } from '@solana/kit';
import { generated } from '@centlalia/client';
import { toDateTimeLocal, toUnix } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

function initialForm() {
  const now = new Date();
  const salesEnd = new Date(now.getTime() + 24 * 60 * 60 * 1_000);
  const starts = new Date(now.getTime() + 48 * 60 * 60 * 1_000);
  const ends = new Date(starts.getTime() + 4 * 60 * 60 * 1_000);
  return {
    title: '',
    metadataUri: 'https://web-two-amber-35.vercel.app/api/metadata/event',
    salesStartAt: toDateTimeLocal(now),
    salesEndAt: toDateTimeLocal(salesEnd),
    startsAt: toDateTimeLocal(starts),
    endsAt: toDateTimeLocal(ends),
    checkInStartAt: toDateTimeLocal(new Date(starts.getTime() - 60 * 60 * 1_000)),
    checkInEndAt: toDateTimeLocal(ends),
    tierName: 'Acceso general',
    priceSol: '0.01',
    supply: '20',
    royaltyPercent: '0',
    markupPercent: '0',
    resaleEnabled: false,
    staff: '',
    publishNow: true,
  };
}

export function CreateEventPage() {
  const router = useRouter();
  const { wallet, adapter, execute, pending } = useSolanaApp();
  const [form, setForm] = useState(initialForm);

  function update(name: keyof ReturnType<typeof initialForm>, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!wallet) return;
    const eventId = BigInt(Date.now());
    const [eventAddress] = await generated.findEventPda({
      organizer: wallet.address,
      eventId,
    });
    const instructions = [
      await adapter.buildCreateEvent({
        eventId,
        details: {
          title: form.title.trim(),
          metadataUri: form.metadataUri.trim(),
          salesStartAt: toUnix(form.salesStartAt),
          salesEndAt: toUnix(form.salesEndAt),
          startsAt: toUnix(form.startsAt),
          endsAt: toUnix(form.endsAt),
          checkInStartAt: toUnix(form.checkInStartAt),
          checkInEndAt: toUnix(form.checkInEndAt),
          maxResaleMarkupBps: Math.round(Number(form.markupPercent) * 100),
          organizerRoyaltyBps: Math.round(Number(form.royaltyPercent) * 100),
          resaleEnabled: form.resaleEnabled,
        },
      }),
      await adapter.buildAddTier({
        event: eventAddress,
        tierId: 0,
        name: form.tierName.trim(),
        priceLamports: BigInt(Math.round(Number(form.priceSol) * 1_000_000_000)),
        supply: Number(form.supply),
      }),
    ];
    if (form.staff.trim()) {
      instructions.push(
        await adapter.buildAuthorizeStaff({
          event: eventAddress,
          staff: address(form.staff.trim()),
        }),
      );
    }
    if (form.publishNow) {
      instructions.push(await adapter.buildPublishEvent({ event: eventAddress }));
    }

    const signature = await execute('Creación de evento', async () => {
      const result = await adapter.sendInstructions(instructions);
      await adapter.waitForAccount(eventAddress);
      return result;
    });
    if (signature) router.push(`/organizer/events/${eventAddress}`);
  }

  return (
    <div className="organizer-form-page page-enter">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Organizer · Nueva cuenta Event</p>
          <h1>Crear evento</h1>
        </div>
        <p>Configura el ciclo completo que el programa validará on-chain.</p>
      </header>

      {!wallet ? (
        <div className="product-empty">
          <strong>Conecta la wallet organizer para continuar.</strong>
        </div>
      ) : (
        <form className="event-form" onSubmit={(event) => void submit(event)}>
          <fieldset>
            <legend>01 · Identidad</legend>
            <label className="wide">
              <span>Título</span>
              <input
                required
                maxLength={80}
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                placeholder="Solana Builders Night"
              />
            </label>
            <label className="wide">
              <span>Metadata URI</span>
              <input
                required
                maxLength={200}
                type="url"
                value={form.metadataUri}
                onChange={(event) => update('metadataUri', event.target.value)}
              />
              <small>La metadata puede incluir venue, descripción e imagen.</small>
            </label>
          </fieldset>

          <fieldset>
            <legend>02 · Calendario</legend>
            <label>
              <span>Inicio de venta</span>
              <input
                required
                type="datetime-local"
                value={form.salesStartAt}
                onChange={(event) => update('salesStartAt', event.target.value)}
              />
            </label>
            <label>
              <span>Fin de venta</span>
              <input
                required
                type="datetime-local"
                value={form.salesEndAt}
                onChange={(event) => update('salesEndAt', event.target.value)}
              />
            </label>
            <label>
              <span>Inicio del evento</span>
              <input
                required
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => update('startsAt', event.target.value)}
              />
            </label>
            <label>
              <span>Fin del evento</span>
              <input
                required
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => update('endsAt', event.target.value)}
              />
            </label>
            <label>
              <span>Apertura de check-in</span>
              <input
                required
                type="datetime-local"
                value={form.checkInStartAt}
                onChange={(event) => update('checkInStartAt', event.target.value)}
              />
            </label>
            <label>
              <span>Cierre de check-in</span>
              <input
                required
                type="datetime-local"
                value={form.checkInEndAt}
                onChange={(event) => update('checkInEndAt', event.target.value)}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>03 · Inventario inicial</legend>
            <label>
              <span>Nombre del tier</span>
              <input
                required
                maxLength={48}
                value={form.tierName}
                onChange={(event) => update('tierName', event.target.value)}
              />
            </label>
            <label>
              <span>Precio en SOL</span>
              <input
                required
                min="0"
                step="0.001"
                type="number"
                value={form.priceSol}
                onChange={(event) => update('priceSol', event.target.value)}
              />
            </label>
            <label>
              <span>Supply</span>
              <input
                required
                min="1"
                type="number"
                value={form.supply}
                onChange={(event) => update('supply', event.target.value)}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>04 · Política</legend>
            <label>
              <span>Regalía organizer %</span>
              <input
                min="0"
                max="100"
                step="0.01"
                type="number"
                value={form.royaltyPercent}
                onChange={(event) => update('royaltyPercent', event.target.value)}
              />
            </label>
            <label>
              <span>Markup máximo %</span>
              <input
                min="0"
                max="100"
                step="0.01"
                type="number"
                value={form.markupPercent}
                onChange={(event) => update('markupPercent', event.target.value)}
              />
            </label>
            <label className="wide">
              <span>Wallet staff inicial</span>
              <input
                value={form.staff}
                onChange={(event) => update('staff', event.target.value)}
                placeholder="Opcional; debe existir en devnet"
              />
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={form.resaleEnabled}
                onChange={(event) => update('resaleEnabled', event.target.checked)}
              />
              <span>Permitir reventa</span>
            </label>
            <label className="check-field">
              <input
                type="checkbox"
                checked={form.publishNow}
                onChange={(event) => update('publishNow', event.target.checked)}
              />
              <span>Publicar al confirmar</span>
            </label>
          </fieldset>

          <div className="form-submit">
            <div>
              <span>Firmante</span>
              <code>{wallet.address}</code>
            </div>
            <button disabled={Boolean(pending)} type="submit">
              {pending ?? 'Crear en devnet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
