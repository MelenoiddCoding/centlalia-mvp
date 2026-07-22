# Registro de decisiones vigentes

Ultima actualizacion: 2026-07-15

Este registro sustituye las decisiones incompatibles del dossier historico. Una decision solo cambia mediante una entrada nueva con evidencia y consecuencias explicitas.

## D-017. Construir el MVP en un repositorio greenfield

- **Estado:** aprobada.
- **Decision:** `MelenoiddCoding/centlalia-mvp` sera la fuente canonica; el repo de hackathon sera solo referencia.
- **Razon:** el prototipo contiene deuda de propiedad, check-in, delegacion y reproducibilidad que conviene no heredar.
- **Consecuencia:** no copiar codigo del prototipo sin revision; reconstruir contratos, cliente, web y pruebas.
- **Reabrir si:** una pieza historica aislada pasa revision de seguridad y reduce riesgo sin arrastrar arquitectura anterior.

## D-018. Priorizar check-in y doble uso

- **Estado:** aprobada como hipotesis principal.
- **Decision:** el mensaje y la primera vertical se enfocan en presentacion firmada, staff autorizado y consumo unico.
- **Razon:** el feedback indica que reventa puede ser avanzada para eventos pequenos.
- **Evidencia faltante:** usuarios aun no han confirmado que este sea el dolor principal.
- **Reabrir si:** validacion muestra que otro problema tiene frecuencia, severidad e intencion de adopcion claramente mayores.

## D-019. Mantener reventa como capacidad secundaria

- **Estado:** aprobada.
- **Decision:** implementar la vertical completa de circulacion, pero no liderar con reventa hasta que usuarios la prioricen.
- **Consecuencia:** si el acceso se retrasa, se congela reventa antes de recortar check-in.
- **Reabrir si:** al menos dos organizadores solicitan reglas de reventa para un evento candidato.

## D-020. Usar devnet solo para pruebas controladas

- **Estado:** aprobada.
- **Decision:** demos, simulaciones y shadow pilots conservan el metodo normal de acceso y no procesan valor real.
- **Razon:** devnet no es una red productiva ni una fuente unica segura para la puerta.
- **Reabrir si:** existe version mainnet endurecida, revision de seguridad y plan operativo aprobado.

## D-021. Exigir prueba de posesion para check-in

- **Estado:** aprobada.
- **Decision:** el holder crea una intencion firmada de cinco minutos y staff activo la consume una sola vez.
- **Razon:** proporcionar una public key no demuestra control de la wallet.
- **Consecuencia:** QR queda como transporte opcional futuro, no como control de seguridad.
- **Reabrir si:** pruebas de campo requieren otro mecanismo que preserve firma, vigencia y consumo unico.

## D-022. Mantener una sola verdad de propiedad

- **Estado:** aprobada.
- **Decision:** regalo y reventa deben sincronizar transferencia del asset y `TicketRecord`.
- **Razon:** una propiedad "reconocida" distinta del asset invalida la promesa de portabilidad.
- **Consecuencia:** cualquier operacion que no pueda ser atomica se rechaza.
- **Reabrir si:** se redefine explicitamente el asset como recibo no transferible; tal cambio exige nueva validacion de producto.

## D-023. Probar Bubblegum V2 y aplicar fallback automatico

- **Estado:** aplazada y sustituida para la entrega actual por D-030.
- **Decision:** Bubblegum V2 se usa solo si el spike demuestra mint, DAS, transferencia, policy y multi-organizador; de lo contrario se usa MPL Core.
- **Razon:** V2 ofrece delegates y freeze, pero su compatibilidad de ecosistema aun esta en adopcion.
- **Fecha limite:** 2026-07-17.
- **Reabrir si:** la opcion elegida falla posteriormente una invariancia de propiedad o la demo multiwallet.

## D-024. Usar autoridad PDA de plataforma

- **Estado:** aprobada.
- **Decision:** un PDA de plataforma controla tree/coleccion; los permisos de cada organizador viven en sus cuentas de evento.
- **Razon:** un tree compartido no debe alternar autoridad por organizador.
- **Reabrir si:** se adopta un tree independiente por evento con costos y operacion justificados.

## D-025. Separar politicas economicas

- **Estado:** aprobada.
- **Decision:** markup maximo, regalía del organizador y fee de plataforma son campos distintos en puntos base.
- **Defaults de prueba:** 20%, 5% y 0%, respectivamente.
- **Razon:** precio permitido y distribucion son conceptos diferentes.
- **Evidencia faltante:** los defaults no constituyen pricing validado.

## D-026. Empezar con piloto gestionado

- **Estado:** aprobada.
- **Decision:** el equipo acompana configuracion, wallets, demo y reporte; no se promete autoservicio.
- **Razon:** maximiza aprendizaje y revela costos operativos.
- **Reabrir si:** tres pilotos repetibles demuestran que el onboarding puede automatizarse sin perder exito.

## D-027. Buscar fondeo despues de formar y validar el proyecto

- **Estado:** aprobada por el equipo.
- **Decision:** hasta Demo Day se priorizan producto, evidencia y pilotos; las solicitudes de capital se preparan despues.
- **Razon:** WayLearn prepara para oportunidades posteriores y actualmente no cuenta con un grant para los proyectos participantes.
- **Consecuencia:** Demo Day pide pilotos y continuidad, no un desembolso presentado como seguro.
- **Reabrir si:** surge una oportunidad con fecha limite que no distrae los gates; aun asi debe describirse como oportunidad, no validacion.

## D-028. No crear backend persistente en el MVP

- **Estado:** aprobada.
- **Decision:** programa Solana, RPC/DAS y un proxy servidor minimo cubren la vertical; no hay base de datos ni indexador propio.
- **Razon:** reduce superficie y evita infraestructura antes de probar demanda.
- **Reabrir si:** la validacion demuestra un requisito que RPC/DAS no puede cubrir con confiabilidad aceptable.

## D-029. Mantener fuera extensiones no bloqueantes

- **Estado:** aprobada.
- **Decision:** fiat, QR obligatorio, custodia, marketplace general, SDK, mainnet y auditoria externa quedan postprograma.
- **Razon:** no son necesarios para validar el flujo minimo.
- **Reabrir si:** un milestone oficial cambia o una prueba demuestra que una extension es imprescindible para completar la tarea primaria.

## D-030. Usar ManagedAsset hasta verificar una CPI externa

- **Estado:** implementada para el corte 2026-07-15.
- **Decision:** el programa usa un ledger `ManagedAsset` canónico y rechaza `BubblegumV2` y `MplCore` mientras no exista una CPI probada.
- **Razon:** es preferible demostrar propiedad y transferencia atómicas dentro del programa que afirmar una interoperabilidad inexistente.
- **Consecuencia:** el MVP valida reglas de acceso, pero no puede presentarse todavía como ticket cNFT/NFT portable ni usar DAS como evidencia de propiedad.
- **Reabrir si:** mint, lectura, transferencia y política del estándar externo pasan pruebas SBF/devnet y mantienen sincronía con `TicketRecord`.

## D-031. Usar MPL Core para la primera vertical transaccional

- **Estado:** implementada en código; pendiente de gate SBF y devnet al 2026-07-22.
- **Decisión:** crear el activo Core por CPI dentro de `primary_purchase_core` y congelarlo con autoridad PDA de Centlalia.
- **Razón:** permite validar propiedad y acceso sin introducir antes de tiempo árbol, DAS y pruebas Merkle de Bubblegum.
- **Control:** check-in verifica owner, programa propietario y update authority directamente desde la cuenta Core.
- **Límite:** no se afirma operación devnet ni adopción de wallet hasta registrar firmas públicas del recorrido de tres wallets.
- **Reabrir si:** el E2E SBF falla, el holder logra transferir fuera de política o la compresión se vuelve un requisito observado.

## Decisiones historicas superadas

- Productizar directamente el repo del hackathon: superada por D-017.
- Tratar grant/public good como primera capa de sostenibilidad actual: superada por D-027.
- Usar `recognized_owner` sin transferencia real: prohibida por D-022.
- Rechazar MPL Core por ausencia de CPI: D-030 queda superada para compra y check-in por D-031; Managed sigue disponible para compatibilidad.
- Tratar reventa como dolor principal asumido: reemplazada por D-018 y D-019.
