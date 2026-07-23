# Cuentas on-chain y autoridades

Fecha de corte: 2026-07-22

Este documento describe las cuentas que forman el registro de Centlalia, quien las crea,
quien puede modificarlas y como se relacionan con el activo MPL Core. Las direcciones se
derivan con el program ID:

`6KVngKJVYYbqfeXxzXdnaZzmKwo58iin8LmiMyZjgpbu`

Los enteros usados como seeds se codifican en little-endian. Ninguna direccion calculada
por la interfaz sustituye las restricciones de seeds, signer y relaciones verificadas por
Anchor.

## Mapa de cuentas

```text
PlatformConfig
  |
  +-- AssetAuthority (PDA firmante, sin datos)
  |
  +-- Event (organizer + event_id)
        |
        +-- Tier (event + tier_id)
        +-- StaffAuthorization (event + staff)
        +-- TicketRecord (event + ticket_id)
              |
              +-- CoreAsset (PDA creado y poseido por MPL Core)
              +-- ManagedAsset (compatibilidad; no se usa en la vertical Core)
              +-- Listing (ticket + listing_id)
              +-- CheckInIntent (ticket + intent_nonce)
```

## Inventario

| Cuenta               | Seeds                                            | Owner del account | Payer inicial       | Autoridad de negocio                         |
| -------------------- | ------------------------------------------------ | ----------------- | ------------------- | -------------------------------------------- |
| `PlatformConfig`     | `[platform]`                                     | Centlalia         | admin de despliegue | `PlatformConfig.admin`                       |
| `AssetAuthority`     | `[asset-authority, platform_config]`             | No almacena datos | No aplica           | PDA firmante del programa                    |
| `Event`              | `[event, organizer, event_id]`                   | Centlalia         | organizer           | `Event.organizer`                            |
| `Tier`               | `[tier, event, tier_id]`                         | Centlalia         | organizer           | organizer del `Event`                        |
| `TicketRecord`       | `[ticket, event, ticket_id]`                     | Centlalia         | buyer               | holder para presentar; programa para consumo |
| `CoreAsset`          | `[core-asset, ticket_record]`                    | MPL Core          | buyer               | owner actual + `AssetAuthority`              |
| `ManagedAsset`       | `[managed-asset, ticket_record]`                 | Centlalia         | buyer               | compatibilidad del adapter Managed           |
| `Listing`            | `[listing, ticket_record, listing_id]`           | Centlalia         | seller              | seller mientras este activa                  |
| `StaffAuthorization` | `[staff, event, staff]`                          | Centlalia         | organizer           | organizer activa o revoca                    |
| `CheckInIntent`      | `[check-in-intent, ticket_record, intent_nonce]` | Centlalia         | holder              | holder cancela; staff consume                |

`Program` y `ProgramData` pertenecen al loader upgradeable de Solana. Solo se usan durante
`initialize_platform` para demostrar que el admin firmante tambien es la upgrade authority;
no forman parte de cada operacion de ticketing.

## Fuente de verdad

`TicketRecord` es el registro de politica y acceso. Conserva evento, tier, serial, asset,
owner reconocido, estado, transferencias e informacion de check-in.

El `CoreAsset` es la evidencia interoperable de propiedad. En la vertical MPL Core:

- `primary_purchase_core` cobra, crea `TicketRecord` y crea el activo por CPI en una sola
  transaccion;
- `TicketRecord.asset_id` debe ser exactamente el PDA `CoreAsset`;
- el owner leido desde MPL Core debe coincidir con el holder esperado;
- el update authority debe ser `AssetAuthority`;
- `PermanentFreezeDelegate`, tambien controlado por `AssetAuthority`, mantiene el activo
  congelado para impedir una transferencia directa que evada las reglas de Centlalia.

Una instruccion Core no puede confiar solamente en `TicketRecord.owner`: vuelve a
deserializar el activo MPL Core y comprueba owner, asset id y update authority.

## Autoridades por rol

### Admin

- Inicializa una sola vez `PlatformConfig`.
- Cambia tesoreria, fee, pausa y estandar habilitado.
- En la inicializacion debe coincidir con la upgrade authority del programa.

La upgrade authority no debe utilizarse como wallet cotidiana de organizer, holder o staff.

### Issuer u organizer

- Firma creacion, edicion y publicacion de su `Event`.
- Crea y modifica tiers mientras el evento esta en borrador.
- Autoriza y revoca staff para su evento.
- Recibe el pago primario y la regalia configurada.

Un organizer no puede modificar un evento ajeno porque `Event.organizer` y `has_one` se
validan on-chain.

### Holder

- Firma la compra y paga la renta de `TicketRecord` y `CoreAsset`.
- Es owner del activo Core emitido.
- Firma `CheckInIntent`; staff no puede inventar una presentacion en su nombre.

### Staff

- No adquiere propiedad del ticket.
- Solo consume intents del evento para el cual existe un `StaffAuthorization` activo.
- El consumo marca `TicketRecord` como usado y el intent como consumido.

## Compatibilidad y migracion

`PlatformConfig` conserva su layout y su PDA desplegado. La integracion MPL Core fue
aditiva: agrego instrucciones y usa el `AssetAuthority` que ya existia, sin realloc ni
migracion de la cuenta global.

`ManagedAsset` permanece en el IDL para compatibilidad y pruebas, pero no representa un
NFT visible en wallets. No se deben mezclar rutas: un `TicketRecord` declara su
`asset_standard` y cada instruccion exige el adapter correspondiente.

Bubblegum V2 permanece cerrado por `UnsupportedAssetStandard`. Si compresion se vuelve una
necesidad validada, debe agregarse como adapter separado con sus propias cuentas de arbol,
coleccion y pruebas DAS; no debe reinterpretar cuentas Core existentes.

## Instancia devnet

- Program: `6KVngKJVYYbqfeXxzXdnaZzmKwo58iin8LmiMyZjgpbu`
- `PlatformConfig`: `CacqacKXwNNv8MsW1wcTomuxk57umPsw1MfPwP1dztTQ`
- Estandar habilitado: `MplCore`
- Red: devnet

Las cuentas `Event`, `Tier`, `TicketRecord`, `CoreAsset`, `StaffAuthorization` y
`CheckInIntent` se crean durante cada recorrido. Sus direcciones y firmas deben registrarse
en la evidencia de esa sesion, no copiarse como constantes del proyecto.

## Invariantes que deben probarse

1. `Tier.event`, `TicketRecord.event` y todas las cuentas operativas apuntan al mismo evento.
2. El holder de `TicketRecord` y el owner deserializado del activo Core coinciden.
3. Solo `AssetAuthority` controla update y permanent freeze del activo.
4. La compra crea asset y registro atomicamente.
5. Un holder real firma cada `CheckInIntent`.
6. Solo staff activo consume el intent dentro de la ventana.
7. Un segundo consumo falla con `IntentNotPending (6036)`.
8. Una transferencia Core directa no puede saltarse la policy.
