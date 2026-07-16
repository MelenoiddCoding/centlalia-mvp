# Matriz de trazabilidad

Fecha de corte: 2026-07-16

Objetivo: demostrar como cada observacion de Discord y requisito del programa cambia el producto, su evidencia y su estado.

## Convencion de estados

- **Decidido:** existe una decision de producto o arquitectura, pero no implica que este implementada.
- **En construccion:** existe trabajo en el nuevo repositorio, aun sin evidencia de aceptacion completa.
- **Pendiente de evidencia:** la hipotesis requiere usuarios, transacciones o pruebas que todavia no existen.
- **Fuera de alcance:** se excluye deliberadamente del MVP de incubacion.

## Feedback de Discord 09

| ID     | Observacion                                                     | Decision o cambio                                                                                   | Evidencia requerida                                  | Estado                                                           |
| ------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| D09-01 | No validar una plataforma completa                              | Validar el flujo minimo: ticket verificable, circulacion controlada y check-in confiable            | Tareas completadas y entrevista posterior            | Decidido; evidencia pendiente                                    |
| D09-02 | Afinar el segmento inicial                                      | Beachhead: comunidades Web3, meetups Solana, hackathons y workshops pequenos con usuarios de wallet | Lista de reclutamiento y perfiles anonimizados       | Decidido; reclutamiento pendiente                                |
| D09-03 | Reventa puede ser demasiado avanzada                            | Check-in y doble uso son la primera hipotesis; reventa queda secundaria hasta observar el dolor     | Ranking de dolor por usuario y reglas solicitadas    | Decidido; evidencia pendiente                                    |
| D09-04 | Definir el tipo de piloto                                       | Usar demo controlada; shadow pilot solo con sistema normal de respaldo                              | Acuerdo del organizador y plan operativo             | Decidido; piloto pendiente                                       |
| D09-05 | Validar si QR/lista tradicional es suficiente                   | Preguntar por incidentes y comparar utilidad del flujo firmado contra el proceso actual             | Respuestas, incidentes y utilidad 1-5                | Pendiente de evidencia                                           |
| D09-06 | Validar duplicados, screenshots y confusion                     | La sesion incluye un segundo intento de acceso y escenarios de titular incorrecto                   | Log tecnico y observacion del staff                  | Pendiente de evidencia                                           |
| D09-07 | Medir friccion de wallet                                        | Registrar ayuda, errores, abandono y tiempo por tarea                                               | Hoja de sesion y telemetria minima                   | Pendiente de evidencia                                           |
| D09-08 | Staff debe validar sin scanner obligatorio                      | Dashboard movil consume una intencion firmada y corta                                               | E2E con wallet de asistente y staff                  | UI demo y runtime listos; conexión pendiente                     |
| D09-09 | Organizador debe entender las reglas                            | La demo pide configurar o solicitar transferencia, markup, ventana, staff y acceso                  | Al menos una regla concreta solicitada               | Pendiente de evidencia                                           |
| D09-10 | Devnet debe bastar para aprender                                | Devnet se usa como demostracion, nunca como sistema productivo de acceso o pagos                    | Tres demos completas y retroalimentacion             | Decidido; evidencia pendiente                                    |
| D09-11 | Dos organizadores aceptan probar                                | Reclutar por WayLearn y comunidades Solana; pedir evento candidato concreto                         | Dos aceptaciones registradas                         | Pendiente de evidencia                                           |
| D09-12 | Tres demos completas                                            | Usar el mismo guion reproducible de extremo a extremo                                               | Tres registros de sesion                             | Pendiente de evidencia                                           |
| D09-13 | Cinco usuarios completan el flujo                               | Probar por rol y medir exito sin intervencion                                                       | Cinco registros anonimizados                         | Pendiente de evidencia                                           |
| D09-14 | Staff bloquea doble uso                                         | El programa impone consumo exactamente una vez                                                      | Prueba automatizada y simulacion humana              | Unit, E2E y validator pasan; simulación humana pendiente         |
| D09-15 | No usar devnet como venta o acceso real                         | Sin valor economico, con acceso convencional de respaldo                                            | Checklist de seguridad del piloto                    | Decidido                                                         |
| D09-16 | Empezar con pilotos administrados                               | El equipo configura y acompana al organizador durante aprendizaje                                   | Solicitud de piloto y costo operativo registrado     | Decidido; evidencia pendiente                                    |
| D09-17 | No optimizar pricing aun                                        | Fee de plataforma en 0% durante validacion; medir disposicion, no cobrar                            | Pregunta de disposicion y alternativa actual         | Decidido                                                         |
| D09-18 | Preparar demo reproducible                                      | Guion fijo de organizador, asistente y staff, con fallback grabado                                  | README, video y transacciones devnet                 | Demo local y programa devnet listos; video y sesiones pendientes |
| D09-19 | Separar demo, piloto controlado y mainnet                       | Cada termino tiene criterio y riesgo distinto en el dossier                                         | Revision documental y consentimiento del organizador | Decidido                                                         |
| D09-20 | Mantener fuera fiat, QR obligatorio, marketplace, SDK y mainnet | No se implementan antes de cumplir los gates del MVP                                                | Backlog y revision de alcance                        | Fuera de alcance                                                 |
| D09-21 | Documentar aprendizajes por demo                                | Usar formato estandar de hipotesis, tarea, friccion, regla y siguiente cambio                       | Reporte por sesion                                   | Pendiente de evidencia                                           |

## Milestones oficiales de WayLearn

| Milestone                        | Fecha oficial | Aplicacion en Centlalia                                       | Evidencia aceptable                               | Estado al corte                                                   |
| -------------------------------- | ------------- | ------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| 1. Roadmap                       | 2026-06-26    | Roadmap orientado a resultados hasta Demo Day                 | Drive, aviso en Discord, criterios e insignia     | Documento fuente existe; entrega y evaluacion no verificadas      |
| 2. Business Foundation           | 2026-07-03    | Problema, segmento, buyer, propuesta y sostenibilidad         | Drive, aviso en Discord, criterios e insignia     | Documento y feedback existen; entrega y evaluacion no verificadas |
| 3. Technical Architecture        | 2026-07-10    | Arquitectura greenfield, seguridad y flujo Solana             | Drive, aviso en Discord, criterios e insignia     | Documento y programa existen; entrega y evaluacion no verificadas |
| 4. Initial User Validation       | 2026-07-31    | Sesiones sugeridas y cambios derivados del aprendizaje        | Evidencia de aprendizaje real y ajustes concretos | Pendiente                                                         |
| 5. Functional MVP                | 2026-08-21    | Flujo principal usable, Solana integrada y frontend conectado | Repo, CI, devnet, URL, video y E2E                | En construccion                                                   |
| 6. Pitch Deck and Demo Readiness | 2026-08-28    | Deck de 8-10 slides, pitch de 3 minutos y demo de 2           | Deck, guion, ensayo y fallback                    | Pendiente                                                         |
| 7. Demo Day                      | 2026-08-31    | Mostrar problema, evidencia, demo y siguiente ask             | Presentacion y solicitud concreta de pilotos      | Pendiente                                                         |

Las metas de 3 demos, 2 organizadores y los porcentajes de exito son gates internos derivados de D09. El GitBook sugiere 5-10 pruebas, pero no convierte esos numeros en criterios oficiales de aceptacion. La entrega oficial requiere subir cada documento al Drive personal, avisar en Discord y recibir la evaluacion o insignia correspondiente; este repositorio no acredita que esos pasos externos hayan ocurrido.

## Operacion academica del programa

- Al menos un integrante del equipo debe asistir a las sesiones operativas de los miercoles.
- Cada milestone debe subirse al Drive personal indicado por el programa y notificarse por Discord.
- La evaluacion y la insignia ocurren fuera de este repositorio; deben registrarse como evidencia externa, no inferirse por la existencia de un archivo.
- El equipo debe mantener un checklist privado de asistencia, enlace de Drive, fecha de aviso, feedback y estado de evaluacion.

## Objetivos transversales del programa

| Objetivo WayLearn                  | Decision Centlalia                                           | Criterio verificable                                        | Estado                         |
| ---------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------ |
| Validar un problema real           | Check-in/doble uso primero                                   | Dos organizadores con evento candidato y utilidad observada | Pendiente                      |
| MVP funcional en Solana            | Programa Anchor, cliente generado y web conectada            | Flujo multiwallet en devnet                                 | Código listo; devnet pendiente |
| Flujo claro frontend-backend       | Web por rol y programa como fuente de reglas                 | E2E organizador-asistente-staff                             | Demo lista; on-chain pendiente |
| Producto probado                   | Protocolo estructurado de sesiones                           | 5-10 usuarios y cambios documentados                        | Pendiente                      |
| Explicar valor de blockchain       | Comparar propiedad/reglas verificables contra proceso actual | Usuarios entienden una ventaja concreta y la valoran        | Pendiente                      |
| Preparar startup y pitch           | Narrativa enfocada, modelo gestionado y roadmap              | Deck, pitch y ask de pilotos                                | Pendiente                      |
| Preparar oportunidades posteriores | Fondeo solo despues de evidencia de programa                 | Dossier de evidencia y gates postprograma                   | Decidido; no iniciado          |

## Evidencia que no existe aun

Al 15 de julio de 2026 no se debe afirmar que Centlalia tenga:

- cinco usuarios que hayan completado el nuevo flujo;
- tres demos completas del MVP greenfield;
- dos organizadores comprometidos con un evento candidato;
- disposicion de pago confirmada;
- programa greenfield aceptado en devnet;
- compatibilidad Bubblegum V2 confirmada para todo el flujo;
- auditoria de seguridad o preparacion de mainnet;
- grant, inversion o compromiso de fondeo.

## Fuentes oficiales

- [Programa Solana Latam Labs de WayLearn](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/te-damos-la-bienvenida-a-solana-latam-labs-program-de-waylearn)
- [Milestones](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/milestones)
- [Testing de MVP](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/recursos-de-producto-y-negocio/recursos-de-apoyo/testing-de-mvp)
