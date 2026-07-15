# Protocolo de validacion inicial

Ventana objetivo: 2026-07-20 a 2026-07-31

Muestra objetivo: 10-20 invitaciones, 5-10 sesiones completadas

Entorno: demo controlada en Solana devnet

## Objetivo

Determinar si el flujo minimo de ticket verificable, presentacion firmada y check-in de un solo uso resuelve un dolor relevante para organizadores y staff de eventos Web3 pequenos, y medir si la friccion de wallet permite que asistentes completen el flujo.

La prueba no busca validar una plataforma completa, pricing definitivo, pagos reales ni mainnet.

## Hipotesis

| ID  | Hipotesis                                      | Señal que la apoya                                             | Señal que la debilita                                     |
| --- | ---------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| H1  | Organizador necesita mas que QR o lista manual | Describe incidentes y acepta probar un evento candidato        | Su proceso actual resuelve el problema y no acepta probar |
| H2  | Check-in/doble uso es el dolor inicial         | Lo prioriza sobre reventa y pide reglas de acceso              | No recuerda incidentes ni percibe valor operacional       |
| H3  | Wallet no bloquea el flujo                     | >=60% completa sin ayuda y en <=5 minutos                      | Mas de 40% requiere intervencion o abandona               |
| H4  | Staff puede validar sin scanner dedicado       | Completa consumo y entiende estados                            | Confunde titular, intencion o estado usado                |
| H5  | Solana agrega valor comprensible               | Identifica propiedad, firma o reglas verificables como ventaja | Prefiere una base privada y no ve beneficio compensatorio |
| H6  | Existe intencion de piloto                     | Dos organizadores aceptan evaluar evento candidato             | Interes general sin fecha, evento ni siguiente paso       |

La reventa se observa como hipotesis secundaria: se registra si el usuario la prioriza espontaneamente o define una regla concreta.

## Participantes

### Inclusion

- organizador, responsable operativo, staff o asistente de una comunidad Web3/Solana;
- experiencia reciente en meetups, hackathons o workshops pequenos;
- capacidad de usar una wallet de prueba o disposicion a aprender;
- para organizadores, influencia real sobre un evento candidato.

### Exclusion

- personas que solo conocen el proyecto por el equipo y no representan ningun rol;
- participantes menores sin consentimiento aplicable;
- sesiones en las que se solicite usar fondos, tickets o credenciales reales;
- miembros del equipo como sustitutos de usuarios externos.

### Composicion recomendada

- 2-3 organizadores o leads de comunidad;
- 1-2 personas de staff o acceso;
- 3-5 asistentes con familiaridad variable de wallet.

Una persona puede representar dos roles si realmente los ejerce; debe quedar registrado.

## Reclutamiento

Canales prioritarios:

- comunidad y canales de WayLearn;
- meetups y comunidades Solana LATAM;
- organizadores de hackathons y workshops accesibles al equipo;
- referencias directas de mentores o participantes.

### Mensaje de invitacion

> Estamos probando Centlalia, un flujo experimental de tickets y check-in en Solana devnet para eventos Web3 pequenos. Buscamos organizadores, staff y asistentes para una sesion remota de 30-40 minutos. No usaremos fondos, tickets ni acceso reales. Queremos observar que funciona, que confunde y si valdria la pena probarlo en paralelo en un evento futuro. Tu participacion es voluntaria y registraremos resultados de forma anonimizada.

El mensaje no debe prometer prevenir fraude, ahorrar costos ni resolver el problema antes de medirlo.

## Consentimiento y privacidad

Antes de iniciar, leer y confirmar:

> Esta es una prueba de un prototipo en devnet. No se usara dinero real ni controlara acceso real. Observaremos la pantalla, tiempos, errores y comentarios. El reporte usara un identificador anonimo y no publicara tu wallet, nombre, voz o grabacion sin permiso separado. Puedes detenerte o retirar tus respuestas en cualquier momento. ¿Aceptas participar?

Registrar `si/no`, fecha y modalidad. Si la respuesta es no, terminar sin recolectar datos.

Politica de datos:

- asignar identificadores como `P-001`;
- no guardar seed phrases, private keys, documentos, correo personal ni balances;
- truncar direcciones de wallet en capturas y reportes publicos;
- grabar solo con consentimiento separado;
- separar datos de contacto de notas de sesion;
- limitar acceso al equipo y eliminar datos de contacto cuando termine el seguimiento;
- usar una wallet exclusiva de devnet, nunca la wallet principal del participante.

## Preparacion de la sesion

Checklist:

- programa y web de prueba disponibles;
- wallets y SOL de devnet preparados;
- evento de respaldo listo, sin estado usado;
- rol y tarea asignados;
- cronometro y hoja de observacion;
- transacciones de demostracion probadas ese dia;
- video fallback disponible;
- recordatorio de que no se prueba acceso real.

El facilitador no debe explicar la interfaz durante la primera tentativa. Solo puede responder preguntas de seguridad y detener una accion riesgosa.

## Guion de sesion

Duracion: 30-40 minutos.

### 1. Contexto, 3 minutos

- Explicar que es un prototipo de devnet.
- Obtener consentimiento.
- Preguntar rol y ultimo evento operado o asistido.

### 2. Entrevista de problema, 7 minutos

Preguntas no dirigidas:

1. Cuentame como gestionaron registro y acceso en tu ultimo evento.
2. ¿Que parte genero mas trabajo o incertidumbre?
3. ¿Que ocurre cuando alguien transfiere su entrada o llega con una captura?
4. ¿Han tenido duplicados, confusion de titular, reventa o filas? ¿Cuando fue la ultima vez?
5. ¿Como decide staff si aceptar o rechazar?
6. ¿Que solucion usan y que no cambiarias de ella?

No mencionar las funcionalidades de Centlalia antes de obtener estas respuestas.

### 3. Tarea por rol, 10-15 minutos

#### Organizador

Prompt:

> Prepara un evento de prueba, crea un tipo de entrada, publicalo y autoriza a una persona de staff. Configura las reglas como lo harias para un meetup pequeno.

Observar descubrimiento de acciones, comprension de ventanas, reglas solicitadas y errores.

#### Asistente

Prompt:

> Consigue una entrada de prueba y presentala para entrar. Dime cuando creas que staff ya podria validarla.

Observar conexion de wallet, firma, entendimiento de devnet, tiempo y necesidad de ayuda.

#### Staff

Prompt:

> Valida a la persona que esta presentando su entrada. Luego intenta validar la misma entrada otra vez y explica el resultado.

Observar si distingue pendiente, expirada, usada y rechazada.

#### Circulacion secundaria, solo si esta disponible

Prompt:

> Transfiere o lista esta entrada respetando las reglas del evento. El nuevo titular debe poder presentarla.

Esta tarea no reemplaza la tarea primaria de acceso.

### 4. Reflexion, 7 minutos

1. ¿Que esperabas que ocurriera y no ocurrio?
2. ¿Que fue mas confuso?
3. ¿En que fue mejor o peor que tu proceso actual?
4. Del 1 al 5, ¿que tan util seria para tu proximo evento?
5. ¿Que te impediria usarlo?
6. ¿Que regla de acceso, transferencia o reventa necesitarias?
7. Si te ayudamos a configurarlo y corre en paralelo, ¿aceptarias evaluarlo en un evento candidato? ¿Cual y cuando?
8. Si funcionara de forma estable, ¿como esperarias pagar: por evento, plan recurrente, fee por ticket o no pagarias?

La pregunta de pago explora expectativas; no confirma disposicion de pago sin un compromiso posterior.

### 5. Cierre, 3 minutos

- Aclarar que no existe acceso ni valor real.
- Pedir permiso para seguimiento.
- Registrar el siguiente paso concreto, si existe.

## Metricas

### Por tarea

- **Exito sin ayuda:** completada sin instrucciones del facilitador.
- **Exito con ayuda:** completada despues de una o mas intervenciones.
- **Fallo:** no completada o abandonada.
- **Tiempo:** desde leer el prompt hasta estado confirmado.
- **Errores:** transaccion rechazada, error de producto o interpretacion incorrecta.
- **Intervenciones:** cantidad y contenido de ayuda.

### Agregadas

```text
tasa_exito_sin_ayuda = exitos_sin_ayuda / tareas_iniciadas
tasa_completitud = tareas_completadas / tareas_iniciadas
tasa_wallet_bloqueante = participantes_bloqueados_por_wallet / participantes_que_usaron_wallet
tasa_intencion_piloto = organizadores_con_evento_candidato / organizadores_entrevistados
```

Umbrales internos de decision:

Los siguientes umbrales combinan el feedback D09 y decisiones del equipo. Son metas de gestion, no criterios oficiales de aceptacion de WayLearn; el milestone se sustenta en aprendizaje real y cambios concretos.

- > =60% completa la tarea primaria sin ayuda;
- > =50% completa en menos de cinco minutos;
- utilidad mediana >=4/5;
- 100% de segundos check-in rechazados por el sistema;
- 5-10 participantes, 3 demos y 2 organizadores con evento candidato;
- 5-10 aprendizajes accionables, de acuerdo con la guia de testing de WayLearn.

## Formato por sesion

```markdown
# Sesion P-\_\_\_

- Fecha/hora:
- Facilitador:
- Rol real:
- Tipo de evento y frecuencia:
- Familiaridad con wallet: ninguna / basica / frecuente
- Consentimiento: si / no
- Grabacion autorizada: si / no / no aplica
- Build o commit probado:

## Problema actual

- Proceso actual:
- Ultimo incidente concreto:
- Frecuencia/severidad:
- Alternativa usada:

## Tarea

- Rol de prueba:
- Resultado: sin ayuda / con ayuda / fallo
- Tiempo:
- Intervenciones:
- Errores:
- Transaction signatures anonimizadas o referencia interna:

## Aprendizaje

- Dolor prioritario:
- Utilidad 1-5:
- Regla solicitada:
- Valor percibido de Solana:
- Objecion principal:
- Evento candidato y fecha, si aplica:
- Expectativa de pago, sin inferir compromiso:
- Cambio recomendado:
```

## Tabla agregada

| ID       | Rol | Tarea | Sin ayuda | Tiempo | Utilidad | Dolor principal | Regla solicitada | Evento candidato | Cambio |
| -------- | --- | ----- | --------- | ------ | -------- | --------------- | ---------------- | ---------------- | ------ |
| P-\_\_\_ |     |       |           |        |          |                 |                  |                  |        |

La tabla inicia vacia. No agregar filas de ejemplo que puedan confundirse con resultados.

## Priorizacion de hallazgos

Clasificar cada hallazgo:

- **P0 Seguridad:** permite acceso incorrecto, doble uso, perdida o secreto expuesto.
- **P1 Bloqueo de tarea:** impide completar el flujo principal.
- **P2 Friccion:** completa con ayuda o demora excesiva.
- **P3 Preferencia:** mejora deseable que no bloquea la hipotesis.

Cada cambio debe enlazar el participante anonimo, la observacion y la prueba de regresion. No construir una feature por una sola opinion si no resuelve P0/P1.

## Gates de producto

- Continuar la vertical si dos organizadores aceptan un evento candidato y se alcanza el umbral de tarea.
- Mantener reventa secundaria si check-in domina el ranking de dolor.
- Llevar reventa al mensaje principal solo si varios organizadores la priorizan y definen reglas.
- Si mas de 40% queda bloqueado por wallet, probar onboarding guiado y servicio gestionado; no agregar custodia o fiat durante el MVP.
- Si el proceso tradicional resuelve el dolor y no existe intencion de piloto, reducir o replantear el producto antes de expandir alcance.
- Permitir shadow pilot solo despues de pasar pruebas tecnicas y con respaldo de acceso normal.

## Reporte para WayLearn

El entregable del 31 de julio debe incluir:

- hipotesis y segmento;
- numero y perfil anonimo de participantes;
- tarea probada;
- resultados y KPIs;
- fricciones y feedback recurrente;
- evidencia de que blockchain agrega o no agrega valor;
- cambios ya realizados y siguientes cambios;
- limitaciones de la muestra;
- estado real de solicitudes de piloto.

Referencia: [Testing de MVP de WayLearn](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/recursos-de-producto-y-negocio/recursos-de-apoyo/testing-de-mvp).
