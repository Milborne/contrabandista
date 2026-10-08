# ADR 0002: pnpm

- Estado: aceptado.
- Decisión: usar pnpm 11 con lockfile estricto y Node >=22.12; Node 24 LTS es la recomendación.
- Motivo: instalación reproducible y uso eficiente de espacio; pnpm documenta soporte para Node 24. npm queda como alternativa solo si pnpm falla, regenerando el lockfile coherentemente.

