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
    pnpm test:e2e
    pnpm build

En Chrome, Edge o Brave abre chrome://extensions, activa Modo de desarrollador, elige Cargar descomprimida y selecciona dist/. En Hito 0, el content script solo coincide con http://localhost y http://127.0.0.1 para las pruebas. Abre allí una página y usa el botón de la extensión para abrir el panel lateral.

Consulta [research/README.md](research/README.md) para el entorno Python.

## English (brief)

El Contrabandista is a local-first Chromium extension for explaining dark patterns. It has no telemetry or outbound network requests. Runtime code is TypeScript; Python is reserved for offline research. See the Spanish documentation and roadmap.

