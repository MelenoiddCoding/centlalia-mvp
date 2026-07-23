import { OnchainVertical } from '@/components/onchain-vertical';
import { SolanaDiagnostic } from '@/components/solana-diagnostic';

export default function ValidationPage() {
  return (
    <div className="validation-page page-enter">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Laboratorio técnico</p>
          <h1>Validación devnet</h1>
        </div>
        <p>Flujo controlado para probar issuer, holder, registry, policy y check-in.</p>
      </header>
      <OnchainVertical />
      <SolanaDiagnostic />
    </div>
  );
}
