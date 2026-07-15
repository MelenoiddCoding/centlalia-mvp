# Validacion integral del sistema Centlalia

Estado: dictamen tecnico actualizado; validacion de usuarios pendiente

Fecha de corte: 2026-07-15

Alcance: producto, negocio, arquitectura, seguridad, evidencia y alineacion con WayLearn

## Dictamen ejecutivo

Centlalia tiene una tesis de producto coherente para la incubacion: demostrar que un ticket verificable, con reglas de circulacion y check-in de un solo uso, resuelve un problema concreto para comunidades Web3 y eventos Solana pequenos. La idea y el alcance documental son validos para continuar, pero el sistema **todavia no esta validado con usuarios ni listo para operacion real**.

El prototipo anterior sirve como fuente de aprendizaje, no como base productiva. La implementación greenfield ya cierra en código host los riesgos principales de propiedad y check-in, pero todavía requiere runtime SBF/validator, despliegue devnet, frontend on-chain y evidencia de usuarios antes de considerarse un MVP validado.

Resultado por dimension:

| Dimension               | Dictamen                        | Evidencia actual                                                 |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------- |
| Problema y segmento     | Hipotesis enfocada              | Documentos previos y feedback de Discord; entrevistas pendientes |
| Propuesta de valor      | Coherente, no confirmada        | Flujo definido; utilidad percibida pendiente                     |
| Modelo de negocio       | Hipotesis razonable             | Piloto gestionado definido; disposicion de pago pendiente        |
| Arquitectura greenfield | Implementada, runtime pendiente | Programa, IDL/Codama, web, harness y toolchain locales           |
| Seguridad y propiedad   | Corregida para `ManagedAsset`   | Pruebas host pasan; SBF/devnet e integración externa pendientes  |
| MVP funcional           | Demo reproducible               | Recorrido local completo; program account devnet ausente         |
| Validacion WayLearn     | Parcial                         | Documentos existen; entregas externas, usuarios y MVP pendientes |
| Fondeo                  | Fuera del objetivo inmediato    | El programa actualmente no cuenta con grant para sus proyectos   |

## Metodo de validacion

Este dictamen usa cuatro fuentes:

1. Los documentos historicos `00` a `09` del proyecto.
2. El feedback de Diana Torres en Discord del 7 de julio de 2026.
3. Los objetivos, milestones y criterios de testing publicados por WayLearn.
4. La inspeccion tecnica del prototipo historico `MelenoiddCoding/centlalia`.

No se atribuyen resultados a usuarios, pilotos o transacciones nuevas que todavia no existen. Los resultados del prototipo de hackathon no sustituyen evidencia de la incubacion.

## Hallazgos prioritarios

### Criticos

#### V-01. La propiedad reconocida podia divergir de la propiedad del activo

El flujo historico de regalo actualizaba un propietario reconocido sin transferir necesariamente el activo comprimido. Esto permite que el registro de acceso y el asset representen titulares distintos.

Correccion obligatoria: regalos y reventas deben transferir el asset y actualizar `TicketRecord` en una operacion coherente. Si la tecnologia de asset elegida no permite demostrar esta invariancia, no se acepta para el MVP.

Estado: `ManagedAsset` y `TicketRecord` cambian atómicamente en regalo/reventa y las pruebas unitarias del adapter pasan. Una CPI NFT/cNFT real y su evidencia SBF/devnet siguen pendientes.

#### V-02. El check-in no demostraba posesion de la wallet

El prototipo permitia que staff presentara una public key como supuesto titular. Bloquear un segundo uso no basta si el primer presentador no demuestra control de la wallet.

Correccion obligatoria: el titular firma la creacion de un `CheckInIntent` corto; staff autorizado lo consume una sola vez. Deben validarse titular actual, evento, vigencia, ventana de acceso y estado no usado.

Estado: protocolo implementado con firma del holder, intención de hasta cinco minutos, staff autorizado y consumo único. Las pruebas Rust y el harness TypeScript cubren el flujo; la ejecución local-validator en Linux/CI sigue pendiente.

#### V-03. Existio exposicion de una credencial en el repositorio historico

El repositorio anterior rastreo una URL de proveedor con credencial. Este documento no reproduce su valor.

Correccion obligatoria: rotar la credencial, mantener secretos fuera de Git, utilizar variables de entorno del servidor y limitar el proxy DAS a metodos y parametros permitidos.

Estado: rotacion y verificacion de historial pendientes por el propietario de la cuenta.

### Altos

#### V-04. La delegacion del Merkle tree no soportaba bien multiples organizadores

La autoridad del arbol compartido estaba ligada al registro de un organizador, aunque el arbol solo puede mantener una autoridad operativa coherente.

Correccion: usar un PDA de plataforma como autoridad unica y separar la autorizacion del organizador a nivel de `Event`.

Estado: el MVP actual no crea Merkle tree y usa una autoridad PDA de plataforma para `ManagedAsset`. Si se incorpora Bubblegum/Core, la prueba CPI multi-organizador vuelve a ser bloqueante.

#### V-05. Regalía y limite de reventa compartian una semantica

Un porcentaje era usado tanto para limitar el precio como para calcular la distribucion. Esto puede producir pagos invalidos y no representa dos politicas distintas.

Correccion: separar `max_resale_markup_bps`, `organizer_royalty_bps` y `platform_fee_bps`; rechazar cualquier reparto cuya suma exceda 10,000 puntos base.

Estado: campos separados y aritmética verificada implementados; las pruebas Rust cubren reparto exacto, límites y overflow.

#### V-06. Faltaban restricciones temporales y de ciclo de vida en check-in

El sistema historico podia aceptar estados o momentos no apropiados y no cubria completamente cancelacion, cierre o revocacion de staff.

Correccion: definir una maquina de estados explicita y validar ventana de acceso en el programa, no solo en UI.

Estado: máquina de estados, ventanas on-chain, revocación y expiración implementadas y cubiertas en pruebas host. Como no existen reembolsos ni terminalización masiva, el programa rechaza cancelar un evento publicado que ya emitió tickets.

#### V-07. No habia cobertura automatizada del check-in

El flujo de mayor valor para la nueva tesis no tenia pruebas del caso feliz, doble uso, titular incorrecto, staff revocado o intento expirado.

Correccion: estos escenarios son bloqueantes en CI y en el E2E de devnet.

Estado: 25 pruebas Rust cubren el dominio y fallos de check-in; el E2E de navegador cubre el rechazo demo y el harness local-validator exige `IntentNotPending (6036)`. Falta ejecutar ese harness contra el SBF en CI/devnet.

### Medios

#### V-08. El repositorio historico no era reproducible de forma confiable

La documentacion, hooks de instalacion y nombres de variables de entorno no eran consistentes. Tampoco existia CI que demostrara build y pruebas desde cero.

Correccion: devcontainer versionado, `.env.example`, scripts unificados y CI en cada pull request.

Estado: workspace, lockfiles, devcontainer, variables, secret scan y CI están versionados; los checks locales pasan. La primera ejecución en GitHub todavía no existe.

#### V-09. Faltaban operaciones necesarias para un ciclo operativo completo

No estaban cerrados casos como revocar staff, cancelar un listing y transiciones terminales del evento.

Correccion: incluir esas operaciones en el contrato publico del MVP y probar autorizaciones y repeticion.

Estado: revocación de staff, cancelación de listing, cancelación/cierre de evento y expiración/cancelación de intent están implementadas. La cancelación con tickets emitidos queda bloqueada hasta diseñar y probar una política de reembolsos; la cobertura runtime completa sigue pendiente.

#### V-10. La evidencia previa no corresponde a la ventana actual de incubacion

El prototipo historico tuvo actividad de hackathon, pero no demuestra que usuarios del segmento actual hayan probado el producto ni que un organizador acepte un piloto candidato.

Correccion: ejecutar el protocolo de `PROTOCOLO-VALIDACION.md` y conservar evidencia anonimizada.

Estado: pendiente.

## Validacion contra WayLearn

WayLearn pide validar el problema, construir un MVP funcional conectado a Solana, probar con usuarios y preparar la startup para Demo Day y oportunidades posteriores. Centlalia cumple hoy con la definición del problema, la planeación y una implementación local reproducible, pero todavía debe demostrar:

- pruebas con usuarios del segmento; 5 a 10 es una meta sugerida, no un mínimo oficial;
- cambios de producto derivados de aprendizaje real;
- flujo principal conectado entre frontend y programa Solana;
- runtime automatizado SBF/devnet y demo on-chain reproducible;
- evidencia del valor que agrega blockchain frente a una alternativa tradicional;
- pitch, progreso y siguientes pasos sin presentar fondeo como garantizado.

La matriz completa se encuentra en `TRAZABILIDAD.md`.

## Criterios para cambiar el dictamen

Como gate interno, el sistema podrá declararse "MVP validado para Demo Day" solo si se cumplen todas estas condiciones:

- repositorio publico reproducible y CI verde;
- programa desplegado en devnet y frontend accesible;
- organizador crea y publica un evento;
- asistente compra y presenta un ticket firmado;
- staff autorizado consume el check-in y un segundo intento falla;
- propiedad del asset y `TicketRecord` permanecen sincronizados en regalo y reventa;
- al menos 5 usuarios objetivo completan tareas de prueba;
- se realizan 3 demos completas y 2 organizadores aceptan evaluar un evento candidato;
- se documentan fallas, cambios y evidencia sin datos personales innecesarios.

Los números de usuarios, demos y organizadores proceden de D09 y de decisiones internas, no son criterios oficiales de aceptación de WayLearn. Hasta cumplir el gate, la formulación correcta es "MVP técnico en construcción con hipótesis enfocadas", no "plataforma validada" ni "sistema listo para producción".

## Fuentes

- [Bienvenida al programa WayLearn](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/te-damos-la-bienvenida-a-solana-latam-labs-program-de-waylearn)
- [Milestones de WayLearn](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/milestones)
- [Testing de MVP](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/recursos-de-producto-y-negocio/recursos-de-apoyo/testing-de-mvp)
- [Metaplex Bubblegum V2](https://www.metaplex.com/docs/smart-contracts/bubblegum-v2)
