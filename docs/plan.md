# El Contrabandista — Plan v2

> Extensión de navegador que detecta patrones oscuros (dark patterns) mientras navegas, explica en lenguaje claro qué te están haciendo y, cuando es seguro, te muestra la versión honesta de la página.

---

## 0. Qué cambió respecto al plan v1

| Problema del v1 | Mejora en v2 |
|---|---|
| Seis "territorios" en secuencia estricta (cascada): no hay producto usable hasta el final | Se construye un **esqueleto funcional de punta a punta primero** y luego se profundiza por capas |
| No se define qué significa "funciona" | Cada hito tiene **criterios de salida medibles** (precisión, recall, rendimiento) |
| Se promete "invertir la ingeniería de cada página" | Alcance realista: **detectar un catálogo acotado de patrones** con señales verificables |
| Python + TypeScript + LLM local sin definir cómo se conectan | **Arquitectura única**: el runtime es 100 % TypeScript; Python queda solo para investigación y evaluación offline |
| El LLM entra tarde y como pieza central | El LLM es **opcional y secundario**: las reglas detectan, el LLM explica y resuelve casos ambiguos |
| No hay conjunto de pruebas | **Corpus de páginas guardadas (fixtures)** y métricas desde el día uno |
| No se mencionan riesgos legales, de rendimiento ni falsos positivos | Sección de riesgos y decisiones abiertas |
| Mencionaba un proxy | Se descarta: rompe la privacidad y la simplicidad. Todo corre en la extensión |

---

## 1. Visión, alcance y no-alcance

**Visión.** Que cualquier persona vea, en el momento exacto de la compra o suscripción, qué técnica de manipulación está usando el sitio y por qué.

**Dentro de v1:**
- Extensión para Chromium (Chrome, Edge, Brave).
- Detección de ~15 patrones (ver sección 4).
- Panel lateral con detección, evidencia y explicación.
- Reescritura reversible de 3 patrones como mínimo.
- 100 % local: ningún dato de navegación sale del equipo.

**Fuera de v1 (explícito):**
- Firefox y Safari.
- Bloqueo de anuncios o rastreadores (ya existen herramientas excelentes).
- Detección de reseñas falsas o análisis de reputación (requiere datos externos).
- Cualquier backend, cuenta de usuario o telemetría.
- Modificar el flujo de pago o enviar formularios por el usuario.

---

## 2. Principios (con regla operativa)

1. **Privacidad radical.** Sin red saliente salvo la que el usuario active explícitamente. *Regla:* la extensión no declara permisos de host que no necesite y no incluye analítica.
2. **Honestidad radical.** Solo revela, nunca engaña. *Regla:* toda modificación visual es marcada, reversible y con botón "ver original".
3. **Detección explicable.** *Regla:* ninguna alerta sin evidencia (el elemento resaltado, la regla que saltó y el motivo).
4. **Humildad ante la duda.** *Regla:* cada detección lleva un nivel de confianza; bajo cierto umbral se muestra como "posible", nunca como acusación.
5. **No romper la web.** *Regla:* presupuesto de rendimiento y pruebas de regresión contra páginas reales.
6. **Código abierto desde el inicio**, con licencia y gobernanza definidas (sección 9).

---

## 3. Arquitectura

```
Página web
   │
   ▼
Content script (TS) ──► Extractor de instantánea (snapshot JSON)
   │                         │
   │                         ▼
   │                  Motor de reglas (TS)  ──► Hallazgos + evidencia + confianza
   │                         │
   │                         ▼  (solo casos ambiguos o si el usuario lo activa)
   │                  Analista LLM (local)  ──► Explicación estructurada (JSON)
   │                         │
   ▼                         ▼
Reescritor (overlay)    Panel lateral (chrome.sidePanel)
```

**Decisiones de arquitectura:**
- **Runtime en TypeScript.** Un solo lenguaje en producción reduce fricción y superficie de error.
- **Python solo offline:** análisis de datasets académicos, construcción del corpus, evaluación de reglas y del LLM, notebooks.
- **Manifest V3:** el service worker no es persistente; el estado vive en `chrome.storage` y en el content script. Usar un *offscreen document* si hace falta ejecutar código de larga duración.
- **Opciones de LLM local (se evalúan en el Hito 3, no se eligen de antemano):**
  1. IA integrada del navegador (APIs de modelo incorporado de Chrome), si está disponible: cero instalación.
  2. WebLLM / WebGPU dentro de la extensión: sin servidor, exige GPU y descarga de modelo.
  3. Servidor local (por ejemplo Ollama) vía `localhost`: más potencia, más instalación.
  - El analista se diseña como **interfaz intercambiable** (`Analyzer`), así la elección no bloquea el resto.
- **Instantánea (snapshot) de página** como contrato central: estructura mínima y estable que alimenta reglas, LLM, pruebas y panel (texto visible, rol y estilo computado de botones/enlaces/checkboxes, posiciones, temporizadores detectados, precios, formularios, mutaciones recientes).
- **Aislamiento:** el content script no confía en el contenido de la página. El texto de la página se trata como **entrada no confiable** (riesgo de inyección de instrucciones al LLM; ver sección 8).

---

## 4. Catálogo de patrones v1 (15) y cómo se detectan

Base teórica: la taxonomía de Harry Brignull (deceptive.design), las cinco estrategias de Gray et al. (2018: acoso/nagging, obstrucción, sigilo/sneaking, interferencia de interfaz, acción forzada) y las siete categorías de Mathur et al. (2019, *Dark Patterns at Scale*). Se mapea cada patrón a una categoría para poder comparar con la literatura.

| # | Patrón | Señal principal | Nivel de dificultad |
|---|---|---|---|
| 1 | Urgencia falsa (cuenta regresiva) | Temporizador que se reinicia al recargar o que no está atado a una fecha real | Medio (requiere dos cargas) |
| 2 | Escasez falsa ("quedan 2") | Texto de stock + valor que no cambia o aparece sin datos | Medio |
| 3 | Prueba social falsa ("12 personas viendo") | Notificaciones periódicas con nombres/cifras aleatorias | Medio |
| 4 | Confirmshaming | Texto del rechazo que culpa o ridiculiza | Bajo (reglas + LLM) |
| 5 | Casillas premarcadas | `input[type=checkbox]` marcado por defecto con texto de suscripción/seguro/extras | Bajo |
| 6 | Costos ocultos (drip pricing) | Diferencia entre precio mostrado y total en el carrito | Alto (multipágina) |
| 7 | Asimetría visual de botones | Aceptar muy prominente, rechazar como enlace gris diminuto | Bajo-medio (estilos computados) |
| 8 | Banner de cookies asimétrico | "Aceptar todo" en un clic, rechazar en varios | Medio |
| 9 | Texto confuso / doble negación | Casillas con "No quiero no recibir…" | Medio (LLM) |
| 10 | Falso descuento | Precio tachado sin respaldo / se mantiene siempre | Alto (histórico) |
| 11 | Suscripción oculta tras "prueba gratis" | Renovación automática en letra pequeña o contraste mínimo | Medio |
| 12 | Cancelación obstruida (roach motel) | Registro en un clic vs. cancelación sin enlace visible | Alto (flujo) |
| 13 | Acoso (nagging) | Ventanas emergentes recurrentes tras descartarlas | Medio (temporal) |
| 14 | Registro obligatorio innecesario | Muro de cuenta antes de ver precio o completar compra simple | Medio |
| 15 | Botón engañoso | Etiqueta ("Cancelar", "Continuar") que no coincide con la acción real | Medio-alto (DOM + LLM) |

**Cada patrón se documenta en una ficha:** definición, ejemplos reales (capturas guardadas), señales DOM/CSS/tiempo, falsos positivos conocidos, nivel de confianza y si requiere LLM.

---

## 5. Cómo se trabaja: capas, no cascada

Cada hito entrega algo **usable**. No se avanza sin cumplir el criterio de salida.

### Hito 0 — Cimientos (1 semana)
- Repositorio, licencia, estructura (`/extension`, `/research`, `/fixtures`, `/docs`).
- Toolchain: TypeScript, bundler (Vite o similar), ESLint, pruebas con Vitest y Playwright.
- Documento de alcance y principios (este plan) y modelo de amenazas de una página.
- Lectura guiada: Brignull, Gray et al., Mathur et al., guías de la UE (DSA) y la FTC sobre patrones oscuros.
- **Salida:** `npm run build` genera una extensión que se carga en Chrome y muestra "hola" en el panel.

### Hito 1 — Esqueleto funcional (1–2 semanas)
- Content script que genera la **snapshot v0**.
- **Una** regla real (casillas premarcadas: la más simple y verificable).
- Panel lateral que lista el hallazgo y resalta el elemento en la página.
- **Salida:** en una página de prueba local se ve un hallazgo con evidencia, de extremo a extremo.

### Hito 2 — Detector y banco de pruebas (3–4 semanas)
- Corpus inicial: 40–60 páginas guardadas (HTML + capturas + etiquetas manuales), incluyendo páginas **sin** patrones (para medir falsos positivos).
- Reglas para 5–7 patrones de dificultad baja-media.
- Arnés de evaluación (en Python o Node) que calcula precisión y recall por regla.
- Comparación contra datasets públicos de la literatura, cuando existan y su licencia lo permita.
- **Salida:** precisión ≥ 85 % y recall ≥ 60 % en las reglas incluidas; tiempo de análisis < 150 ms en una página típica.

### Hito 3 — Analista con LLM (3 semanas)
- Interfaz `Analyzer` y evaluación de las tres opciones locales (sección 3) con una tabla de latencia, memoria y calidad.
- Esquema de salida estructurada (patrón, evidencia, explicación, confianza) validado con un esquema JSON.
- Defensas contra inyección de instrucciones desde la página.
- **Salida:** las explicaciones coinciden con la etiqueta humana en ≥ 80 % de un conjunto de 50 casos; la extensión sigue funcionando (solo reglas) si el LLM no está disponible.

### Hito 4 — Reescritura honesta (2–3 semanas)
- Capa de *overlay* no destructiva: no borra nodos, los envuelve o los anota.
- Tres transformaciones: neutralizar temporizador falso, igualar el peso visual de aceptar/rechazar, desmarcar casillas premarcadas (con aviso).
- Botón global "ver original" y lista de exclusión por sitio.
- **Salida:** pruebas de regresión en 20 sitios reales sin romper el flujo de compra.

### Hito 5 — Panel y experiencia (2–3 semanas)
- Diseño del panel: resumen, lista de hallazgos con confianza, evidencia, explicación, acción ("resaltar", "neutralizar", "ignorar en este sitio").
- Estados vacíos, errores, accesibilidad (teclado y lector de pantalla), modo oscuro.
- Idiomas: español e inglés desde el inicio (los textos de los sitios y de la interfaz).
- **Salida:** prueba con 5–8 personas reales, tareas medidas y ajustes.

### Hito 6 — Beta pública (2 semanas)
- Publicación en Chrome Web Store (política de privacidad clara, justificación de permisos).
- Guía de contribución, plantilla para reportar falsos positivos desde el panel (exportando solo lo que el usuario apruebe).
- Sitio web breve y demo en video corto (el "clip" para compartir).
- **Salida:** primeras 100 instalaciones y un ciclo de correcciones guiado por los reportes.

*Duración orientativa total: 3–4 meses a ritmo parcial. Las estimaciones se revisan al cerrar cada hito.*

---

## 6. Calidad y métricas

- **Detección:** precisión y recall por patrón; tasa de falsos positivos en páginas limpias (objetivo < 5 %).
- **Rendimiento:** impacto en carga < 50 ms en la ruta crítica; análisis pesado diferido a inactividad (`requestIdleCallback`); límite de nodos analizados.
- **Estabilidad:** pruebas contra páginas guardadas en cada commit; pruebas semanales contra sitios en vivo (los sitios cambian).
- **Explicabilidad:** toda alerta debe poder reproducirse con la snapshot que la generó.
- **Privacidad:** prueba automatizada que falla si la extensión realiza solicitudes de red no declaradas.

---

## 7. Datos y evaluación

- **Corpus propio:** páginas guardadas con etiquetas (patrón, elemento, gravedad), revisadas por dos personas cuando sea posible.
- **Conjunto "limpio":** sitios sin patrones evidentes, para medir falsos positivos.
- **Conjunto "adverso":** variantes que intentan evadir reglas (texto ofuscado, estilos dinámicos).
- **Versionado de datos** y registro de cómo se etiquetó, para poder reproducir los resultados.
- Respetar licencias y términos de uso al guardar páginas; no incluir datos personales en el corpus.

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Falsos positivos que acusan a sitios legítimos | Confianza explícita, lenguaje cauteloso ("posible"), reporte de errores, umbrales conservadores |
| Falsos negativos que dan seguridad falsa | Mensaje claro: "no se detectó nada" ≠ "no hay manipulación" |
| Inyección de instrucciones desde la página hacia el LLM | Tratar el texto de la página como dato; delimitadores, salida con esquema estricto, sin acciones automáticas derivadas del LLM |
| Límites de Manifest V3 | Diseñar para service worker efímero; sin dependencia de bloqueo de red |
| Rendimiento en páginas pesadas | Presupuesto de nodos, análisis diferido, caché por URL y hash |
| Modelo local demasiado pesado | Modo "solo reglas" completo y funcional; LLM opcional |
| Romper la funcionalidad del sitio al reescribir | Overlay reversible, lista de exclusión, pruebas de regresión |
| Obsolescencia (los sitios cambian) | Reglas por señales de comportamiento, no por selectores específicos de un sitio; mantenimiento comunitario |
| Riesgo legal (términos de uso, modificación de páginas) | Revisión de términos, la modificación ocurre solo en el navegador del usuario; asesoría legal antes del lanzamiento público |
| Fatiga del mantenedor | Alcance acotado, documentación, contribuciones guiadas |

---

## 9. Comunidad y sostenibilidad

- **Licencia:** decidir en el Hito 0. MIT/Apache-2.0 maximizan adopción; AGPL protege frente a versiones cerradas. Registrar la decisión y su razón.
- **Gobernanza mínima:** `CODE_OF_CONDUCT`, `CONTRIBUTING`, plantillas de issues, etiquetas "good first pattern".
- **Cada patrón como contribución autónoma:** ficha + regla + fixtures + pruebas; así la comunidad puede añadir patrones sin tocar el núcleo.
- **Transparencia:** registro público de cambios en reglas y de métricas por versión.

---

## 10. Decisiones pendientes (a cerrar con evidencia)

1. ¿Qué opción de LLM local es viable para usuarios sin GPU? (Hito 3)
2. ¿La reescritura será opt-in por patrón o por sitio? (Hito 4)
3. ¿Cómo se recolectan reportes de falsos positivos sin comprometer la privacidad? (Hito 6)
4. Licencia definitiva. (Hito 0)
5. Nombre público y marca (verificar disponibilidad y connotaciones del nombre "El Contrabandista" en otros idiomas).

---

## 11. Próximo paso concreto

1. Crear el repositorio y el esqueleto del Hito 0.
2. Redactar las fichas de los **tres** patrones más simples (casillas premarcadas, asimetría de botones, confirmshaming) con ejemplos reales guardados.
3. Implementar el Hito 1 con la regla de casillas premarcadas.

*Todo lo demás se ajusta con lo que se aprenda al cerrar cada hito.*
