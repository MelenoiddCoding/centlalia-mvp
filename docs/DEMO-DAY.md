# Plan de Demo Day

Fecha objetivo: 2026-08-31

Formato: pitch de 3 minutos + demo de 2 minutos

Ask principal: acceso a pilotos gestionados postprograma

## Objetivo de la presentacion

Que un organizador, mentor o aliado entienda en cinco minutos:

1. que problema operativo concreto investiga Centlalia;
2. por que firma, reglas y estado en Solana pueden aportar valor;
3. que construyo y que funciona realmente;
4. que aprendio de usuarios;
5. cual es el siguiente paso verificable.

El objetivo no es demostrar todas las pantallas ni pedir un grant generico.

## Mensaje central

> Centlalia ayuda a comunidades Web3 a operar tickets que pueden circular bajo reglas y consumirse una sola vez. El titular presenta su acceso con una firma, staff autorizado lo valida y Solana bloquea el doble uso.

Esta frase debe ajustarse si la validacion contradice la hipotesis. No sustituye resultados.

## Pitch de 3 minutos

### 0:00-0:25 - Problema

- Abrir con un incidente o patron real obtenido en entrevistas.
- Explicar el costo operacional: incertidumbre de titular, capturas, transferencias o doble uso.
- No usar una estadistica de mercado sin fuente.

Marcador pendiente:

> En nuestras pruebas con [N] participantes, [hallazgo real y cuantificado].

No completar hasta cerrar el reporte del 31 de julio.

### 0:25-0:50 - Usuario y alternativa actual

- Beachhead: organizadores de comunidades Web3 y eventos Solana pequenos.
- Proceso actual observado: QR, lista o herramienta del organizador.
- Mostrar por que el problema no es simplemente vender una entrada.

### 0:50-1:20 - Solucion

- Ticket verificable y propiedad coherente.
- Reglas de transferencia/reventa definidas por evento.
- Presentacion firmada y consumo exactamente una vez.
- Piloto gestionado, no plataforma masiva.

### 1:20-1:45 - Por que Solana

- La wallet demuestra control del titular.
- El programa aplica reglas y estado sin depender solo de la UI.
- El asset puede transferirse con propiedad verificable.
- Devnet se usa para aprender, no como produccion.

### 1:45-2:20 - Evidencia

Presentar solo cifras verificadas:

- participantes y roles;
- exito sin ayuda y tiempo por tarea;
- intentos duplicados rechazados;
- reglas solicitadas;
- organizadores con evento candidato;
- cambios implementados despues de observar usuarios.

Si no se logra una meta, explicar el resultado y el cambio de producto. Una limitacion honesta vale mas que una cifra inventada.

### 2:20-2:40 - Modelo y siguiente etapa

- Pilotos gestionados para aprender y medir costo.
- Posible fee por evento o plan recurrente despues de validar.
- Mainnet, pagos y fondeo quedan postprograma.

### 2:40-3:00 - Ask

> Buscamos 2 o 3 comunidades Web3 con un evento pequeno en los proximos 90 dias para ejecutar un piloto gestionado en paralelo a su acceso normal. Tambien buscamos mentores tecnicos para revisar el camino de devnet a una version segura de mainnet.

No afirmar que WayLearn o Solana ofrecen un grant actual.

## Deck de 8-10 slides

| Slide | Contenido                        | Evidencia necesaria                            |
| ----- | -------------------------------- | ---------------------------------------------- |
| 1     | Centlalia y promesa de una linea | Mensaje validado                               |
| 2     | Problema y proceso actual        | Cita corta anonimizada o patron de sesiones    |
| 3     | Segmento y buyer                 | Perfiles realmente entrevistados               |
| 4     | Flujo de solucion                | Diagrama organizador-asistente-staff           |
| 5     | Por que Solana                   | Firma, reglas, propiedad y estado              |
| 6     | Demo/MVP                         | URL, devnet y arquitectura breve               |
| 7     | Validacion                       | KPIs, aprendizajes y cambios                   |
| 8     | Modelo inicial                   | Piloto gestionado y supuestos pendientes       |
| 9     | Roadmap postprograma             | Pilotos, seguridad, mainnet y fondeo posterior |
| 10    | Equipo y ask                     | Capacidades, 2-3 pilotos y apoyo tecnico       |

Se pueden combinar slides 9 y 10 para mantener nueve. Evitar una slide de TAM generico sin fuente o una comparativa competitiva que no se conecte con el beachhead.

## Demo de 2 minutos

### Preparacion

- evento ya creado y publicado;
- tier con supply disponible;
- wallets de organizador, asistente y staff fondeadas solo en devnet;
- dos pestañas o dispositivos listos;
- una entrada limpia y otra ya usada para mostrar estados;
- RPC/DAS verificados;
- explorer y evidencia de asset en pestañas de respaldo;
- video fallback de exactamente dos minutos.

### 0:00-0:25 - Organizador

Mostrar evento publicado, regla de acceso y staff autorizado. No crear todos los datos en vivo si consume el tiempo.

### 0:25-0:55 - Asistente

Comprar o mostrar el ticket adquirido y seleccionar "Presentar para acceso". Confirmar que la wallet firma una intencion corta.

### 0:55-1:25 - Staff

Abrir la intencion pendiente, verificar el contexto y consumir el check-in. Mostrar confirmacion y estado `Used`.

### 1:25-1:45 - Doble uso

Intentar consumir otra vez. Mostrar el rechazo determinista y explicarlo en una frase.

### 1:45-2:00 - Verificabilidad

Mostrar la transaccion o estado devnet y cerrar con el valor: el titular probo control y el acceso ya no puede repetirse.

Regalo y reventa se muestran solo si caben despues de ensayos consistentes; nunca desplazan el check-in.

## Plan de contingencia

Orden de fallback:

1. demo en vivo completa;
2. entorno precargado con transacciones ya confirmadas;
3. video local de dos minutos;
4. capturas con firmas de transaccion y narrativa verbal.

Si RPC, DAS o wallet fallan, cambiar al fallback en menos de diez segundos. No depurar en escenario. La presentacion debe aclarar que se esta mostrando una ejecucion grabada si aplica.

## Evidencia visual

Preparar antes del 28 de agosto:

- captura del evento y roles;
- estado de intencion pendiente y usada;
- error de segundo check-in;
- firma de transaccion devnet;
- propiedad del asset antes/despues si se muestra transferencia;
- grafica simple de resultados con denominadores;
- un cambio de UI o programa originado en prueba de usuario.

Redactar direcciones, nombres y datos personales que no sean necesarios.

## Ensayos

- Ensayo 1: narrativa sin demo para detectar vacios.
- Ensayo 2: flujo completo con cronometro.
- Ensayo 3: interrupcion de RPC y cambio a fallback.
- Ensayo 4: preguntas adversariales sobre blockchain, wallet y QR.
- Ensayo final: tres ejecuciones consecutivas dentro de cinco minutos totales.

## Preguntas esperadas

### ¿Por que no usar un QR tradicional?

Un QR puede ser suficiente para muchos eventos. Centlalia prueba si propiedad verificable, firma del titular y reglas de circulacion agregan valor en comunidades wallet-first. La evidencia de usuarios determinara si esa ventaja compensa la complejidad.

### ¿Esta listo para un evento real?

No como sistema principal. El MVP esta en devnet y solo admite demos o shadow pilots con el proceso normal como respaldo.

### ¿Por que blockchain?

Porque el titular firma, la propiedad puede ser verificable y las reglas/consumo se ejecutan en un programa compartido. Si usuarios no valoran esas capacidades, el producto debe replantearse.

### ¿Como ganara dinero?

Primero con la hipotesis de piloto gestionado y despues fee por evento o plan recurrente. Pricing y disposicion de pago siguen pendientes de evidencia.

### ¿Tienen fondeo?

No existe fondeo comprometido. El equipo prioriza formar y validar el proyecto; evaluara oportunidades despues del programa.

### ¿Que impide el doble uso?

Una intencion firmada por el titular es consumida por staff autorizado; el programa cambia el ticket a usado y rechaza cualquier repeticion.

## Checklist final

- Todas las cifras tienen fuente y denominador.
- El deck distingue metas de resultados.
- La URL, programa y wallets corresponden a devnet.
- No hay secretos visibles en consola, URL, capturas o explorer.
- La demo funciona en movil y escritorio.
- El fallback esta disponible sin red.
- El ask contiene numero, perfil y horizonte de eventos.
- El equipo puede explicar riesgos de wallet, DAS y mainnet.
- El pitch no presenta un grant como actual o garantizado.
- Los tiempos cumplen 3 minutos de pitch y 2 de demo.

Referencia: [Milestones de WayLearn](https://waylearn.gitbook.io/solana-latam-labs-program-waylearn/milestones).
