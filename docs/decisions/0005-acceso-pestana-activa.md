# ADR 0005: Lectura puntual de la pestaña activa

- Estado: aceptado para Hito 0.
- Contexto: el panel debe mostrar título y URL también en páginas normales, pero no se concederá acceso permanente a todos los sitios.
- Decisión: declarar `activeTab` y `scripting`. Al abrir el panel desde la acción de la extensión, se lee únicamente `document.title` y `location.href` de la pestaña invocada. Se conserva el content script limitado a localhost para comprobar el canal de mensajería.
- Alternativas: `host_permissions` globales (rechazadas por exceso de acceso) o restringir toda la demostración a localhost (no cumple la comprobación en una página habitual).
- Consecuencias: el usuario debe invocar la extensión sobre la pestaña; páginas internas/restringidas del navegador no son accesibles. No se lee contenido ni se envían datos fuera del dispositivo.
