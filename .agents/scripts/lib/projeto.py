"""Utilitários de projeto compartilhados pelos scripts das skills: raiz, leitura, nome de pasta e modelos.

Para importar a lib de um script em .agents/skills/<skill>/scripts/:

    sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "lib"))
"""

import re
import unicodedata
from datetime import date
from pathlib import Path


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def get_project_root() -> Path:
    """Sobe até encontrar a raiz do projeto (onde fica a pasta .agents)."""
    for parent in Path(__file__).resolve().parents:
        if (parent / ".agents").is_dir():
            return parent

    raise SystemExit("Não encontrei a pasta '.agents' na raiz do projeto. Rode o script dentro do projeto.")


def relative_to_root(path: Path, raiz: Path | None = None) -> Path:
    """Caminho relativo à raiz (saída mais curta); devolve o original se estiver fora dela. Sem `raiz`, a do
    projeto; com ela, outra (o repositório temporário dos testes, por exemplo)."""
    try:
        return path.resolve().relative_to((raiz or get_project_root()).resolve())
    except ValueError:
        return path


def slugify(texto: str) -> str:
    """'Validação da Solicitação!' -> 'validacao-da-solicitacao'."""
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")


_TITULO_TEMPLATE = re.compile(r"\A(# [^:\n]+: )<[^>\n]+>")
_STATUS_LINHA_TEMPLATE = re.compile(r"^(- \*\*Status:\*\*).*$", re.MULTILINE)


def fill_template(nome_template: str, titulo: str, data: date, status: str | None = None) -> str:
    """Lê um template de .agents/docs/templates e preenche título, datas e (opcionalmente) o status.

    O título é o placeholder da primeira linha ("# Spec: <...>", "# Task: <...>").
    Falha (SystemExit) se o template não existir ou se uma troca esperada não acontecer,
    para que uma mudança no template não passe em silêncio.
    """
    origem = get_project_root() / ".agents" / "docs" / "templates" / nome_template
    if not origem.exists():
        raise SystemExit(f"Template '{origem}' não encontrado.")

    conteudo = read_text(origem)

    conteudo, trocas = _TITULO_TEMPLATE.subn(lambda m: m.group(1) + titulo, conteudo, count=1)
    if trocas == 0:
        raise SystemExit(f"Template '{nome_template}' sem o título '# <Tipo>: <placeholder>' na primeira linha.")

    # Só as linhas de metadados ("Criado em" / "Atualizado em"); o comentário do topo será apagado por quem preenche.
    conteudo = re.sub(r"(\*\*(?:Criado|Atualizado) em:\*\*) AAAA-MM-DD", rf"\g<1> {data.isoformat()}", conteudo)

    if status is not None:
        conteudo, trocas = _STATUS_LINHA_TEMPLATE.subn(rf"\g<1> `{status}`", conteudo, count=1)
        if trocas == 0:
            raise SystemExit(f"Template '{nome_template}' sem a linha '- **Status:**'.")

    return conteudo
