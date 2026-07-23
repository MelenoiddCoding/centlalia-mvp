# Centlalia MVP

Centlalia prueba un flujo mínimo de acceso verificable para eventos: el organizador publica, el asistente adquiere y presenta su boleto, y el staff consume el acceso exactamente una vez.

Este repositorio es la implementación canónica creada para Solana Latam Labs Program by WayLearn. El prototipo anterior se conserva únicamente como referencia de producto; no se reutiliza como base técnica.

## Alcance del MVP

- Organizador: crear y publicar eventos, configurar tiers y autorizar o revocar staff.
- Asistente: compra primaria, regalo, publicación y compra de reventa, y presentación firmada para acceso.
- Staff: consumir una intención vigente y obtener un rechazo determinista ante el segundo uso.
- Red: devnet y demos controladas. No hay dinero real, custodia, fiat ni mainnet; WayLearn actualmente no cuenta con un grant para los proyectos participantes.

La aplicación separa dos recorridos. La **mesa demo local** permite explorar el producto sin wallet y nunca cuenta como evidencia on-chain. La **vertical verificable** conecta Wallet Standard, envía transacciones v0 y exige tres wallets distintas para emitir, comprar un activo MPL Core, presentar un intent, consumirlo y probar el rechazo del segundo uso. Cada paso enlaza sus cuentas y firmas en Explorer.

## Inicio rápido

Requisitos: Node.js 22 y pnpm 10.13.1, o VS Code con Dev Containers/GitHub Codespaces.

```powershell
Copy-Item .env.example .env.local
pnpm install
pnpm dev
```

Abre `http://localhost:3000`. El estado demo se conserva durante la sesión activa y puede restablecerse desde la interfaz; una recarga inicia una mesa limpia.

Checks del workspace:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Pruebas del programa dentro del devcontainer:

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
pnpm --filter @centlalia/program-tests check:integration
anchor test
```

`anchor test` construye y despliega el SBF en un validator limpio y ejecuta el flujo con cuatro wallets. En Windows, donde el toolchain SBF local no está soportado de forma confiable, usa el devcontainer/Codespaces o la CI Linux.

## Configuración

| Variable                     | Visibilidad | Uso                                                        |
| ---------------------------- | ----------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | navegador   | RPC para enviar transacciones devnet                       |
| `NEXT_PUBLIC_SOLANA_NETWORK` | navegador   | Debe permanecer en `devnet` durante incubación             |
| `NEXT_PUBLIC_PROGRAM_ID`     | navegador   | Programa Centlalia desplegado en devnet                    |
| `DAS_RPC_URL`                | servidor    | Endpoint con DAS; nunca debe llevar prefijo `NEXT_PUBLIC_` |

`/api/das` actúa como proxy servidor con métodos permitidos, tamaño máximo, validación, timeout y rate limit defensivo. Configura cada variable por separado en Development, Preview y Production de Vercel, y aplica además límites de cuota en Vercel Firewall y en el proveedor DAS.

## Arquitectura

```text
apps/web/                 Aplicación Next.js por roles y proxy DAS
packages/client/          Demo, IDL/Codama, Wallet Standard y adapter Solana
packages/program-tests/   Harness local-validator multiwallet
programs/ticketing/       Programa Anchor e invariantes de dominio
docs/                     Dictamen, trazabilidad, validación y roadmap
.devcontainer/            Toolchain reproducible de Rust, Agave y Anchor
```

El programa separa tarifa de plataforma, regalía del organizador y límite de reventa. El check-in requiere una intención firmada y de vida corta; el staff autorizado la consume dentro de la ventana del evento y `used_at` impide replays.

El programa conserva `ManagedAsset` para compatibilidad y pruebas, y añade una vertical MPL Core aditiva. `primary_purchase_core` crea el activo mediante CPI en la misma transacción que cobra y registra el ticket; un `PermanentFreezeDelegate` controlado por la autoridad PDA impide transferencias fuera de política. Presentación y consumo leen directamente owner y update authority del activo Core antes de cambiar el acceso.

Regenera el cliente únicamente desde el IDL versionado:

```powershell
pnpm client:generate
```

## Evidencia y programa

- [Validación del sistema](docs/VALIDACION-SISTEMA.md)
- [Evidencia de la vertical MPL Core](docs/EVIDENCIA-VERTICAL-CORE.md)
- [Cuentas on-chain y autoridades](docs/CUENTAS-ONCHAIN.md)
- [Trazabilidad Discord y WayLearn](docs/TRAZABILIDAD.md)
- [Arquitectura técnica](docs/ARQUITECTURA.md)
- [Protocolo de validación](docs/PROTOCOLO-VALIDACION.md)
- [Roadmap hasta Demo Day](docs/ROADMAP.md)
- [Fondeo postprograma](docs/FONDEO-POSTPROGRAMA.md)

Las métricas de usuarios permanecen pendientes hasta ejecutar sesiones reales. No se completan con datos sintéticos ni se presentan como evidencia los recorridos del modo demo.

## Estado de publicación

El programa `6KVngKJVYYbqfeXxzXdnaZzmKwo58iin8LmiMyZjgpbu` está actualizado en devnet y `PlatformConfig` usa `MplCore`. La [CI 29909723805](https://github.com/MelenoiddCoding/centlalia-mvp/actions/runs/29909723805) aprobó build SBF y E2E multiwallet con el programa Core oficial, incluida la transferencia directa rechazada. La [web pública](https://web-two-amber-35.vercel.app) expone la vertical; falta ejecutar y documentar el recorrido con tres wallets reales antes de llamarlo validación de usuario. Ninguna credencial o keypair se guarda en Git.

Consulta [SECURITY.md](SECURITY.md) antes de operar el programa. El software no ha sido auditado y no debe utilizarse en mainnet.
