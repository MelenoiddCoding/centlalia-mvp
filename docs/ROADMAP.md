# Roadmap de resultados

Periodo: 2026-07-15 a 2026-08-31

Objetivo: llegar a Demo Day con la hipotesis del problema validada o refutada con evidencia, un MVP funcional en devnet y solicitudes concretas de piloto si los hallazgos las justifican.

Este roadmap mide resultados verificables, no cantidad de features. Las fechas oficiales de WayLearn son [validacion inicial el 31 de julio, MVP funcional el 21 de agosto, pitch el 28 de agosto y Demo Day el 31 de agosto](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/milestones).

## 14-17 de julio: linea base y decisiones bloqueantes

Resultados:

- repositorio greenfield publico y toolchain reproducible;
- CI inicial y politica de secretos;
- modelo de cuentas e invariantes de seguridad acordados;
- spike Bubblegum V2 ejecutado con regla de fallback a MPL Core;
- interfaz de los tres roles definida;
- invitacion de reclutamiento preparada y distribuida.

Gate G1:

- El repo instala y compila desde el devcontainer.
- No existen secretos rastreados.
- La tecnologia de asset queda seleccionada por evidencia del spike.
- Existen al menos 10 invitaciones enviadas o contactos elegibles identificados.

Si G1 falla: usar Codespaces si Docker local no esta disponible; elegir MPL Core si Bubblegum no cumple la prueba; no extender la fecha para conservar una arquitectura incierta.

## 20-24 de julio: vertical de acceso

Resultados:

- organizador crea evento, tier, publica y autoriza staff;
- asistente compra ticket de devnet;
- titular crea `CheckInIntent` firmado;
- staff consume acceso y el segundo intento falla;
- pruebas de autoridad, supply, ventanas y doble uso pasan localmente;
- alpha de devnet disponible para sesiones internas.

Gate G2:

- Un E2E interno con tres wallets completa la vertical sin modificar estado manualmente.
- El doble uso falla 100% en pruebas automatizadas.
- Ninguna accion critica confia solo en la UI.

Si G2 falla: congelar regalo y reventa; corregir primero compra, propiedad y acceso.

## 27-31 de julio: validacion inicial

Resultados objetivo:

- 5 a 10 sesiones con usuarios del segmento;
- 3 demos completas del flujo principal;
- 2 organizadores aceptan evaluar una demo con evento candidato;
- 1 organizador define una regla concreta;
- 5 usuarios completan una tarea de compra, presentacion o check-in;
- reporte de resultados, friccion y cambios priorizados.

Gate interno G3, en apoyo al Milestone 4:

- Al menos 60% completa la tarea primaria sin intervencion.
- Tiempo por tarea principal menor o igual a cinco minutos.
- Utilidad mediana igual o mayor a 4/5.
- Todos los segundos check-in son rechazados.

Si la muestra no alcanza el minimo: reportar el deficit como tal, ampliar reclutamiento durante la semana siguiente y no inventar validacion. Si check-in no muestra dolor, detener nuevas features y revisar el problema.

Los umbrales numericos de G3 proceden del feedback D09 y de decisiones internas. WayLearn sugiere probar con 5-10 usuarios, pero evalua el milestone por aprendizaje real y ajustes concretos, incluso si la hipotesis se refuta.

## 3-7 de agosto: circulacion controlada

Resultados:

- regalo transfiere el asset y actualiza el registro coherentemente;
- crear y cancelar listing;
- compra secundaria con markup, regalía y fee separados;
- interfaz de asistente completa para esos casos;
- cambios criticos surgidos de validacion incorporados.

Gate G4:

- E2E multiwallet demuestra propiedad sincronizada despues de regalo y reventa.
- No existe doble listing ni compra repetida.
- Pagos cuadran exactamente para valores limite.

Si reventa no aparece como dolor: mantenerla demostrable pero excluirla del mensaje principal y no expandirla.

## 10-14 de agosto: calidad operativa

Resultados:

- cobertura de fallos y estados de transaccion;
- experiencia movil usable para asistente y staff;
- accesibilidad basica de teclado, foco, contraste y mensajes;
- revision de seguridad sobre autoridades, aritmetica y secretos;
- ensayo de demo con wallets reales de devnet;
- candidato de shadow pilot evaluado solo si G2 y G3 pasaron.

Gate G5:

- Suite completa verde en CI.
- Flujo critico funciona en viewport movil y escritorio.
- No hay hallazgos criticos abiertos.

Si G5 falla: retirar shadow pilot y concentrarse en demo controlada reproducible.

## 17-21 de agosto: MVP funcional

Resultados:

- programa estable desplegado en devnet;
- web publica conectada al programa;
- README con configuracion reproducible;
- transacciones y comprobaciones de asset registradas;
- video de demostracion de dos minutos;
- documento de limitaciones conocido y actualizado.

Gate G6, Milestone 5:

- El flujo organizador-asistente-staff funciona de extremo a extremo.
- Un segundo acceso falla de manera determinista.
- El repo publico compila y CI esta verde.
- La demo no depende de credenciales presentes en el cliente.

Si G6 falla: reducir la demo a la vertical de acceso; nunca simular una integracion on-chain inexistente.

## 24-28 de agosto: narrativa y preparacion

Resultados:

- deck de 8 a 10 slides;
- pitch cronometrado de tres minutos;
- demo cronometrada de dos minutos;
- evidencia de usuarios, cambios y limitaciones visible;
- roadmap postprograma y solicitud concreta de pilotos;
- video fallback y entorno de demo precargado.

Gate G7, Milestone 6:

- Tres ensayos consecutivos dentro del tiempo.
- Una persona externa entiende problema, valor, evidencia y ask.
- Todas las cifras del deck tienen fuente.

## 31 de agosto: Demo Day

Resultado:

- presentar el problema, la evidencia real y el MVP;
- pedir acceso a 2-3 pilotos gestionados postprograma;
- no pedir un grant como si fuera parte garantizada del programa;
- registrar conversaciones y siguientes pasos concretos.

## Metricas semanales

| Metrica                            | Meta al 31-jul | Meta al 21-ago |        Meta al 31-ago |
| ---------------------------------- | -------------: | -------------: | --------------------: |
| Usuarios objetivo probados         |           5-10 |     5-10 o mas | Reportados con fuente |
| Demos completas                    |              3 |   5 acumuladas |          Demo estable |
| Organizadores con evento candidato |              2 |        2 o mas |      2-3 asks activos |
| Exito sin ayuda                    |          >=60% |          >=60% |             Reportado |
| Doble check-in rechazado           |           100% |           100% |          100% en demo |
| Hallazgos criticos abiertos        |      No aplica |              0 |                     0 |
| CI                                 |        Inicial |          Verde |                 Verde |

## Fuera del periodo

Mainnet, dinero real, fiat, custodia, auditoria externa, QR obligatorio, marketplace general, SDK, indexador propio y fondeo activo se planifican solamente despues de cumplir los gates de incubacion.
