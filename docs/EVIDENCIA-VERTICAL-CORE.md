# Evidencia de la vertical MPL Core

Fecha de corte: 2026-07-23

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

| Evidencia                           | Estado al corte                            | Gate para aprobar              |
| ----------------------------------- | ------------------------------------------ | ------------------------------ |
| Rust, fmt y Clippy                  | CI Linux verde                             | Aprobado                       |
| IDL y cliente Codama                | Generados; 11 builders probados            | Aprobado                       |
| Web Wallet Standard                 | Recorrido devnet con tres wallets completo | Aprobado técnicamente          |
| Compra + creación Core atómica      | Firma pública y activo Core confirmados    | Aprobado técnicamente          |
| Owner Core verificado en check-in   | Ticket, asset y holder coinciden en devnet | Aprobado técnicamente          |
| Segundo consumo                     | Estado consumido; firma fallida pendiente  | Pendiente error público `6036` |
| Prevención de transferencia externa | TransferV1 directo rechazado en validator  | Aprobado técnicamente          |
| Evidencia de usuarios               | Pendiente                                  | 5-10 sesiones según protocolo  |

## Regla de comunicación

CI SBF, upgrade devnet y un recorrido técnico con tres wallets están completos. Se permite decir “vertical MPL Core demostrada en devnet con firmas públicas”. No se permite decir “producto validado”, “NFT adoptado por usuarios” o “usuarios lo necesitan” hasta ejecutar el protocolo con participantes externos.

## Evidencia pública del corte

- CI completa del adapter Core: [run 29909723805](https://github.com/MelenoiddCoding/centlalia-mvp/actions/runs/29909723805).
- CI de verificación RPC de evidencia: [run 29976657498](https://github.com/MelenoiddCoding/centlalia-mvp/actions/runs/29976657498).
- Upgrade del programa: `4Te91RqrWqK1Jtx9VxsAstNkjDj1wHZnH2D8V4iXLpabv9GpyEqchMpZK752MHzuPpKJXpebaoKc5cE3yCUAUjfV`.
- `PlatformConfig` cambiado a `MplCore`: `3YtA1dbb5B3JG2aUFpzaxGC2scszyc8GZDU2wMgaowcdNP5Ay6sbJT7FC2LoWpFixg5aPXWciBxYaVV2gATMm1ko`.
- Web de producción: [web-two-amber-35.vercel.app](https://web-two-amber-35.vercel.app), deployment `dpl_3k9ttmygHzAPzFKTtHZ8coDrf9kS`.

## Sesión técnica multiwallet

La sesión del 22 de julio produjo tres identidades distintas:

- organizer: `Ei8KxzsUPfXYWyd8xUwGf3hYuJEgyUg3XtqUgXjEweFf`;
- holder: `HG2bCMMyQtBcKX9nGrGptieSmrEQtp9uoQd2T27pnM2V`;
- staff: `BQvvfHGHYukcTzfMENBWp68fJizRCGbpNFXiRVk3K9AK`.

Cuentas resultantes:

- [Event `DQDQ...`](https://explorer.solana.com/address/DQDQkt988vHDe7tdSHj1Xtd8t8MZ1XmmdvZQ4wXdgTJi?cluster=devnet), publicado;
- [Tier `CeWi...`](https://explorer.solana.com/address/CeWiLxgXLV4D2sJi6uQRe6aaVNxjD5Prsk3ki6xpWanm?cluster=devnet), supply 20 y sold 1;
- [TicketRecord `FPQF...`](https://explorer.solana.com/address/FPQFhk4bxuMk9NcFrgCAuhhkwrX914rp3fnWXc9NQF6Y?cluster=devnet), owner holder y estado `Used`;
- [MPL Core asset `AfwT...`](https://explorer.solana.com/address/AfwTJb9ok32dD2X6GzFJ7p3Vi1GPYfoGjMDkXisYWToG?cluster=devnet), poseído por el holder y owned por el programa Core;
- [CheckInIntent `mC5u...`](https://explorer.solana.com/address/mC5uyHpa7627aDfRWES8sz1X3DkYoer9xoMP7kYJZSC?cluster=devnet), estado `Consumed` y `staff` correcto.

Transacciones finalizadas:

1. [Emisión, tier, publicación y staff](https://explorer.solana.com/tx/y9zz5BSvJ6wQdHjeMNcpPGarWHwkPAPS2hWFL6JPCCnHhzUSYPUiYvCbEqVKuXfcNZrQmzDDCQpYbd8Z4wVL7qH?cluster=devnet).
2. [Compra y creación MPL Core](https://explorer.solana.com/tx/5wFJp5rAnAQKqRnQ184Gy6GimjyFmfymMFGT3csZeoNNhWsKGAeL6KrkynvN6EoBe1ok4f5vurf4e9DdvWonABq5?cluster=devnet).
3. [Presentación firmada](https://explorer.solana.com/tx/YMmG2sXic4RJ4sPRQcMHofRH5M8mEYF1VnKsfC1p2GWmAPRg5eD6nhbsGGvMP9nXS1oAJan4SaMYB1hXWsEEUXU?cluster=devnet).
4. [Consumo por staff](https://explorer.solana.com/tx/3aZAhv6RF9iiZCLWLE27CAgCxyEWFMCPQdxExckq7C8rFnfqKaGiS6RhYpJFw6UAazQgn3SavyYdhpg8BuvrziKY?cluster=devnet).

El intento duplicado de esa sesión fue detenido en preflight y no produjo firma pública. La web actualizada envía el siguiente intento con `skipPreflight` y solo lo registra si el RPC confirma exactamente `IntentNotPending (6036)`; un rechazo de wallet, timeout u otro error ya no cuenta como evidencia.

Después del gate técnico se observarán tiempos, errores, comprensión de wallet y valor percibido. Si los usuarios no valoran propiedad verificable o política compartida frente a QR/lista privada, la hipótesis Solana debe refutarse o reducirse.
