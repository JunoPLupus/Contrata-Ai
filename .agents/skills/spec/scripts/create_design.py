"""Cria o design.md numa pasta de spec existente (fase 3, depois da spec aprovada).

O título vem da primeira linha do spec.md ("# Spec: <título>"). Recusa a spec que não está `aprovada` ou cujo
"Em aberto" não diz "nada" (lista os itens, com a linha), sem criar nada.

Uso: python create_design.py <pasta da spec> [--data AAAA-MM-DD]
"""

import argparse
import re
from datetime import date
from pathlib import Path

from utils import fill_template, read_text, relative_to_root
from validate_spec import open_items


_TITULO_SPEC = re.compile(r"^# Spec: (.+)$", re.MULTILINE)
_STATUS_SPEC = re.compile(r"\*\*Status:\*\*\s*`([^`]+)`")


def main() -> None:
    parser = argparse.ArgumentParser(description="Cria o design.md de uma spec existente.")
    parser.add_argument("pasta_spec", type=Path, help="Caminho da pasta da spec")
    parser.add_argument("--data", type=date.fromisoformat, default=None, help="AAAA-MM-DD (padrão: hoje)")
    args = parser.parse_args()

    pasta: Path = args.pasta_spec
    spec = pasta / "spec.md"
    design = pasta / "design.md"

    if not spec.exists():
        raise SystemExit(f"'spec.md' não encontrado em '{pasta}'.")
    if design.exists():
        raise SystemExit(f"'design.md' já existe em '{pasta}'.")

    conteudo_spec = read_text(spec)

    titulo = _TITULO_SPEC.search(conteudo_spec)
    if titulo is None:
        raise SystemExit(f"Primeira linha '# Spec: <título>' não encontrada em '{spec}'.")

    # A skill só começa o design com a spec aprovada; o script reforça a regra.
    status = _STATUS_SPEC.search(conteudo_spec)
    if status is None or status.group(1) != "aprovada":
        atual = status.group(1) if status else "ausente"
        raise SystemExit(f"A spec precisa estar 'aprovada' para criar o design (status atual: {atual}).")

    itens = open_items(conteudo_spec)
    if itens is None:
        raise SystemExit(f"'{relative_to_root(spec)}' sem a subseção '### Em aberto' (rode o validate_spec.py).")
    if itens:
        lista = "\n".join(f"- spec.md:{linha} {item}" for linha, item in itens)
        raise SystemExit(f"A spec tem item em aberto; resolva antes de criar o design:\n{lista}")

    conteudo = fill_template("design.md", titulo.group(1).strip(), args.data or date.today())
    design.write_text(conteudo, encoding="utf-8")

    print(f"Design criado em: {relative_to_root(design)}")


if __name__ == "__main__":
    main()
