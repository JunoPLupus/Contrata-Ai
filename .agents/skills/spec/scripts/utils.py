"""Funções compartilhadas pelos scripts da skill spec."""

import re
import sys
from datetime import date
from pathlib import Path


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def get_project_root() -> Path:
    """Sobe até encontrar a raiz do projeto (onde fica a pasta .agents)."""
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / ".agents").is_dir():
            return parent

    raise SystemExit("Não encontrei a pasta '.agents' na raiz do projeto. Rode o script dentro do projeto.")


def use_global_lib() -> None:
    """Deixa os módulos de .agents/scripts/lib importáveis (lib compartilhada entre as skills)."""
    lib = str(get_project_root() / ".agents" / "scripts" / "lib")
    if lib not in sys.path:
        sys.path.insert(0, lib)


def relative_to_root(path: Path) -> Path:
    """Caminho relativo à raiz do projeto (saída mais curta); devolve o original se estiver fora dela."""
    try:
        return path.resolve().relative_to(get_project_root())
    except ValueError:
        return path


_STATUS_LINHA_TEMPLATE = re.compile(r"^(- \*\*Status:\*\*).*$", re.MULTILINE)


def fill_template(nome_template: str, titulo: str, data: date, status: str | None = None) -> str:
    """Lê um template de .agents/docs/templates e preenche título, datas e (opcionalmente) o status.

    Falha (SystemExit) se o template não existir ou se uma troca esperada não acontecer,
    para que uma mudança no template não passe em silêncio.
    """
    origem = get_project_root() / ".agents" / "docs" / "templates" / nome_template
    if not origem.exists():
        raise SystemExit(f"Template '{origem}' não encontrado.")

    conteudo = read_text(origem)

    if "<título da funcionalidade>" not in conteudo:
        raise SystemExit(f"Template '{nome_template}' sem o placeholder '<título da funcionalidade>'.")
    conteudo = conteudo.replace("<título da funcionalidade>", titulo, 1)

    # Só as linhas de metadados ("Criado em" / "Atualizado em"); o comentário do topo será apagado por quem preenche.
    conteudo = re.sub(r"(\*\*(?:Criado|Atualizado) em:\*\*) AAAA-MM-DD", rf"\g<1> {data.isoformat()}", conteudo)

    if status is not None:
        conteudo, trocas = _STATUS_LINHA_TEMPLATE.subn(rf"\g<1> `{status}`", conteudo, count=1)
        if trocas == 0:
            raise SystemExit(f"Template '{nome_template}' sem a linha '- **Status:**'.")

    return conteudo
