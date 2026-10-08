# ADR 0005: Lectura puntual de la pestaña activa

- Estado: sustituido en Hito 1.
- Contexto: el panel debe mostrar título y URL también en páginas normales, pero no se concederá acceso permanente a todos los sitios.
- Decisión original Hito 0: se declararon `activeTab` y `scripting` para leer título y URL de forma puntual.
- Cambio Hito 1: el panel solo presenta hallazgos que llegan del content script, el cual sigue limitado a localhost/127.0.0.1. Ya no se requiere leer/injectar en páginas fuera de esos hosts, así que se retiraron ambos permisos del manifest.
- Alternativas: `host_permissions` globales (rechazadas por exceso de acceso) o restringir toda la demostración a localhost (no cumple la comprobación en una página habitual).
- Consecuencias actuales: en Hito 1 no se solicita acceso temporal a otros orígenes. El acceso del content script sigue limitado a localhost/127.0.0.1 y los hallazgos se conservan en almacenamiento de sesión.
