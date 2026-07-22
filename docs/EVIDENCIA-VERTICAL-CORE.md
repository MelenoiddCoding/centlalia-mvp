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

| Evidencia                           | Estado al corte                 | Gate para aprobar                          |
| ----------------------------------- | ------------------------------- | ------------------------------------------ |
| Rust, fmt y Clippy                  | Pasa local                      | CI Linux verde                             |
| IDL y cliente Codama                | Generados; 11 builders probados | Sin diff después de regenerar              |
| Web Wallet Standard                 | Implementada y compilada        | Firma real en desktop y móvil              |
| Compra + creación Core atómica      | Implementada                    | E2E SBF con programa Core oficial          |
| Owner Core verificado en check-in   | Implementado                    | Cuenta y owner observables en devnet       |
| Segundo consumo                     | Cubierto en dominio y harness   | Error determinista en devnet               |
| Prevención de transferencia externa | Plugin congelado implementado   | Intento directo de transferencia rechazado |
| Evidencia de usuarios               | Pendiente                       | 5-10 sesiones según protocolo              |

## Regla de comunicación

Hasta que CI SBF, upgrade devnet y el recorrido de tres wallets produzcan firmas públicas, se permite decir “vertical MPL Core implementada y pendiente de despliegue”. No se permite decir “MVP transaccional validado”, “NFT funcionando en wallets” o “usuarios lo necesitan”.

Después del gate técnico se observarán tiempos, errores, comprensión de wallet y valor percibido. Si los usuarios no valoran propiedad verificable o política compartida frente a QR/lista privada, la hipótesis Solana debe refutarse o reducirse.
