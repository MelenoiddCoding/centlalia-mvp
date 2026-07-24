import { formatDate, shortAddress } from '@/lib/onchain-format';
import type { CheckInEvidence } from '@/lib/check-in-flow';

export function CheckInEvidenceList({ evidence }: { evidence: CheckInEvidence[] }) {
  return (
    <section className="evidence-ledger" aria-labelledby="evidence-heading">
      <header>
        <div>
          <p className="eyebrow">Prueba reproducible</p>
          <h2 id="evidence-heading">Evidencia reciente</h2>
        </div>
        <span>Persistida en este dispositivo</span>
      </header>
      {evidence.length === 0 ? (
        <p className="product-empty">Las firmas de presentación y consumo aparecerán aquí.</p>
      ) : (
        <div className="evidence-list">
          {evidence.map((entry) => (
            <article key={entry.id}>
              <span className={`evidence-action ${entry.action}`}>{entry.action}</span>
              <div>
                <strong>{shortAddress(entry.ticketRecord)}</strong>
                <p>
                  {formatDate(BigInt(Math.floor(entry.recordedAt / 1_000)))} · actor{' '}
                  {shortAddress(entry.actor)}
                </p>
              </div>
              <a
                href={`https://explorer.solana.com/tx/${entry.signature}?cluster=devnet`}
                rel="noreferrer"
                target="_blank"
              >
                Transacción ↗
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
