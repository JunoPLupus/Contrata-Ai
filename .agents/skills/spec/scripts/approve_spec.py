"""
O "aprovar" de uma spec: rode só depois do "aprovado" do Juno na conversa (CA-35).

Bloco único de checagens (nada muda antes de todas passarem; a recusa mostra todos os problemas juntos):

- status `rascunho`;
- validate_spec sem erro na pasta inteira (spec.md e, se existir, design.md);
- "Em aberto" do spec.md igual a "nada" (cada item, com a linha).

Com tudo ok, grava no spec.md: status `aprovada` (ou `em andamento`, na reaprovação de uma spec com alguma task
da lista já iniciada: `em andamento`, `concluída`, `cancelada` ou riscada), "Aprovada em: AAAA-MM-DD, pelo Juno"
e o "Atualizado em" do dia. Não roda git: quem commita é o Juno.

Saída: o status gravado e o motivo, ou "Aprovar recusado" com os problemas; exit 1 na recusa.

Uso: python3 approve_spec.py <pasta da spec>
"""

import argparse
import sys
from datetime import date
from pathlib import Path

from utils import get_project_root, read_text, relative_to_root, use_global_lib

use_global_lib()
import validate_spec  # noqa: E402  (precisa do sys.path ajustado acima)
from md_checks import (  # noqa: E402
    TASK_INICIADA,
    read_status,
    refusal_lines,
    set_metadata,
    set_updated_at,
    spec_task_states,
)

STATUS_PARA_APROVAR = "rascunho"


def _check(pasta: Path, texto: str, raiz: Path) -> list[str]:
    """O bloco inteiro: todos os problemas juntos."""
    problemas: list[str] = []
    status, _ = read_status(texto)
    if status != STATUS_PARA_APROVAR:
        problemas.append(f"status: a spec está `{status}`; o aprovar só aceita spec em `{STATUS_PARA_APROVAR}`")

    for f in validate_spec.validate(pasta, raiz=raiz):
        if f.severidade == "erro":
            problemas.append(f"validador: {f}")

    for linha, item in validate_spec.open_items(texto) or []:
        problemas.append(f"em aberto: spec.md:{linha} {item}")
    return problemas


def approve(pasta: Path, raiz: Path, hoje: date | None = None) -> tuple[int, list[str]]:
    """(exit, linhas da saída). `raiz` é o repositório (os testes passam uma pasta temporária)."""
    hoje = hoje or date.today()
    spec = pasta / "spec.md"
    texto = read_text(spec)
    nome = relative_to_root(pasta, raiz)

    problemas = _check(pasta, texto, raiz)
    if problemas:
        return 1, refusal_lines("Aprovar", f"a spec {nome}", problemas)

    iniciadas = [t for t in spec_task_states(pasta) if t.na_lista and t.status in TASK_INICIADA]
    if iniciadas:
        novo = "em andamento"
        lista = ", ".join(f"{t.numero} ({t.status})" for t in iniciadas)
        motivo = f"reaprovação com task da lista já iniciada: {lista}"
        atualizado = f"aprovada pelo Juno (reaprovação; task já iniciada: {lista})"
    else:
        novo = "aprovada"
        motivo = "nenhuma task da lista iniciada"
        atualizado = "aprovada pelo Juno"

    texto = set_metadata(texto, "Status", f"`{novo}`")
    texto = set_metadata(texto, validate_spec.APROVADA_EM, f"{hoje.isoformat()}, pelo Juno")
    texto = set_updated_at(texto, hoje, atualizado)
    spec.write_text(texto, encoding="utf-8")
    return 0, [
        f"Spec aprovada: {nome}",
        f"- status `{novo}` ({motivo})",
        f"- Aprovada em: {hoje.isoformat()}, pelo Juno",
        f"- Atualizado em: {hoje.isoformat()} — {atualizado}",
    ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Aprova uma spec em rascunho (depois do 'aprovado' do Juno).")
    parser.add_argument("pasta_spec", type=Path, help="Caminho da pasta da spec.")
    args = parser.parse_args(argv)

    pasta: Path = args.pasta_spec.resolve()
    if not (pasta / "spec.md").is_file():
        raise SystemExit(f"Erro: o arquivo 'spec.md' não foi encontrado em '{args.pasta_spec}'.")

    codigo, linhas = approve(pasta, get_project_root())
    print("\n".join(linhas))
    return codigo


if __name__ == "__main__":
    sys.exit(main())
