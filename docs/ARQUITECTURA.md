# Arquitectura tecnica del MVP

Estado: arquitectura objetivo con corte de implementación

Fecha de corte: 2026-07-16

Red de incubacion: Solana devnet

## Estado implementado al corte

- El programa Anchor implementa cuentas, autorizaciones, circulación, reventa y check-in exactly-once con un `ManagedAsset` interno; 25 pruebas Rust, Clippy y formato pasan.
- `packages/client` contiene la demo determinista, el IDL, 52 módulos Codama generados, detección Wallet Standard y un adapter que construye ocho operaciones y serializa transacciones v0.
- `apps/web` ejecuta el recorrido completo en modo demo explícito, protege el endpoint DAS y muestra un diagnóstico RPC/wallet real. El recorrido por roles todavía no envía instrucciones al programa.
- El program ID `6KVngKJVYYbqfeXxzXdnaZzmKwo58iin8LmiMyZjgpbu` está desplegado con loader upgradeable en devnet; `PlatformConfig` está inicializado con `ManagedAsset` y fee 0%.
- El harness con admin, organizador, asistente y staff pasa contra el SBF en validator Linux dentro de la CI; verifica compra, presentación, consumo y rechazo duplicado `IntentNotPending (6036)`.
- Bubblegum V2, MPL Core y DAS aplicado a tickets reales permanecen pendientes. No se consideran implementados por aparecer en la arquitectura objetivo.

## Principios

1. El programa, no la interfaz, impone propiedad, autorizacion, ventanas, precios y consumo unico.
2. Un ticket tiene un solo titular coherente entre asset y `TicketRecord`.
3. El check-in prueba control de wallet y se consume exactamente una vez.
4. Devnet es un entorno de prueba; no procesa pagos ni decide acceso real sin respaldo.
5. Los secretos de RPC/DAS nunca llegan al navegador ni al repositorio.
6. El MVP mantiene una vertical concreta y evita un SDK, marketplace o indexador generico prematuro.

## Topologia objetivo

```text
Wallet del usuario
       |
       v
apps/web (Next.js, React, TypeScript)
       |                         \
       v                          v
packages/client              /api/das
(IDL/Codama)                 (proxy allowlist)
       |                          |
       v                          v
Programa Anchor <---- RPC Solana / proveedor DAS
       |
       v
PDAs de dominio + ManagedAsset
                     (adapter Metaplex futuro)
```

### Componentes

- `apps/web`: interfaz en español, responsive y separada por roles. Usa rutas de servidor solo cuando es necesario proteger DAS.
- `programs/ticketing`: programa Anchor con cuentas, instrucciones, errores y eventos del dominio.
- `packages/client`: tipos, demo, IDL, cliente Codama reproducible, adapter de transacciones v0 y bridge Wallet Standard.
- `packages/program-tests` y `apps/web/e2e`: harness local-validator multiwallet y recorridos de navegador en escritorio/móvil, ejecutados en CI.
- `.devcontainer`: toolchain reproducible para Codespaces o Docker local.
- `.github/workflows`: controles de formato, lint, tipos, pruebas y secretos.

El `program_id` está sincronizado en `declare_id!`, `Anchor.toml` y el entorno de ejemplo. El 16 de julio de 2026 se verificó en devnet como cuenta ejecutable de 556,616 bytes, propiedad de `BPFLoaderUpgradeab1e11111111111111111111111`; esta evidencia habilita el adapter, pero no sustituye la integración de firma/envío en la UI.

## Stack objetivo

- Node.js 22 y workspace `pnpm`.
- Next.js 16, React 19 y TypeScript para web.
- `@solana/kit` y Wallet Standard para RPC, mensajes v0, detección, conexión y firma.
- Rust, Anchor 1.1.2 y Agave/Solana compatible dentro del devcontainer.
- Codama para generar el cliente a partir del IDL.
- `ManagedAsset` como estándar implementado de incubación; Bubblegum V2 y MPL Core solo se habilitarán con CPI y pruebas de propiedad reales.
- Vitest para paquetes TypeScript, pruebas Anchor para el programa y Playwright para E2E web.

Las versiones efectivas deben estar fijadas en manifests y lockfiles. Este documento no autoriza actualizaciones automaticas sin ejecutar la matriz de pruebas.

## Modelo de cuentas

### `PlatformConfig`

- `admin`
- `treasury`, validada como `SystemAccount` al inicializar o actualizar
- `asset_standard`: `Managed` implementado; `BubblegumV2` y `MplCore` reservados y rechazados hasta integrar sus adapters
- `platform_fee_bps`
- `paused`
- bumps de plataforma y autoridad de asset, fecha de creación y versión

PDA: `["platform"]`.

### `Event`

- `organizer`
- snapshot de `platform_treasury`
- `event_id`
- nombre y metadata compacta
- `sales_start_at`, `sales_end_at`
- `starts_at`, `ends_at`
- `check_in_start_at`, `check_in_end_at`
- `status`
- `max_resale_markup_bps`
- `organizer_royalty_bps`
- snapshot de `platform_fee_bps`
- `resale_enabled`
- contadores de tier y ticket
- bump y fecha de creación

PDA: `["event", organizer, event_id]`.

Estados permitidos: `Draft -> Published -> Closed`. `Draft -> Cancelled` es terminal; `Published -> Cancelled` solo se permite si no se emitieron tickets, porque el MVP no implementa reembolsos. No se permiten regresiones.

### `Tier`

- referencia al evento
- `tier_id`
- nombre
- precio en lamports
- supply
- vendidos
- activo
- `bump`

PDA: `["tier", event, tier_id]`.

### `TicketRecord`

- referencia a evento y tier
- serial `u64`
- `asset_id`
- `asset_standard`
- `owner`
- precio original
- numero de transferencias
- estado
- `used_at`, `used_by`
- contadores de listing e intención, `active_intent`, bump y fecha

PDA: `["ticket", event, ticket_id]`.

### `ManagedAsset`

- autoridad PDA de asset
- owner, ticket y estándar
- bump y fecha

PDA: `["managed-asset", ticket_record]`. Es la única implementación de asset habilitada en este corte.

Estados implementados: `Active -> Listed -> Active` y `Active -> Used`. `Cancelled` está reservado, pero no existe una transición masiva; por ello un evento publicado con tickets no puede cancelarse. Un ticket usado no puede transferirse, listarse ni volver a presentarse.

### `Listing`

- ticket y evento
- vendedor
- precio
- estado
- creacion y expiracion
- `bump`

PDA: `["listing", ticket, listing_id]`. `TicketRecord.status` impide más de un listing activo aunque se conserven cuentas históricas por ID.

### `StaffAuthorization`

- evento
- wallet de staff
- `active`
- `bump`

PDA: `["staff", event, staff]`.

### `CheckInIntent`

- evento
- ticket
- holder
- `expires_at`
- nonce, estado, tiempos de creación/consumo, staff y bump

PDA: `["check-in-intent", ticket, nonce]`. `TicketRecord.active_intent` permite solo una intención pendiente y se limpia al consumir, cancelar o expirar.

## Instrucciones publicas

### Administracion de plataforma

- `initialize_platform`
- `update_platform`

### Organizador

- `create_event`
- `update_event`
- `publish_event`
- `cancel_event`
- `close_event`
- `add_tier`
- `update_tier`
- `authorize_staff`
- `revoke_staff`

### Asistente

- `primary_purchase`
- `gift_ticket`
- `list_ticket`
- `cancel_listing`
- `buy_resale`
- `present_check_in`
- `cancel_check_in`
- `expire_check_in`

### Staff

- `consume_check_in`

La implementacion puede agrupar parametros en structs versionados, pero no debe cambiar estas capacidades ni sus invariantes sin registrar una decision.

## Flujo de check-in

1. El titular conectado selecciona "Presentar para acceso".
2. Su wallet firma `present_check_in` y crea una intencion con vigencia maxima de cinco minutos.
3. El dashboard de staff consulta intenciones del evento o recibe el identificador mostrado por el asistente.
4. Staff firma `consume_check_in`.
5. El programa verifica staff activo, evento publicado, ventana de acceso, titular actual, intencion vigente y ticket no usado.
6. El programa asigna `used_at`, cambia el ticket a `Used` y cierra la intencion.
7. Cualquier segundo intento falla con un error determinista.

No se exige QR para el MVP. Un QR futuro podra transportar el identificador de la intencion, pero no sustituira la firma ni la validacion on-chain.

## Estrategia de asset

### Decisión vigente

El corte actual usa exclusivamente `ManagedAsset`. La creación, regalo y reventa actualizan owner del asset y `TicketRecord` dentro de la misma instrucción; configurar `BubblegumV2` o `MplCore` se rechaza. Esta decisión demuestra invariantes del ledger de Centlalia, pero no interoperabilidad NFT/cNFT ni propiedad consultable mediante DAS.

### Gate para un estándar externo

Antes de sustituir `ManagedAsset`, un adapter CPI en SBF/devnet debe demostrar:

- creacion de tree y coleccion con autoridad PDA de plataforma;
- mint y lectura mediante DAS;
- transferencia de titular coherente con `TicketRecord`;
- politica de freeze o delegado permanente necesaria para impedir circulacion incompatible;
- operacion con al menos dos organizadores sobre la misma autoridad de plataforma.

Si una prueba falla, `ManagedAsset` permanece habilitado y el producto no se presenta como NFT/cNFT. No se mantiene una implementación híbrida donde `TicketRecord.owner` y el asset puedan divergir. Metaplex indica que Bubblegum V2 requiere un proveedor RPC con DAS y que su adopción en wallets/marketplaces sigue en progreso; esa limitación no autoriza reducir la invariancia de propiedad.

## Pagos y reventa

- Solo SOL de devnet durante incubacion.
- `platform_fee_bps`: 0 por defecto para sesiones; configurable y probado con 200 bps.
- `organizer_royalty_bps`: 500 por defecto.
- `max_resale_markup_bps`: 2,000 por defecto.
- El precio maximo se deriva del precio original y markup, nunca de la regalía.
- La suma de vendedor, regalía y plataforma debe ser exactamente el precio y nunca desbordarse.
- La compra de reventa transfiere fondos, asset y estado dentro de una operacion atomica; ante cualquier fallo no se conserva un cambio parcial.

Los defaults sirven para probar codigo, no constituyen pricing validado.

## DAS y secretos

- `NEXT_PUBLIC_SOLANA_RPC_URL` puede contener un endpoint publico de devnet.
- `DAS_RPC_URL` es exclusivamente servidor y nunca lleva prefijo `NEXT_PUBLIC_`.
- `/api/das` usa una allowlist minima, valida el JSON-RPC, limita tamaño y frecuencia y no devuelve la URL upstream.
- Logs y errores redactan headers, query strings y credenciales.
- `.env.example` solo contiene valores publicos o vacios.
- La credencial expuesta en el prototipo historico debe rotarse antes de conectar el nuevo repositorio.

No se introduce una base de datos ni indexador propio en el MVP. El programa es la fuente de reglas; DAS es una vista indexada de assets y debe tratarse como dependencia eventualmente consistente.

## Controles de seguridad

- Verificar signer, owner, seeds, bump y relaciones `has_one` en cada instruccion.
- Validar todos los tiempos con `Clock` on-chain.
- Usar aritmetica verificada para lamports, supply, counters y puntos base.
- Impedir cierre de cuentas que deje tickets o fondos huerfanos.
- Rechazar replay, listing duplicado, staff revocado, titular incorrecto e intencion expirada.
- No confiar en roles, precios, owner, estado ni ventanas enviados por la UI.
- Emitir eventos de programa para crear, transferir, listar, vender y consumir tickets.
- Mantener llaves de despliegue fuera de Git y separar autoridad de deploy de wallets de demo.

## Disponibilidad y UX

- Mostrar estado confirmado, procesando o fallido de cada transaccion.
- Esperar confirmacion antes de presentar una accion como terminada.
- Explicar expiracion y permitir regenerar una intencion de check-in.
- Si DAS esta atrasado, mostrar un estado de sincronizacion y no asumir cambio de propietario.
- El shadow pilot conserva lista o QR tradicional como respaldo operativo.

## Pruebas de aceptacion

- Programa: autoridades, seeds, ciclo de evento, supply, tiempos, pagos y overflow.
- Asset: mint, regalo y reventa mantienen asset y registro sincronizados.
- Listing: crear, cancelar, expirar y bloquear doble compra.
- Check-in: caso feliz, segundo intento, titular incorrecto, staff revocado, ventana invalida e intencion expirada.
- Multiwallet: organizador, dos asistentes y staff en devnet.
- Web: flujos por rol en escritorio y movil, estados de error y wallet rechazada.
- Seguridad: secret scan, ninguna credencial rastreada y proxy DAS limitado.

## Fuentes tecnicas

- [Bubblegum V2](https://www.metaplex.com/docs/smart-contracts/bubblegum-v2)
- [Metaplex DAS API](https://www.metaplex.com/docs/dev-tools/das-api)
- [Guia tecnica de WayLearn](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/recursos-tecnicos)
