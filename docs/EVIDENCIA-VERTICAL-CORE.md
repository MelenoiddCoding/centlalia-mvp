# Evidencia de la vertical MPL Core

Fecha de corte: 2026-07-22

## Objetivo de validación

Demostrar, antes de entrevistar usuarios sobre una experiencia inexistente, que tres actores independientes pueden completar en Solana devnet:

1. issuer crea evento, tier, publica y autoriza staff;
2. holder paga y recibe un activo MPL Core;
3. registry relaciona de forma atómica activo y `TicketRecord`;
4. holder firma una presentación temporal;
5. staff autorizado consume el acceso;
6. policy rechaza cualquier segundo consumo.

La prueba técnica no valida demanda, utilidad ni disposición de pago. Solo habilita sesiones de producto honestas.

## Decisión de estándar

MPL Core es el estándar del primer vertical. Bubblegum V2 queda fuera de este gate porque árbol, DAS y pruebas Merkle agregan dependencias que no responden todavía a una hipótesis de usuario. Se reabre compresión cuando volumen o costo por activo sean un problema observado.

El activo se crea por CPI desde `primary_purchase_core`. La cuenta del activo es un PDA de Centlalia y nace con `PermanentFreezeDelegate { frozen: true }`, cuya autoridad es el PDA de plataforma. El holder conserva propiedad verificable, pero no puede circular el ticket fuera de las políticas del programa.

## Matriz de evidencia

| Evidencia                           | Estado al corte                           | Gate para aprobar                      |
| ----------------------------------- | ----------------------------------------- | -------------------------------------- |
| Rust, fmt y Clippy                  | CI Linux verde                            | Aprobado                               |
| IDL y cliente Codama                | Generados; 11 builders probados           | Aprobado                               |
| Web Wallet Standard                 | Desplegada en producción                  | Pendiente recorrido con wallets reales |
| Compra + creación Core atómica      | E2E SBF con programa Core oficial pasa    | Pendiente firma pública de usuario     |
| Owner Core verificado en check-in   | Pasa en validator                         | Pendiente ticket en devnet             |
| Segundo consumo                     | Error determinista en validator           | Pendiente rechazo público en devnet    |
| Prevención de transferencia externa | TransferV1 directo rechazado en validator | Aprobado técnicamente                  |
| Evidencia de usuarios               | Pendiente                                 | 5-10 sesiones según protocolo          |

## Regla de comunicación

CI SBF y upgrade devnet están completos. Hasta que el recorrido de tres wallets produzca firmas públicas, se permite decir “vertical MPL Core desplegada y pendiente de prueba con wallets reales”. No se permite decir “MVP transaccional validado”, “NFT adoptado por usuarios” o “usuarios lo necesitan”.

## Evidencia pública del corte

- CI completa: [run 29909723805](https://github.com/MelenoiddCoding/centlalia-mvp/actions/runs/29909723805).
- Upgrade del programa: `4Te91RqrWqK1Jtx9VxsAstNkjDj1wHZnH2D8V4iXLpabv9GpyEqchMpZK752MHzuPpKJXpebaoKc5cE3yCUAUjfV`.
- `PlatformConfig` cambiado a `MplCore`: `3YtA1dbb5B3JG2aUFpzaxGC2scszyc8GZDU2wMgaowcdNP5Ay6sbJT7FC2LoWpFixg5aPXWciBxYaVV2gATMm1ko`.
- Web de producción: [web-two-amber-35.vercel.app](https://web-two-amber-35.vercel.app), deployment `dpl_8JiJn9hJfG2V8sgCkBmfTAGchKSF`.

Estas firmas prueban despliegue y configuración. No prueban todavía creación de evento, compra, activo, presentación ni check-in en devnet.

Después del gate técnico se observarán tiempos, errores, comprensión de wallet y valor percibido. Si los usuarios no valoran propiedad verificable o política compartida frente a QR/lista privada, la hipótesis Solana debe refutarse o reducirse.
