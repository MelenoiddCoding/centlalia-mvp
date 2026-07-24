'use client';

import { useEffect, useRef, useState } from 'react';
import { address } from '@solana/kit';
import { generated } from '@centlalia/client';
import { CheckInEvidenceList } from '@/components/check-in-evidence-list';
import { useCheckInEvidence } from '@/hooks/use-check-in-evidence';
import { parseCheckInPayload, type CheckInPayload } from '@/lib/check-in-flow';
import { formatDate, shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

interface ScannerControls {
  stop(): void;
}

function unixNow(): number {
  return Math.floor(new Date().getTime() / 1_000);
}

function timestampNow(): number {
  return new Date().getTime();
}

export function StaffCheckInPage() {
  const { wallet, adapter, execute, pending } = useSolanaApp();
  const { evidence, recordEvidence } = useCheckInEvidence();
  const [rawPayload, setRawPayload] = useState('');
  const [payload, setPayload] = useState<CheckInPayload>();
  const [payloadError, setPayloadError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [authorization, setAuthorization] = useState<'unknown' | 'checking' | 'active' | 'missing'>(
    'unknown',
  );
  const [consumedSignature, setConsumedSignature] = useState('');
  const [now, setNow] = useState(unixNow);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControls = useRef<ScannerControls | null>(null);

  useEffect(() => {
    return () => scannerControls.current?.stop();
  }, []);

  useEffect(() => {
    if (!payload) return;
    const interval = window.setInterval(() => setNow(unixNow()), 1_000);
    return () => window.clearInterval(interval);
  }, [payload]);

  useEffect(() => {
    if (!payload || !wallet) {
      queueMicrotask(() => setAuthorization('unknown'));
      return;
    }
    let active = true;
    queueMicrotask(() => setAuthorization('checking'));
    void generated
      .findStaffAuthorizationPda({ event: address(payload.event), staff: wallet.address })
      .then(([staffAuthorization]) => adapter.fetchStaffAuthorization(staffAuthorization))
      .then((account) => {
        if (active) setAuthorization(account.exists && account.data.active ? 'active' : 'missing');
      })
      .catch(() => {
        if (active) setAuthorization('missing');
      });
    return () => {
      active = false;
    };
  }, [adapter, payload, wallet]);

  function inspect(value: string) {
    try {
      const next = parseCheckInPayload(value.trim());
      setRawPayload(value.trim());
      setPayload(next);
      setNow(unixNow());
      setPayloadError('');
      setConsumedSignature('');
    } catch (error) {
      setPayload(undefined);
      setPayloadError(error instanceof Error ? error.message : 'QR inválido.');
    }
  }

  async function startScanner() {
    if (!videoRef.current) return;
    scannerControls.current?.stop();
    setPayloadError('');
    setScanning(true);
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 200 });
      scannerControls.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        videoRef.current,
        (result, _error, controls) => {
          if (!result) return;
          controls.stop();
          scannerControls.current = null;
          setScanning(false);
          inspect(result.getText());
        },
      );
    } catch (error) {
      setScanning(false);
      setPayloadError(error instanceof Error ? error.message : 'No fue posible iniciar la cámara.');
    }
  }

  function stopScanner() {
    scannerControls.current?.stop();
    scannerControls.current = null;
    setScanning(false);
  }

  async function consume() {
    if (!payload || !wallet) return;
    if (payload.expiresAt <= unixNow()) {
      setPayloadError('El intent ya expiró. Pide al holder generar un QR nuevo.');
      return;
    }
    const signature = await execute('Check-in consumido', async () => {
      const instruction = await adapter.buildConsumeCheckInCore({
        event: address(payload.event),
        ticketRecord: address(payload.ticketRecord),
        coreAsset: address(payload.coreAsset),
        checkInIntent: address(payload.checkInIntent),
      });
      const result = await adapter.sendInstructions([instruction]);
      await adapter.waitForTicketStatus(address(payload.ticketRecord), generated.TicketStatus.Used);
      return result;
    });
    if (!signature) return;
    setConsumedSignature(signature);
    recordEvidence({
      id: signature,
      action: 'consume',
      actor: wallet.address,
      event: payload.event,
      ticketRecord: payload.ticketRecord,
      coreAsset: payload.coreAsset,
      checkInIntent: payload.checkInIntent,
      signature,
      recordedAt: timestampNow(),
    });
  }

  const expired = payload ? payload.expiresAt <= now : false;

  return (
    <div className="staff-check-in-page page-enter">
      <header className="page-heading staff-heading">
        <div>
          <p className="eyebrow">Staff workspace</p>
          <h1>Control de acceso</h1>
        </div>
        <p>Escanea el intent del holder y consume el boleto directamente en Solana devnet.</p>
      </header>

      <div className="staff-workbench">
        <section className="scanner-panel" aria-labelledby="scanner-heading">
          <header>
            <span>01</span>
            <div>
              <p className="eyebrow">Entrada</p>
              <h2 id="scanner-heading">Leer acceso</h2>
            </div>
          </header>
          <div className={`scanner-viewport ${scanning ? 'is-active' : ''}`}>
            <video muted playsInline ref={videoRef} />
            <span>Centra el QR dentro del marco</span>
          </div>
          <div className="scanner-actions">
            {scanning ? (
              <button onClick={stopScanner} type="button">
                Detener cámara
              </button>
            ) : (
              <button onClick={() => void startScanner()} type="button">
                Activar cámara
              </button>
            )}
          </div>
          <label>
            <span>O pega el contenido QR</span>
            <textarea
              rows={5}
              value={rawPayload}
              onChange={(event) => setRawPayload(event.target.value)}
              placeholder='{"kind":"centlalia-check-in", ...}'
            />
          </label>
          <button className="secondary-operation" onClick={() => inspect(rawPayload)} type="button">
            Validar contenido
          </button>
          {payloadError ? (
            <p className="inline-error" role="alert">
              {payloadError}
            </p>
          ) : null}
        </section>

        <section className="intent-panel" aria-labelledby="intent-heading">
          <header>
            <span>02</span>
            <div>
              <p className="eyebrow">Política on-chain</p>
              <h2 id="intent-heading">Verificar y consumir</h2>
            </div>
          </header>
          {!payload ? (
            <div className="staff-empty-state">
              <strong>Esperando un QR Centlalia.</strong>
              <p>El detalle verificable aparecerá aquí antes de solicitar la firma staff.</p>
            </div>
          ) : (
            <div className="intent-review">
              <span className={`intent-state ${expired ? 'expired' : 'pending'}`}>
                {expired ? 'Expirado' : 'Intent pendiente'}
              </span>
              <dl>
                <div>
                  <dt>Evento</dt>
                  <dd>{shortAddress(payload.event)}</dd>
                </div>
                <div>
                  <dt>TicketRecord</dt>
                  <dd>{shortAddress(payload.ticketRecord)}</dd>
                </div>
                <div>
                  <dt>Core asset</dt>
                  <dd>{shortAddress(payload.coreAsset)}</dd>
                </div>
                <div>
                  <dt>Expira</dt>
                  <dd>{formatDate(BigInt(payload.expiresAt))}</dd>
                </div>
              </dl>
              <div className={`staff-authorization authorization-${authorization}`}>
                <span>Wallet staff</span>
                <strong>
                  {!wallet
                    ? 'Conecta una wallet'
                    : authorization === 'checking'
                      ? 'Verificando autorización…'
                      : authorization === 'active'
                        ? 'Autorizada para este evento'
                        : 'No autorizada para este evento'}
                </strong>
              </div>
              <a
                href={`https://explorer.solana.com/tx/${payload.presentSignature}?cluster=devnet`}
                rel="noreferrer"
                target="_blank"
              >
                Ver presentación del holder ↗
              </a>
              <button
                disabled={
                  !wallet ||
                  expired ||
                  authorization !== 'active' ||
                  Boolean(pending) ||
                  Boolean(consumedSignature)
                }
                onClick={() => void consume()}
                type="button"
              >
                {consumedSignature ? 'Acceso consumido' : (pending ?? 'Validar entrada on-chain')}
              </button>
              {consumedSignature ? (
                <a
                  className="consume-proof"
                  href={`https://explorer.solana.com/tx/${consumedSignature}?cluster=devnet`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Evidencia de consumo ↗
                </a>
              ) : null}
            </div>
          )}
        </section>
      </div>

      <CheckInEvidenceList evidence={evidence} />
    </div>
  );
}
