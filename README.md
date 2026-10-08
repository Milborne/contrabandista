# El Contrabandista

Extensión Chromium local para detectar patrones oscuros, explicarlos con evidencia y, cuando sea seguro, mostrar una alternativa honesta. El alcance está en [docs/plan.md](docs/plan.md).

## Principios

- Privacidad radical: sin telemetría ni solicitudes salientes desde la extensión.
- Detecciones explicables, cautelosas y reversibles.
- Runtime en TypeScript; Python queda para investigación offline.
- Código abierto desde el inicio (Apache-2.0 provisional; ver [ADR 0003](docs/decisions/0003-licencia-provisional.md)).

## Requisitos y compilación

Node.js 22.12 o superior (Node 24 LTS recomendado) y pnpm 11.

    pnpm install
    pnpm dev
    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm exec playwright install chromium  # una sola vez para preparar el navegador e2e
    pnpm test:e2e
    pnpm build

Para probar las páginas sintéticas en localhost, ejecuta `pnpm fixtures` y abre `http://localhost:4179/prechecked-basic.html` o `http://localhost:4179/clean-form.html`. El content script sigue restringido a `localhost` y `127.0.0.1`. El panel lista hallazgos con evidencia y confianza; Resaltar dibuja un contorno temporal.

Si Playwright Chromium no está instalado localmente, se puede usar Edge mediante la ruta de su ejecutable en `PLAYWRIGHT_CHROMIUM_EXECUTABLE`; CI instala y usa Chromium. En PowerShell: `$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'; pnpm test:e2e`.

En Chrome, Edge o Brave abre `chrome://extensions`, activa Modo de desarrollador, elige Cargar descomprimida y selecciona `dist/`.

Consulta [research/README.md](research/README.md) para el entorno Python.

## English (brief)

El Contrabandista is a local-first Chromium extension for explaining dark patterns. It has no telemetry or outbound network requests. Runtime code is TypeScript; Python is reserved for offline research. See the Spanish documentation and roadmap.

