# Fundamento de negocio

Estado: hipotesis para validacion, no traccion confirmada

Fecha de corte: 2026-07-15

## Resumen

Centlalia es un MVP de ticketing sobre Solana para eventos pequenos de comunidades Web3. Permite emitir un ticket verificable, controlar su circulacion y consumirlo una sola vez mediante una accion firmada por su titular.

La prioridad durante la incubacion es comprobar si el check-in confiable y el bloqueo de doble uso resuelven un dolor que justifique adoptar el producto. La reventa regulada se mantiene en la vertical tecnica para demostrar el ciclo de vida, pero no se asumira como dolor principal hasta obtener evidencia.

Centlalia no busca fondeo durante la construccion inicial como sustituto de validacion. Primero formara el producto, demostrara uso y conseguira candidatos de piloto. Las oportunidades de grants, inversion o aceleracion se evaluaran despues del programa.

## Segmento inicial

Beachhead:

- comunidades Web3 y Solana en LATAM;
- meetups Solana;
- hackathons y workshops pequenos;
- eventos no criticos cuyos asistentes ya conocen wallets;
- organizadores accesibles al equipo mediante WayLearn y comunidades del ecosistema.

No se apunta inicialmente a conciertos masivos, venues con operacion critica, publico sin wallet, boleteras generalistas ni eventos que requieran pagos fiat.

## Buyer y actores

### Buyer inicial

El buyer es el organizador o responsable operativo de una comunidad que decide el proceso de registro y acceso, puede autorizar staff y puede aceptar una demo o piloto gestionado.

El ecosistema Solana, WayLearn o un potencial grant no son el cliente. Pueden facilitar acceso, aprendizaje o fondeo futuro, pero no sustituyen a quien experimenta el problema y toma la decision de uso.

### Actores del flujo

- **Organizador:** crea el evento, configura tiers y reglas, publica y autoriza staff.
- **Asistente:** compra, conserva, presenta, regala o lista un ticket permitido.
- **Comprador secundario:** adquiere un ticket bajo las reglas del evento.
- **Staff:** verifica una presentacion firmada y consume el acceso una vez.

## Trabajo a resolver

Cuando un organizador opera un evento pequeno, necesita saber que la persona en puerta controla un ticket vigente y que ese ticket no volvera a utilizarse, sin depender de capturas de pantalla, conciliacion manual o soporte improvisado.

Problemas a validar, no hechos confirmados:

- tickets o capturas duplicadas;
- confusion sobre cual titular debe ser aceptado;
- check-in lento o inconsistente entre miembros de staff;
- transferencia informal sin certeza de aceptacion;
- reventa fuera de reglas del organizador;
- falta de una fuente verificable de estado.

## Propuesta de valor

Para comunidades Web3 que operan eventos pequenos, Centlalia ofrece un flujo gestionado de tickets verificables en Solana. El titular demuestra control de su wallet, staff autorizado consume el acceso exactamente una vez y el organizador conserva reglas sobre transferencia y reventa.

La promesa no es "blockchain ticketing". La promesa que debe probarse es:

> El organizador puede verificar quien tiene derecho de acceso y bloquear doble uso, mientras el ticket circula solo bajo reglas conocidas.

## Por que Solana

Solana solo se justifica si los usuarios perciben valor en al menos una de estas capacidades:

- propiedad del ticket verificable fuera de una base de datos privada;
- firma del titular como prueba de presentacion;
- reglas y estados ejecutados de forma consistente por el programa;
- liquidacion programable de una reventa permitida;
- costo adecuado para emision de activos a escala.

La validacion preguntara si estas ventajas superan la friccion de wallet. Si una lista o QR tradicional resuelve el problema mejor para el segmento, el equipo debera reducir o replantear la tesis antes de agregar funcionalidades.

## Producto minimo

La vertical de incubacion incluye:

1. Crear evento, tiers y reglas.
2. Publicar el evento.
3. Comprar un ticket de prueba en devnet.
4. Transferirlo o revenderlo bajo reglas.
5. Autorizar y revocar staff.
6. Crear una presentacion firmada de acceso.
7. Consumir el check-in una vez y rechazar el segundo intento.

El producto no incluye pagos reales, fiat, QR obligatorio, marketplace general, SDK publico, mainnet ni operacion sin respaldo.

## Piloto gestionado

La oferta inicial no sera self-service. El equipo acompañara al organizador para:

- traducir sus reglas al evento de prueba;
- preparar wallets y SOL de devnet;
- ejecutar una demo con participantes voluntarios;
- observar tareas y errores;
- mantener el proceso normal del evento como respaldo;
- producir un reporte de aprendizaje.

Niveles de prueba:

| Nivel                | Uso                                      | Riesgo aceptado                                       |
| -------------------- | ---------------------------------------- | ----------------------------------------------------- |
| Demo controlada      | Sesion preparada fuera de operacion real | Solo activos y fondos de devnet                       |
| Simulacion operativa | Staff y asistentes representan la puerta | No decide acceso real                                 |
| Shadow pilot         | Corre en paralelo durante un evento      | Metodo convencional sigue siendo la fuente operativa  |
| Mainnet productiva   | Venta y acceso reales                    | Fuera de la incubacion y sujeto a seguridad adicional |

## Modelo de sostenibilidad

Durante la validacion:

- fee de plataforma: 0%;
- servicio: gestionado por el equipo;
- objetivo: medir valor, costo operativo y disposicion de uso, no optimizar precio.

Hipotesis posteriores:

- fee fijo por evento o piloto gestionado si el valor es operacional;
- plan recurrente para comunidades con eventos frecuentes;
- fee por venta primaria o reventa solo si esos flujos demuestran ser el valor principal.

No se elegira un modelo definitivo sin evidencia de pilotos y disposicion de pago.

## Gates internos de validacion

Estas metas medibles derivan del feedback D09 y de decisiones del equipo. No son criterios oficiales de aceptacion de WayLearn; el programa evalua aprendizaje real y ajustes concretos derivados de las pruebas.

La hipotesis avanza si, antes del 31 de julio:

- 2 organizadores aceptan evaluar una demo con evento candidato;
- se realizan 3 demos completas en devnet;
- al menos 1 organizador define una regla concreta;
- al menos 5 usuarios objetivo completan una tarea;
- al menos 60% completa su tarea principal sin intervencion;
- el staff bloquea tecnicamente 100% de los segundos intentos;
- la utilidad mediana declarada es al menos 4/5.

Estas son metas, no resultados actuales.

## Riesgos de negocio

- La friccion de wallet puede superar el beneficio para eventos pequenos.
- El problema puede resolverse suficientemente con QR o lista tradicional.
- La reventa puede no ser relevante para el beachhead.
- Un piloto gestionado puede requerir demasiado soporte para ser rentable.
- La infraestructura Solana puede introducir fallas operativas que el buyer no acepta.
- La comunidad puede mostrar interes tecnico sin intencion real de uso.

## Secuencia de formacion y fondeo

1. Hasta el 21 de agosto: validar problema y entregar MVP funcional en devnet.
2. Hasta el 31 de agosto: demostrar aprendizaje, flujo y candidatos de piloto.
3. Despues del programa: ejecutar pilotos gestionados solo con acuerdos reales, gates de seguridad y acceso convencional de respaldo; entonces estimar costos y disposicion de pago.
4. Solo con evidencia suficiente: evaluar grants, programas, alianzas o inversion.

La politica completa esta en `FONDEO-POSTPROGRAMA.md`.
