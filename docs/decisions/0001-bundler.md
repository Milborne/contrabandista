# ADR 0001: Vite y CRXJS para MV3

- Estado: aceptado para Hito 0.
- Contexto: compilar TypeScript como extensión MV3 con service worker, content script y side panel.
- Decisión: usar Vite con @crxjs/vite-plugin, que procesa el manifest MV3 y empaqueta entradas de extensión; dist se puede cargar sin procesar.
- Alternativas: configuración manual Vite/Rollup (más mantenimiento de entradas y manifest) y otros plugins.
- Consecuencias: dependencia comunitaria sujeta a cambios; fijar versiones en lockfile y reevaluar compatibilidad al actualizar. Se eligió con base en documentación y releases consultados al iniciar Hito 0.
