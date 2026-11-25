"""
O "encerrar" de uma spec: rode só depois de o Juno decidir as pendências e aprovar o encerramento (CA-19, CA-39).

Bloco único de checagens (nada muda antes de todas passarem; a recusa mostra todos os problemas juntos):

- status `em andamento`;
- validate_spec sem erro na pasta inteira (depois de ir para specs/done/, a spec não é mais validada);
- nenhuma task pendente: cada item da lista "## 6. Tasks" do design.md `concluída` ou `cancelada` (item riscado
  é cancelada; item sem arquivo é "não criada"), e nenhum arquivo de tasks/ fora da lista ainda aberto;
- a pasta de destino, specs/done/<pasta>, ainda não existe.

Com tudo ok, grava no spec.md o status `concluída`, "Encerrada em: AAAA-MM-DD, pelo Juno" e o "Atualizado em" do
dia, e move a pasta inteira para specs/done/ (criada se faltar). Não roda git: quem commita é o Juno.

As pendências versionadas fora das tasks (o "Ficou para depois" das tasks e as notas da lista do design) aparecem
na recusa e no caminho feliz. Com --listar, o script só mostra as tasks pendentes e essas pendências, sem mudar
nada, e sai com 0: é a consulta que a skill roda antes de propor o destino de cada item ao Juno (CA-39).

Saída: o que mudou e o caminho novo, ou "Encerrar spec recusado" com os problemas; exit 1 na recusa.

Uso: python3 finish_spec.py <pasta da spec> [--listar]
"""

import argparse
import shutil
import sys
from datetime import date
from pathlib import Path

from utils import get_project_root, read_text, relative_to_root, use_global_lib

use_global_lib()
import validate_spec  # noqa: E402  (precisa do sys.path ajustado acima)
from md_checks import (  # noqa: E402
    Leftover,
    SpecTask,
    pending_tasks,
    read_status,
    refusal_lines,
    set_metadata,
    set_updated_at,
    versioned_leftovers,
)

STATUS_PARA_ENCERRAR = "em andamento"
PASTA_DONE = "done"


def _task_line(tarefa: SpecTask) -> str:
    return f"{tarefa.numero} — {tarefa.titulo} ({tarefa.motivo})"


def _leftover_lines(sobras: list[Leftover], pasta: Path) -> list[str]:
    """Bloco das pendências versionadas, com o caminho relativo à pasta da spec e a linha."""
    if not sobras:
        return ["Pendências versionadas fora das tasks: nenhuma."]
    return [f"Pendências versionadas fora das tasks ({len(sobras)}; o Juno decide o destino de cada uma antes de "
            "encerrar):",
            *(f"- {s.arquivo.relative_to(pasta)}:{s.linha} [{s.origem}] {s.texto}" for s in sobras)]


def destination(pasta: Path) -> Path:
    """specs/done/<pasta>: a pasta done/ ao lado da pasta da spec."""
    return pasta.parent / PASTA_DONE / pasta.name


def _check(pasta: Path, texto: str, raiz: Path, pendentes: list[SpecTask]) -> list[str]:
    """O bloco inteiro: todos os problemas juntos."""
    problemas: list[str] = []
    status, _ = read_status(texto)
    if status != STATUS_PARA_ENCERRAR:
        problemas.append(f"status: a spec está `{status}`; o encerrar só aceita spec `{STATUS_PARA_ENCERRAR}`")

    for f in validate_spec.validate(pasta, raiz=raiz):
        if f.severidade == "erro":
            problemas.append(f"validador: {f}")

    problemas += [f"task pendente: {_task_line(t)}" for t in pendentes]

    destino = destination(pasta)
    if destino.exists():
        problemas.append(f"destino: {relative_to_root(destino, raiz)} já existe")
    return problemas


def list_pending(pasta: Path, raiz: Path) -> list[str]:
    """Saída do --listar: tasks pendentes e pendências versionadas; nada muda."""
    pendentes = pending_tasks(pasta)
    status, _ = read_status(read_text(pasta / "spec.md"))
    linhas = [f"Spec {relative_to_root(pasta, raiz)} (`{status}`): nada foi mudado."]
    if pendentes:
        linhas += [f"Tasks pendentes ({len(pendentes)}):", *(f"- {_task_line(t)}" for t in pendentes)]
    else:
        linhas.append("Tasks pendentes: nenhuma.")
    return linhas + _leftover_lines(versioned_leftovers(pasta), pasta)


def finish(pasta: Path, raiz: Path, hoje: date | None = None) -> tuple[int, list[str]]:
    """(exit, linhas da saída). `raiz` é o repositório (os testes passam uma pasta temporária)."""
    hoje = hoje or date.today()
    spec = pasta / "spec.md"
    texto = read_text(spec)
    nome = relative_to_root(pasta, raiz)
    sobras = _leftover_lines(versioned_leftovers(pasta), pasta)

    problemas = _check(pasta, texto, raiz, pending_tasks(pasta))
    if problemas:
        return 1, [*refusal_lines("Encerrar spec", f"a spec {nome}", problemas), "", *sobras]

    texto = set_metadata(texto, "Status", "`concluída`")
    texto = set_metadata(texto, validate_spec.ENCERRADA_EM, f"{hoje.isoformat()}, pelo Juno")
    texto = set_updated_at(texto, hoje, "concluída (aprovada pelo Juno)")
    spec.write_text(texto, encoding="utf-8")

    destino = destination(pasta)
    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(pasta), str(destino))
    return 0, [
        f"Spec encerrada: {nome}",
        f"- status `concluída`; Encerrada em: {hoje.isoformat()}, pelo Juno",
        f"- pasta movida para {relative_to_root(destino, raiz)}",
        "",
        *sobras,
    ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Encerra uma spec em andamento (depois da aprovação do Juno).")
    parser.add_argument("pasta_spec", type=Path, help="Caminho da pasta da spec.")
    parser.add_argument("--listar", action="store_true",
                        help="Só lista as tasks pendentes e as pendências versionadas, sem mudar nada.")
    args = parser.parse_args(argv)

    pasta: Path = args.pasta_spec.resolve()
    if not (pasta / "spec.md").is_file():
        raise SystemExit(f"Erro: o arquivo 'spec.md' não foi encontrado em '{args.pasta_spec}'.")

    raiz = get_project_root()
    if args.listar:
        print("\n".join(list_pending(pasta, raiz)))
        return 0
    codigo, linhas = finish(pasta, raiz)
    print("\n".join(linhas))
    return codigo


if __name__ == "__main__":
    sys.exit(main())
