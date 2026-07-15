'use client';

import { DEMO_IDENTITIES } from '@centlalia/client';
import { useSyncExternalStore } from 'react';
import { identityName } from '@/lib/format';
import { useGateway } from '@/providers/gateway-provider';

function remaining(expiresAt: number, now: number): string {
  if (!now) return '05:00';
  const seconds = Math.max(0, Math.ceil((expiresAt - now) / 1_000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function subscribeClock(listener: () => void) {
  const timer = window.setInterval(listener, 1_000);
  return () => window.clearInterval(timer);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / 1_000) * 1_000;
}

export function StaffSpace() {
  const { gateway, state, pending, execute } = useGateway();
  const now = useSyncExternalStore(subscribeClock, getClockSnapshot, () => 0);
  const event = state.events[0];
  const active = state.intents.filter((intent) => intent.status === 'active');
  const consumed = state.intents.filter((intent) => intent.status === 'consumed');

  return (
    <section aria-labelledby="staff-heading">
      <header className="role-heading">
        <div>
          <p>03 / Staff de puerta</p>
          <h1 id="staff-heading">Resolver la entrada</h1>
        </div>
        <p>Valida una intención de acceso local; en devnet deberá venir firmada por el titular.</p>
      </header>

      <div className="door-status entrance-sequence">
        <div>
          <i aria-hidden="true" />
          <span>Puesto autorizado</span>
          <strong>{event?.title ?? 'Sin evento activo'}</strong>
        </div>
        <div>
          <span>Wallet staff</span>
          <code>
            {DEMO_IDENTITIES.staff.slice(0, 5)}…{DEMO_IDENTITIES.staff.slice(-4)}
          </code>
        </div>
        <div>
          <span>Regla</span>
          <strong>Exactamente un uso</strong>
        </div>
        <div>
          <span>Ventana</span>
          <strong>Controlada · 24 h</strong>
        </div>
      </div>

      <div className="checkin-board">
        <div className="section-kicker">
          <span>Presentaciones pendientes</span>
          <span>{String(active.length).padStart(2, '0')}</span>
        </div>
        {active.length === 0 ? (
          <div className="empty-state staff-empty">
            <span>Esperando titular</span>
            <h2>No hay accesos por resolver</h2>
            <p>Desde Asistente, el titular debe pulsar “Presentar para acceso”.</p>
          </div>
        ) : (
          <ol className="intent-list">
            {active.map((intent) => (
              <li key={intent.id}>
                <div
                  className="intent-countdown"
                  aria-label={`Expira en ${remaining(intent.expiresAt, now)}`}
                >
                  <span>Válido por</span>
                  <strong>{remaining(intent.expiresAt, now)}</strong>
                </div>
                <div>
                  <span>{intent.ticketId}</span>
                  <strong>{identityName(intent.holder)}</strong>
                  <code>{intent.id}</code>
                </div>
                {now >= intent.expiresAt ? (
                  <button
                    className="validate-action expired-action"
                    disabled={pending}
                    onClick={() =>
                      void execute(
                        () => gateway.expireCheckIn(intent.id),
                        'Presentación expirada cerrada; el titular puede generar otra.',
                      )
                    }
                    type="button"
                  >
                    <span>Cerrar expirada</span>
                    <span aria-hidden="true">×</span>
                  </button>
                ) : (
                  <button
                    className="validate-action"
                    disabled={pending}
                    onClick={() =>
                      void execute(
                        () => gateway.consumeCheckIn(intent.id, DEMO_IDENTITIES.staff),
                        'Acceso validado y boleto marcado como utilizado.',
                      )
                    }
                    type="button"
                  >
                    <span>Validar entrada</span>
                    <span aria-hidden="true">✓</span>
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="consumed-board">
        <div className="section-kicker">
          <span>Accesos consumidos</span>
          <span>{String(consumed.length).padStart(2, '0')}</span>
        </div>
        {consumed.length === 0 ? (
          <p className="empty-copy">Aún no hay entradas validadas.</p>
        ) : (
          <ol className="consumed-list">
            {consumed.map((intent) => (
              <li key={intent.id}>
                <span className="admitted-stamp">ADMITIDO</span>
                <div>
                  <strong>{intent.ticketId}</strong>
                  <span>{identityName(intent.holder)}</span>
                </div>
                <button
                  className="danger-action"
                  disabled={pending}
                  onClick={() =>
                    void execute(
                      () => gateway.consumeCheckIn(intent.id, DEMO_IDENTITIES.staff),
                      'Operación inesperada.',
                    )
                  }
                  type="button"
                >
                  Reintentar mismo acceso
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
