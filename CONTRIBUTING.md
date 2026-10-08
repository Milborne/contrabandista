# Contribuir

Antes de proponer cambios, revisa el [plan](docs/plan.md), el [modelo de amenazas](docs/threat-model.md) y los ADR.

1. Abre un issue para cambios de alcance o patrones nuevos.
2. Crea una rama descriptiva desde main.
3. Añade pruebas unitarias y e2e cuando cambie el comportamiento observable.
4. Ejecuta pnpm lint, typecheck, test, test:e2e y build.
5. Abre un PR con contexto, fixtures cuando proceda y límites conocidos.

No añadas telemetría, solicitudes externas, datos personales a fixtures ni permisos de host sin justificación documentada.
