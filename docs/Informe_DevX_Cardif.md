# Evolución del entorno DevX Studio y hoja de ruta para una adopción estructurada de la IA en el desarrollo

**De un IDE en el navegador a una plataforma de ingeniería completa**

| | |
|---|---|
| **Ámbito** | Plataforma de desarrollo Cardif — entorno DevX Studio |
| **Audiencia** | Dirección de Tecnología y equipos de desarrollo |
| **Fecha** | 16 de septiembre de 2026 |
| **Estado** | Para revisión y decisión |

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Punto de partida: las limitaciones de la versión anterior](#2-punto-de-partida-las-limitaciones-de-la-versión-anterior)
3. [Capacidades que incorpora la nueva versión](#3-capacidades-que-incorpora-la-nueva-versión)
4. [Comparativa entre versiones](#4-comparativa-entre-versiones)
5. [Beneficios esperados](#5-beneficios-esperados)
6. [Del uso ad hoc de la IA a un marco de trabajo propio](#6-del-uso-ad-hoc-de-la-ia-a-un-marco-de-trabajo-propio)
7. [Decisiones que la organización debe tomar](#7-decisiones-que-la-organización-debe-tomar)
8. [Hoja de ruta propuesta](#8-hoja-de-ruta-propuesta)
9. [Riesgos y consideraciones](#9-riesgos-y-consideraciones)
10. [Conclusión](#10-conclusión)

---

## 1. Resumen ejecutivo

La nueva versión de DevX Studio deja de ser un editor de código accesible por navegador y pasa a comportarse como un entorno de ingeniería completo. El cambio no es cosmético: donde antes existía únicamente la interfaz de Visual Studio Code, hoy hay un escritorio remoto con un catálogo de aplicaciones, un motor de contenedores operativo y autenticado contra el registro corporativo, capacidad de instalar herramientas adicionales —entre ellas clientes de base de datos— y un navegador Chromium integrado para el desarrollo y la depuración de aplicaciones de frontend.

El efecto acumulado de estas capacidades es que el ciclo completo de desarrollo —escribir, construir, ejecutar dependencias, depurar, verificar y publicar— puede ocurrir íntegramente dentro del entorno, sin recurrir a la estación de trabajo local ni a permisos excepcionales. Esto reduce la fricción de arranque de un desarrollador, homogeneiza las condiciones de ejecución entre equipos y elimina una categoría entera de incidencias asociadas a la divergencia entre el equipo del desarrollador y los entornos superiores.

Adicionalmente, el entorno ofrece condiciones sensiblemente mejores para operar agentes de codificación asistida como OpenCode, que requieren un sistema de archivos persistente, terminal, capacidad de ejecutar pruebas y acceso a las herramientas del proyecto para ser realmente útiles.

Ahora bien, este informe sostiene una segunda tesis, de mayor calado: **disponer de un harness de IA no constituye por sí mismo una estrategia de adopción de inteligencia artificial**. Un agente sin contexto institucional produce código plausible pero desalineado con las convenciones, la arquitectura y el proveedor cloud de Cardif. El valor sostenible aparece cuando ese contexto se codifica de forma explícita, versionada y reutilizable, es decir, cuando se construye un marco de trabajo propio. Para avanzar en esa dirección, la organización debe resolver tres decisiones concretas, que se analizan en la sección 7: la estrategia de *skills* (propias frente a públicas), su ubicación y gobierno en repositorio, y la adopción o no de un enfoque de desarrollo basado en especificaciones con OpenSpec.

> *Nota metodológica: las capacidades descritas en la sección 3 corresponden a lo observado directamente en el entorno. Las recomendaciones de las secciones 7 y 8 son propuestas abiertas a discusión, no decisiones tomadas.*

---

## 2. Punto de partida: las limitaciones de la versión anterior

La versión previa de DevX exponía exclusivamente la interfaz web de Visual Studio Code. Como editor remoto cumplía su función, pero imponía un techo claro a lo que un desarrollador podía hacer sin salir de la plataforma. Las restricciones observadas con mayor frecuencia eran las siguientes:

- Ausencia de un entorno de ejecución de contenedores utilizable, lo que obligaba a levantar dependencias en la máquina local o a depender de entornos compartidos para cualquier prueba de integración.
- Imposibilidad de instalar o ejecutar herramientas auxiliares de escritorio, en particular clientes gráficos de base de datos, forzando el uso de consolas o de instalaciones locales fuera del control de la plataforma.
- Falta de un navegador dentro del entorno, lo que rompía el ciclo de desarrollo de frontend: la aplicación se construía en el entorno remoto pero debía visualizarse y depurarse desde el equipo del desarrollador, con los problemas de exposición de puertos y latencia que ello implica.
- Un único punto de interacción —el editor— sin gestión de ventanas, sin múltiples terminales de forma cómoda y sin utilidades de sistema para inspeccionar procesos, archivos o consumo de recursos.
- Un soporte limitado para agentes de codificación, que dependen de poder ejecutar comandos, compilar, lanzar pruebas y leer la salida para cerrar el ciclo de verificación.

En conjunto, la versión anterior resolvía la edición de código pero delegaba en el puesto local todo lo demás. El resultado era un modelo híbrido con configuración duplicada, dependiente de permisos en el equipo del desarrollador y difícil de estandarizar.

---

## 3. Capacidades que incorpora la nueva versión

### 3.1. Escritorio remoto con catálogo de aplicaciones

La nueva versión presenta un lanzador organizado por categorías —utilidades, desarrollo, herramientas de plataforma y navegador— sobre un escritorio completo. Esto convierte el entorno en un puesto de trabajo y no en una ventana de edición: hay explorador de archivos, editor de texto, gestor de compresión, visor de procesos y terminal con soporte de múltiples paneles y pestañas.

El beneficio inmediato es operativo. Un desarrollador puede inspeccionar el sistema de archivos, revisar el consumo de recursos de un proceso que se ha quedado colgado, descomprimir un artefacto recibido o abrir tres terminales en paralelo —una para la aplicación, otra para las pruebas y otra para el agente de IA— sin abandonar la sesión. Además, el catálogo es extensible mediante la tienda interna del entorno, lo que permite incorporar herramientas adicionales de forma controlada y trazable, en lugar de mediante instalaciones ad hoc en equipos personales.

### 3.2. Contenedores operativos y autenticados contra el registro corporativo

Es probablemente la incorporación de mayor impacto técnico. El entorno dispone de un motor de contenedores plenamente funcional, con sus extensiones de construcción y de orquestación local, y convive con un cliente propio de la plataforma que aporta la integración corporativa: apunta por defecto al registro interno de artefactos y se presenta ya autenticado, sin requerir que el desarrollador gestione credenciales.

Las consecuencias prácticas son varias. En primer lugar, es posible descargar imágenes públicas del catálogo de Docker Hub a través del registro interno, que actúa como proxy y como caché: el desarrollador obtiene la imagen que necesita y la organización conserva el control sobre qué entra, con la trazabilidad y el escaneo de vulnerabilidades que exige la función de seguridad. En segundo lugar, se pueden levantar dependencias de forma local y efímera —bases de datos, colas, simuladores de servicios externos— para pruebas de integración realistas. En tercer lugar, el propio artefacto del microservicio puede construirse y ejecutarse en el entorno con el mismo fichero de construcción que usará la cadena de integración continua, lo que acorta drásticamente el bucle de detección de errores de empaquetado.

> **Nota operativa:** el cliente corporativo y el motor estándar mantienen almacenes de imágenes independientes. Una imagen construida con uno no es visible para el otro. Conviene fijar un criterio único por proyecto para evitar construcciones duplicadas y diagnósticos confusos.

### 3.3. Clientes de base de datos y herramientas de diagnóstico

La posibilidad de instalar clientes de base de datos dentro del entorno resuelve una carencia recurrente. Hasta ahora, la inspección de datos durante el desarrollo o el análisis de una incidencia obligaba a instalar un cliente en el equipo personal y a abrir conectividad desde él, con el consiguiente coste de gestión de accesos y el riesgo de que información sensible acabe replicada fuera de la plataforma.

Al alojar el cliente en el entorno, la conexión se establece desde un punto controlado, sujeto a la misma segmentación de red y a las mismas políticas de auditoría que el resto de la plataforma. El desarrollador gana además inmediatez: puede validar el estado de una tabla, ejecutar una consulta de comprobación o preparar un juego de datos de prueba sin cambiar de contexto ni de máquina.

### 3.4. Chromium integrado para desarrollo y depuración de frontend

La disponibilidad de un navegador dentro del entorno cierra el ciclo de desarrollo de las aplicaciones de interfaz. El servidor de desarrollo se ejecuta en el mismo entorno donde se abre el navegador, de modo que la aplicación se sirve por localhost y no requiere exponer puertos hacia el exterior ni configurar túneles para una simple comprobación visual.

Más relevante aún es el acceso a las herramientas de desarrollo del navegador: inspección del árbol de elementos, consola de errores, análisis de peticiones de red, puntos de interrupción en el código de cliente y medición de rendimiento. Estas capacidades eran, en la práctica, inaccesibles desde un entorno que sólo ofrecía un editor. Con ellas, el entorno pasa a soportar el desarrollo de frontend en igualdad de condiciones con el de backend, lo que importa especialmente en una organización con aplicaciones de cara al cliente y al asesor.

### 3.5. Conectividad y utilidades de plataforma

El entorno incorpora un conjunto de herramientas que resuelven la comunicación entre el espacio de trabajo remoto y el resto del ecosistema: redirección de puertos, publicación de un servicio local mediante una dirección accesible, transferencia de archivos en ambos sentidos y un monitor de consumo de recursos.

Estas utilidades tienen un valor que va más allá de la comodidad. La redirección de puertos y el proxy local permiten compartir una versión en curso con un analista funcional o con un compañero para una revisión rápida, sin necesidad de desplegar en un entorno compartido. La transferencia de archivos ordena el intercambio de artefactos, ficheros de datos de prueba o volcados de diagnóstico. El monitor de recursos, por su parte, ofrece evidencia objetiva cuando un entorno se percibe lento, lo que facilita dimensionar correctamente los recursos asignados.

### 3.6. Un entorno mucho más apto para agentes de codificación

Los agentes de codificación asistida no aportan valor real cuando se limitan a sugerir texto. Su utilidad aparece cuando pueden cerrar un ciclo completo: leer el repositorio, proponer un cambio, compilarlo, ejecutar las pruebas, leer el error y corregir. Ese ciclo exige exactamente lo que la nueva versión proporciona: un sistema de archivos persistente con el proyecto completo, terminal, cadena de construcción disponible, posibilidad de levantar dependencias en contenedores y un navegador para verificar el resultado en el caso de interfaces.

En un entorno que sólo ofrecía el editor, el agente operaba prácticamente a ciegas y su aportación quedaba reducida a la generación de fragmentos. En el entorno actual puede participar en tareas verificables de principio a fin. Este salto es el que hace que la conversación sobre la adopción de IA deje de ser una cuestión de herramienta y pase a ser una cuestión de método, que es el objeto de las secciones siguientes.

---

## 4. Comparativa entre versiones

| Dimensión | Versión anterior (sólo IDE web) | Versión actual (entorno completo) |
|---|---|---|
| **Interfaz** | Únicamente Visual Studio Code en el navegador | Escritorio remoto con catálogo de aplicaciones y gestión de ventanas |
| **Contenedores** | No disponibles de forma utilizable | Motor operativo, con construcción y orquestación local, y cliente corporativo preautenticado |
| **Registro de imágenes** | Gestión manual de credenciales, cuando era posible | Registro interno por defecto, ya autenticado, con acceso a catálogos públicos vía proxy |
| **Bases de datos** | Cliente instalado en el equipo personal | Clientes instalables dentro del entorno, bajo políticas de la plataforma |
| **Frontend** | Sin navegador: visualización y depuración fuera del entorno | Chromium integrado, con herramientas de desarrollo y depuración |
| **Conectividad** | Dependiente de configuración local | Redirección de puertos, proxy local y transferencia de archivos integrados |
| **Agentes de IA** | Uso limitado a sugerencia de código | Ciclo completo: construir, ejecutar pruebas, verificar y corregir |
| **Estandarización** | Configuración duplicada entre entorno y puesto local | Entorno homogéneo y reproducible para todo el equipo |

*Tabla 1. Diferencias funcionales entre la versión anterior y la actual.*

---

## 5. Beneficios esperados

### 5.1. Para los equipos de desarrollo

- Reducción sustancial del tiempo de preparación de un puesto de trabajo: el entorno llega con la cadena de construcción, el acceso al registro y las herramientas ya resueltos.
- Menor incidencia de fallos atribuibles a diferencias de configuración entre el equipo del desarrollador y los entornos superiores.
- Bucle de retroalimentación más corto en pruebas de integración y en desarrollo de interfaces.
- Incorporación de nuevos miembros al equipo en horas en lugar de días, al eliminar la instalación manual de dependencias.

### 5.2. Para la organización

- Control efectivo sobre qué software y qué imágenes entran en el ciclo de desarrollo, al canalizarlos a través del registro y el catálogo corporativos.
- Menor exposición de datos y credenciales en equipos personales, al desplazar la actividad al entorno gestionado.
- Capacidad real de estandarizar prácticas de ingeniería, porque el entorno es un punto único donde aplicar configuración, plantillas y controles.
- Una base técnica sobre la que construir la adopción de IA de forma gobernada, en lugar de que cada equipo improvise su propio montaje.

---

## 6. Del uso ad hoc de la IA a un marco de trabajo propio

### 6.1. Por qué un harness no es, por sí solo, una estrategia

La disponibilidad de un agente de codificación dentro del entorno se percibe con frecuencia como el final del recorrido. Conviene afirmar lo contrario con claridad: es el principio. Un agente de propósito general conoce el ecosistema tecnológico en abstracto, pero desconoce por completo cómo trabaja Cardif. No sabe qué arquetipo de microservicio se utiliza, qué convenciones de nomenclatura rigen, qué versiones de las librerías están homologadas, cómo se estructuran las plantillas de despliegue, qué controles debe superar un cambio antes de llegar a producción ni qué particularidades tiene el proveedor cloud sobre el que se ejecutan los servicios.

El resultado de utilizarlo sin ese contexto es un código sintácticamente correcto y funcionalmente plausible que, sin embargo, no se parece al que la organización mantiene. Genera revisiones más largas, correcciones repetidas y, en el peor de los casos, deuda técnica introducida a mayor velocidad de la que el equipo puede absorber. La productividad aparente se convierte en coste diferido.

La alternativa consiste en tratar el conocimiento de la organización como un activo de ingeniería: escribirlo, versionarlo, probarlo y distribuirlo igual que el código. Ese conjunto de piezas —instrucciones reutilizables, arquetipos, especificaciones, validadores y convenciones— es lo que este informe denomina **framework de IA a medida de Cardif**. Su propósito no es sustituir al desarrollador, sino garantizar que la asistencia automática produzca resultados alineados desde el primer intento.

### 6.2. Dimensiones que debe cubrir el marco

El marco debe construirse sobre la realidad técnica de la organización, no sobre un modelo genérico. A partir de los proyectos observados en el entorno, se identifican al menos cuatro dimensiones:

**Tecnología y arquetipos.** El ecosistema predominante es Java con Maven, empaquetado en contenedor, con instrumentación de observabilidad mediante agente, análisis estático de calidad, control de secretos previo a la confirmación de cambios y verificaciones automáticas en el momento del commit. Cada uno de estos elementos implica convenciones que un agente debe conocer para no proponer alternativas incompatibles.

**Proveedor cloud y servicios gestionados.** Los servicios se apoyan en el proveedor cloud corporativo y en sus servicios gestionados, entre ellos el almacenamiento de objetos. Los patrones de acceso, la gestión de credenciales, las estrategias de reintento y los modos de fallo son específicos de ese proveedor. Un agente que sugiera el equivalente de otro proveedor genera trabajo en lugar de ahorrarlo.

**Arquitectura y estructura de despliegue.** La arquitectura de microservicios, con definiciones de despliegue mediante plantillas y cadenas separadas de integración, entrega y control de calidad, impone una estructura de repositorio y un conjunto de artefactos que deben generarse de forma consistente. El marco debe codificar ese esqueleto.

**Normativa, seguridad y cumplimiento.** Por el sector en el que opera la compañía, existen requisitos de trazabilidad, protección de datos y segregación de funciones que condicionan qué puede automatizarse y qué debe conservar intervención humana explícita. El marco debe incorporar estos límites como parte de su diseño y no como una revisión posterior.

---

## 7. Decisiones que la organización debe tomar

Avanzar hacia el marco descrito exige resolver tres cuestiones. No son decisiones técnicas menores: determinan el modelo de gobierno, el coste de mantenimiento y la velocidad de adopción.

### 7.1. ¿Se desarrollarán skills propias o se utilizarán skills públicas?

La primera decisión afecta al origen del conocimiento que se entrega al agente. Ambas opciones tienen un perfil de coste y riesgo distinto.

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| **Sólo skills públicas** | Disponibilidad inmediata, coste de creación nulo, mantenidas por la comunidad | No conocen las convenciones de Cardif; calidad heterogénea; riesgo de cadena de suministro; evolución ajena al control de la organización |
| **Sólo skills propias** | Alineación total con arquetipos, cloud y normativa; control y auditoría completos | Coste inicial elevado; requiere un equipo responsable; riesgo de reinventar capacidades genéricas |
| **Modelo híbrido** | Aprovecha lo genérico y concentra el esfuerzo en lo diferencial | Exige un proceso de curaduría y criterios claros de clasificación |

*Tabla 2. Alternativas para el origen de las skills.*

**Recomendación:** adoptar un modelo híbrido con un criterio de decisión explícito. Si el conocimiento es público, estable y no revela nada sobre la organización —manipulación de formatos, utilidades de lenguaje, operaciones con herramientas estándar— se incorpora una skill pública, previa revisión y fijación de versión. Si el conocimiento codifica una convención interna, un arquetipo, una integración con el proveedor cloud corporativo o un control de cumplimiento, se desarrolla internamente. Toda skill pública debe pasar por un proceso de curaduría que incluya revisión del contenido, fijación de versión y réplica en el repositorio interno; no debe consumirse directamente desde una fuente externa.

Como punto de partida, se sugiere identificar las cinco o seis tareas más repetitivas del ciclo actual —creación de un microservicio desde el arquetipo, generación de pruebas unitarias conforme al estándar interno, preparación de las plantillas de despliegue, revisión de cumplimiento previo a la solicitud de fusión, redacción de la entrada de registro de cambios— y convertirlas en las primeras skills propias. Son tareas de alto volumen, resultado verificable y beneficio medible.

### 7.2. ¿En qué repositorio vivirán las skills?

La segunda decisión determina cómo se distribuyen, versionan y gobiernan estos activos. Se plantean tres modelos:

1. **Distribuidas en cada repositorio de proyecto.** Máxima cercanía al código y libertad de cada equipo, a costa de una duplicación inevitable y de la imposibilidad de propagar una corrección de forma transversal.
2. **Centralizadas en un repositorio único.** Facilita el gobierno, la revisión y la coherencia, pero puede alejarse de las necesidades específicas de cada equipo si no se gestiona con agilidad.
3. **Modelo mixto con distribución versionada.** Un repositorio central actúa como catálogo canónico y se publica como artefacto versionado; cada proyecto declara la versión que consume y mantiene, si lo necesita, un pequeño conjunto de skills locales para lo estrictamente específico.

**Recomendación:** el modelo mixto. En la práctica supone crear un repositorio corporativo de skills con versionado semántico, revisión obligatoria por responsables designados y un conjunto de pruebas que verifique que cada skill produce el resultado esperado sobre casos de referencia. La distribución se realiza publicando el catálogo como artefacto en el repositorio de artefactos corporativo, de modo que el entorno DevX pueda incorporarlo de forma automática y que cada proyecto pueda fijar la versión que utiliza. Este esquema evita tanto la dispersión como la rigidez, y hace que una mejora en una skill se propague de forma controlada y trazable.

El repositorio debe contar además con documentación de contribución, un procedimiento de propuesta de nuevas skills abierto a todos los equipos y una revisión periódica que retire lo que haya quedado obsoleto. Sin ese mantenimiento, el catálogo se degrada y el agente empieza a recibir instrucciones contradictorias, que es la peor situación posible.

### 7.3. ¿Se adoptará desarrollo basado en especificaciones con OpenSpec?

La tercera decisión es metodológica y probablemente la de mayor recorrido. El desarrollo basado en especificaciones invierte el orden habitual del trabajo asistido por IA: en lugar de pedir código y revisar después qué ha salido, se acuerda primero una especificación del cambio —qué comportamiento se añade o se modifica, qué criterios de aceptación aplican, qué queda fuera de alcance— y sólo entonces se genera la implementación contra ese documento.

Este enfoque encaja bien con el contexto de la organización por tres razones. La primera es de calidad: la especificación se revisa en minutos, mientras que revisar la implementación completa cuesta horas, de modo que el error se detecta cuando todavía es barato corregirlo. La segunda es de trazabilidad: en un sector regulado, disponer de un documento versionado que explique por qué existe un cambio, qué se decidió y qué criterios debía cumplir tiene valor por sí mismo, tanto para auditoría como para el mantenimiento futuro. La tercera es de eficacia del agente: una especificación estructurada es precisamente el tipo de contexto que permite a un agente producir una implementación alineada, en lugar de inferir intenciones a partir de una instrucción breve.

**Recomendación:** adoptarlo mediante un piloto acotado antes de generalizarlo. Se propone seleccionar un microservicio representativo y aplicar el flujo completo durante dos o tres iteraciones, midiendo el tiempo dedicado a la especificación, el número de ciclos de corrección necesarios y los comentarios recibidos en la revisión de código. La conclusión del piloto debe determinar si el método se extiende a todos los cambios, se reserva para funcionalidades de cierta entidad —dejando fuera las correcciones menores, donde la especificación resultaría desproporcionada— o se descarta.

Conviene señalar que, si se adopta, la especificación deja de ser documentación complementaria y pasa a formar parte del repositorio, sujeta a revisión igual que el código. Esa integración es la que hace que el método funcione; mantenerlo como un documento paralelo lo convierte en carga burocrática sin beneficio.

---

## 8. Hoja de ruta propuesta

Se plantea una progresión en cuatro fases, deliberadamente conservadora en su arranque para que las decisiones se tomen con evidencia y no con expectativas.

| Fase | Objetivo | Actividades principales | Resultado |
|---|---|---|---|
| **1. Diagnóstico** | Conocer el punto de partida | Inventario de tareas repetitivas; identificación de convenciones no escritas; definición de métricas base | Catálogo priorizado de casos de uso |
| **2. Piloto** | Validar el enfoque | Tres a cinco skills propias; piloto de desarrollo basado en especificaciones en un microservicio; equipo reducido | Evidencia cuantitativa y decisión informada |
| **3. Normalización** | Consolidar lo que funciona | Repositorio corporativo de skills; proceso de contribución y revisión; publicación como artefacto; formación | Marco operativo y gobernado |
| **4. Escalado** | Extender a la organización | Incorporación progresiva de equipos; ampliación del catálogo; revisión periódica de vigencia | Adopción generalizada y sostenible |

*Tabla 3. Fases propuestas para la construcción del marco.*

### 8.1. Indicadores sugeridos

Para evitar que la valoración se base en percepciones, se propone medir desde la primera fase un conjunto reducido de indicadores:

- Tiempo transcurrido desde el inicio de una tarea hasta su llegada a producción.
- Número de ciclos de corrección por solicitud de fusión y volumen de comentarios en revisión.
- Proporción de cambios que superan los controles de calidad y seguridad en el primer intento.
- Tiempo de incorporación de un desarrollador nuevo hasta su primera aportación en producción.
- Grado de uso real del catálogo de skills, como señal de su utilidad percibida.

---

## 9. Riesgos y consideraciones

| Riesgo | Descripción | Mitigación |
|---|---|---|
| **Deuda técnica acelerada** | La generación asistida sin criterio produce código que el equipo no puede mantener al ritmo en que se crea | Desarrollo basado en especificaciones; revisión humana obligatoria; criterios de aceptación explícitos |
| **Dependencia de skills externas** | Contenido de terceros no auditado o que cambia sin control | Curaduría, fijación de versión y réplica en el repositorio interno |
| **Catálogo desatendido** | Skills obsoletas que entregan instrucciones contradictorias al agente | Responsables designados, revisión periódica y retirada de contenido caducado |
| **Exposición de información** | Envío de código o datos sensibles a servicios externos | Uso de los servicios homologados por la compañía; clasificación previa de qué puede compartirse |
| **Productividad aparente** | Métricas de volumen que ocultan un aumento del trabajo de revisión y corrección | Medición de indicadores de flujo y calidad, no de líneas generadas |
| **Adopción desigual** | Equipos que avanzan a velocidades muy distintas | Formación, referentes internos y acompañamiento durante el escalado |

*Tabla 4. Principales riesgos identificados y medidas de mitigación.*

---

## 10. Conclusión

La nueva versión de DevX Studio representa un cambio de categoría respecto a la anterior. Pasar de un editor en el navegador a un entorno con escritorio, contenedores autenticados contra el registro corporativo, clientes de base de datos instalables, navegador integrado y utilidades de conectividad significa que el ciclo de desarrollo completo puede realizarse dentro de la plataforma, de forma homogénea, controlada y reproducible. Sólo por ello, la actualización está justificada.

El mayor potencial, sin embargo, está en lo que este entorno habilita. Al ofrecer las condiciones que un agente de codificación necesita para trabajar de verdad, abre la puerta a una adopción de la inteligencia artificial que vaya más allá del uso ad hoc. Aprovechar esa oportunidad depende menos de la herramienta que del método: exige codificar el conocimiento propio de Cardif en activos versionados y gobernados, decidir dónde viven y cómo se mantienen, y adoptar un enfoque de trabajo que permita verificar la intención antes de revisar la implementación.

Las tres decisiones planteadas en este informe —origen de las skills, repositorio y gobierno, y adopción del desarrollo basado en especificaciones— son el siguiente paso. Se propone abordarlas en una sesión de trabajo específica y validarlas mediante un piloto acotado, de modo que la organización avance con evidencia y construya un marco propio en lugar de acumular herramientas sin criterio común.
