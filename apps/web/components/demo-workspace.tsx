'use client';

import { useState } from 'react';
import { AttendeeSpace } from './spaces/attendee-space';
import { OrganizerSpace } from './spaces/organizer-space';
import { StaffSpace } from './spaces/staff-space';
import { SolanaDiagnostic } from './solana-diagnostic';
import { useGateway } from '@/providers/gateway-provider';
import { clock } from '@/lib/format';

type Role = 'organizer' | 'attendee' | 'staff';

const roles: Array<{ id: Role; number: string; label: string; hint: string }> = [
  { id: 'organizer', number: '01', label: 'Organizador', hint: 'Publicar' },
  { id: 'attendee', number: '02', label: 'Asistente', hint: 'Circular' },
  { id: 'staff', number: '03', label: 'Staff', hint: 'Validar' },
];

function ProgressRail() {
  const { state } = useGateway();
  const event = state.events[0];
  const steps = [
    { label: 'Evento', done: Boolean(event) },
    { label: 'Publicado', done: event?.status === 'published' },
    { label: 'Boleto', done: state.tickets.length > 0 },
    { label: 'Acceso', done: state.intents.some((intent) => intent.status === 'consumed') },
  ];

  return (
    <ol className="progress-rail" aria-label="Progreso de la demostración">
      {steps.map((step, index) => (
        <li className={step.done ? 'is-done' : ''} key={step.label}>
          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          {step.label}
        </li>
      ))}
    </ol>
  );
}

function ActivityLedger() {
  const { state } = useGateway();

  return (
    <aside className="activity-ledger" aria-labelledby="activity-title">
      <div className="section-kicker">
        <span id="activity-title">Registro local</span>
        <span>{String(state.activity.length).padStart(2, '0')}</span>
      </div>
      {state.activity.length === 0 ? (
        <p className="empty-copy">
          Las operaciones aparecerán aquí con un identificador demo; no es una firma de Solana.
        </p>
      ) : (
        <ol>
          {state.activity.slice(0, 6).map((item) => (
            <li key={item.id}>
              <time>{clock(item.at)}</time>
              <span>{item.label}</span>
              <code>{item.signature}</code>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

export function DemoWorkspace() {
  const [role, setRole] = useState<Role>('organizer');
  const { gateway, notice, pending, execute } = useGateway();

  async function resetDemo() {
    const reset = await execute(() => gateway.reset(), 'Mesa reiniciada.');
    if (reset) setRole('organizer');
  }

  return (
    <div className="app-frame">
      <header className="masthead">
        <a className="wordmark" href="#workspace" aria-label="Centlalia, inicio">
          <span aria-hidden="true">C</span>
          <strong>Centlalia</strong>
        </a>
        <div className="network-status">
          <i aria-hidden="true" />
          <span>Demostración local</span>
          <small>sin fondos reales</small>
        </div>
        <button
          className="text-button"
          disabled={pending}
          onClick={() => void resetDemo()}
          type="button"
        >
          Reiniciar mesa
        </button>
      </header>

      <ProgressRail />

      <div className="workspace-shell" id="workspace">
        <nav className="role-nav" aria-label="Cambiar espacio de trabajo">
          <p className="nav-label">Mesa operativa</p>
          {roles.map((item) => (
            <button
              aria-current={role === item.id ? 'page' : undefined}
              className={role === item.id ? 'is-active' : ''}
              key={item.id}
              onClick={() => setRole(item.id)}
              type="button"
            >
              <span>{item.number}</span>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </button>
          ))}
          <div className="proof-note">
            <span>Prueba central</span>
            <p>Un titular presenta. Un staff consume. El segundo uso se rechaza.</p>
          </div>
        </nav>

        <main className="working-surface">
          {notice ? (
            <div
              className={`notice notice-${notice.kind}`}
              key={notice.nonce}
              role={notice.kind === 'error' ? 'alert' : 'status'}
            >
              <strong>
                {notice.kind === 'success' ? 'Operación registrada' : 'Operación rechazada'}
              </strong>
              <span>{notice.text}</span>
              {notice.signature ? <code>{notice.signature}</code> : null}
            </div>
          ) : null}

          <div className="role-stage" key={role}>
            {role === 'organizer' ? <OrganizerSpace /> : null}
            {role === 'attendee' ? <AttendeeSpace /> : null}
            {role === 'staff' ? <StaffSpace /> : null}
          </div>
          <ActivityLedger />
          <SolanaDiagnostic />
        </main>
      </div>
    </div>
  );
}
