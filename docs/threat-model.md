# Modelo de amenazas — Hito 0

## Activos y límites
La extensión conserva localmente los metadatos mínimos de la página activa. El DOM y sus textos pertenecen a un origen no confiable. El content script vive en un isolated world de Chromium, pero comparte el DOM visible con la página y debe validar todos los mensajes.

## Amenazas y mitigaciones
- Una página puede incluir texto que intente dar instrucciones a un futuro LLM. Trátalo como dato, nunca como instrucción o permiso; valida el esquema de salida y prohíbe acciones automáticas derivadas del modelo.
- Una página puede enviar mensajes manipulados. El service worker verifica estructura, tipos y sender.tab; el panel presenta texto mediante textContent, nunca como HTML.
- Exfiltración accidental de título/URL o snapshot: no declaramos permisos de red, no hay analítica y un chequeo estático bloquea APIs conocidas de red en runtime.
- Confusión entre contenido y privilegios: el content script solo usa mensajería; el worker valida emisor y conserva únicamente datos de sesión.

## Límites
Los permisos se limitan a sidePanel, storage y localhost/127.0.0.1. El aislamiento de Chromium reduce el acceso al contexto JS, pero el sitio controla el DOM. El chequeo estático no es completo: APIs nuevas u ofuscación requieren revisión y pruebas futuras.
