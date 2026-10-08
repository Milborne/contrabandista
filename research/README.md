# Investigación offline

Python se reserva para análisis de datasets y evaluación; no ejecuta código de la extensión. Requiere Python 3.11 o posterior. En Windows PowerShell:

    py -3.11 -m venv .venv
    .\.venv\Scripts\Activate.ps1
    python -m pip install --upgrade pip
    python -m pip install -e .
    python -c "import yaml; print('Entorno research listo')"

En macOS/Linux activa con source .venv/bin/activate.
