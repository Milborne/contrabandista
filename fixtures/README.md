# Fixtures de prueba

Las páginas HTML aquí guardadas son sintéticas, autocontenidas y no dependen de red ni contienen datos personales. El nombre y este README describen las etiquetas: `prechecked-basic.html` contiene casillas premarcadas para boletín/marketing y seguro; `clean-form.html` sirve como ejemplo negativo.

Para servirlas en localhost y permitir que corra el content script, ejecuta:

```sh
pnpm fixtures
```

Abre `http://localhost:4179/prechecked-basic.html` o `http://localhost:4179/clean-form.html`. El puerto se configura mediante `FIXTURES_PORT`. Al agregar páginas de terceros, documenta licencia/fuente y elimina datos personales; las fixtures actuales no los contienen.
