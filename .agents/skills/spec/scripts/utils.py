"""Funções compartilhadas pelos scripts da skill spec.

As genéricas moram na lib global (.agents/scripts/lib/projeto.py) e são reexportadas aqui, para os
scripts da skill continuarem com `from utils import ...`.
"""

import sys
from pathlib import Path

_LIB = Path(__file__).resolve().parents[3] / "scripts" / "lib"


def use_global_lib() -> None:
    """Deixa os módulos de .agents/scripts/lib importáveis (lib compartilhada entre as skills)."""
    if str(_LIB) not in sys.path:
        sys.path.insert(0, str(_LIB))


use_global_lib()
from projeto import fill_template, get_project_root, read_text, relative_to_root, slugify  # noqa: E402,F401
