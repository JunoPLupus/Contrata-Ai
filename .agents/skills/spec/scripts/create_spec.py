"""Cria a pasta de uma spec nova com o spec.md preenchido a partir do template.

O design.md não é criado aqui: ele nasce na fase 3, com create_design.py, depois da spec aprovada.

Uso: python create_spec.py <assunto> [--titulo "Título"] [--data AAAA-MM-DD]
"""

import argparse
import re
import unicodedata
from datetime import date
from pathlib import Path

from utils import fill_template, get_project_root, relative_to_root


# region Funções auxiliares

def _slugify(texto: str) -> str:
    """'Validação da Solicitação!' -> 'validacao-da-solicitacao'."""
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", sem_acento.lower()).strip("-")


def _titulo_padrao(slug: str) -> str:
    """Título provisório a partir do slug (sem acentos); prefira passar --titulo."""
    return slug.replace("-", " ").capitalize()

# endregion


def main() -> None:
    parser = argparse.ArgumentParser(description="Cria a pasta de uma spec nova com o spec.md.")
    parser.add_argument("assunto", help="Assunto da spec; vira o nome da pasta (ex.: 'validade da solicitação')")
    parser.add_argument("--titulo", help="Título da spec, com acentos (padrão: derivado do assunto)")
    parser.add_argument("--data", type=date.fromisoformat, default=None, help="AAAA-MM-DD (padrão: hoje)")
    args = parser.parse_args()

    slug = _slugify(args.assunto)
    if not slug:
        raise SystemExit(f"Assunto '{args.assunto}' não gera um nome de pasta válido.")

    data = args.data or date.today()
    titulo = args.titulo or _titulo_padrao(slug)

    # Monta o conteúdo antes de criar a pasta: se o template falhar, não sobra pasta vazia.
    conteudo = fill_template("spec.md", titulo, data, status="rascunho")

    destino: Path = get_project_root() / ".agents" / "docs" / "specs" / f"{data.isoformat()}-{slug}"
    if destino.exists():
        raise SystemExit(f"A pasta '{relative_to_root(destino)}' já existe.")

    destino.mkdir(parents=True)
    (destino / "spec.md").write_text(conteudo, encoding="utf-8")

    print(f"Spec criada em: {relative_to_root(destino)}")


if __name__ == "__main__":
    main()
