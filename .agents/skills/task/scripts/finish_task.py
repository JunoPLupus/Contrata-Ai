"""
O "encerrar" e o "cancelar" de uma task: rode só depois da aprovação do Juno na conversa (o "aprovado" do
fechamento, ou o pedido de cancelar com o motivo).

Encerrar (`finish_task.py <task>`), bloco único de checagens (CA-15):

- status `em andamento`;
- validate_task sem erro no texto já encerrado (status `concluída`, como o `--fechar`: rótulo vazio e critério
  sem evidência são erro);
- a base de achados do "iniciar" no Andamento ("nenhum" é base vazia válida) e a governança sem erro novo em
  relação a ela (erro antigo só é informado);
- a branch ativa é a do campo Branch da task (só leitura do git);
- avulsa: o destino, tasks/done/<arquivo>, ainda não existe.

Com tudo ok (CA-16): status `concluída`, "Atualizado em" e uma entrada no Andamento, com a data do dia; a avulsa
tem o caminho reescrito nas listas "Arquivos:" de "Commits entregues" e vai para tasks/done/ (criada se faltar);
a de spec fica na pasta.

Cancelar (`finish_task.py <task> --cancelar "motivo"`), bloco único: status `aberta`, `bloqueada` ou
`em andamento`; motivo não vazio; avulsa: destino livre; de spec: o item NN na lista "## 6. Tasks" do design,
ainda não riscado, e a linha "Atualizado em" do design. Sem validador, governança nem branch (não há implementação a conferir; task de spec cancelada
sem branch é commitada na `main`). Com tudo ok: status `cancelada`, "Atualizado em" e Andamento com o motivo; a
avulsa vai para tasks/done/ (CA-34); a de spec fica na pasta e o item dela no design fica riscado, com a data e
o motivo, e o "Atualizado em" do design ganha a data e o motivo (CA-38; Q1 da implementação).

Task de spec, nos dois usos: sem outra pendência na spec (contada depois de gravar, com a própria task já
fechada), a saída avisa que a spec pode ser encerrada nesta branch (CA-37, CA-38).

Não roda git que mude o repositório: quem commita é o Juno. Saída: o que mudou, ou "Encerrar recusado" /
"Cancelar recusado" com todos os problemas do bloco; exit 1 na recusa, e nada muda.

Uso: python3 finish_task.py <caminho da task> [--cancelar "motivo"]
"""

import argparse
import shutil
import sys
from datetime import date
from pathlib import Path
from typing import Callable

_AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(_AQUI.parents[2] / "scripts" / "lib"))
sys.path.insert(0, str(_AQUI.parents[1] / "governanca" / "scripts"))
sys.path.insert(0, str(_AQUI))
import git_fluxo  # noqa: E402  (precisa do sys.path ajustado acima)
import validate_task as vt  # noqa: E402
from governanca import compare, format_comparison, format_finding, read_base  # noqa: E402
from governanca import run as run_governanca  # noqa: E402
from md_checks import (  # noqa: E402
    SECAO_FECHAMENTO_TASK,
    SECAO_TASKS,
    Finding,
    add_progress_entry,
    pending_tasks,
    progress_base,
    read_metadata,
    read_status,
    refusal_lines,
    rewrite_commit_paths,
    set_metadata,
    set_updated_at,
    strike_task_item,
)
from projeto import get_project_root, read_text, relative_to_root  # noqa: E402

STATUS_PARA_ENCERRAR = "em andamento"
STATUS_PARA_CANCELAR = ("aberta", "bloqueada", "em andamento")
PASTA_DONE = "done"

Governanca = Callable[[Path], list[Finding]]
BranchAtiva = Callable[[Path], str]


def destination(arquivo: Path) -> Path:
    """tasks/done/<arquivo>: a pasta done/ ao lado da task avulsa."""
    return arquivo.parent / PASTA_DONE / arquivo.name


def _design(arquivo: Path) -> Path:
    """design.md da task de spec: a pasta acima de tasks/."""
    return arquivo.parent.parent / "design.md"


def _numero(arquivo: Path) -> str:
    """NN do nome do arquivo da task de spec ("" se faltar)."""
    return arquivo.name[:2] if arquivo.name[:2].isdigit() else ""


def _task_branch(texto: str) -> str:
    """Nome da branch do campo Branch (o que está entre crases), ou o valor como veio."""
    valor = read_metadata(texto, "Branch") or ""
    return valor.split("`")[1] if valor.count("`") >= 2 else valor


def _status_problem(texto: str, aceitos: tuple[str, ...], acao: str) -> list[str]:
    status, _ = read_status(texto)
    if status in aceitos:
        return []
    return [f"status: a task está `{status}`; o {acao} só aceita task " + " ou ".join(f"`{s}`" for s in aceitos)]


def _destination_problem(arquivo: Path, raiz: Path) -> list[str]:
    destino = destination(arquivo)
    return [f"destino: {relative_to_root(destino, raiz)} já existe"] if destino.exists() else []


def _last_pending_lines(arquivo: Path, sem_branch: bool) -> list[str]:
    """Aviso de última pendência da spec (só task de spec): contado depois de gravar, com a própria task já
    fechada. [] com outra pendência. `sem_branch`: a task foi cancelada antes de iniciar."""
    if vt.task_type(arquivo) != "spec" or pending_tasks(arquivo.parent.parent):
        return []
    onde = ("A task não tinha branch (cancelada antes de iniciar): o commit vai para a `main`." if sem_branch
            else "Na branch desta task.")
    return ["", "Última pendência da spec: nenhuma outra task ficou aberta. A spec pode ser encerrada agora, com a "
                "aprovação do Juno, pela seção 7 da skill `spec` (finish_spec.py), entrando nos mesmos textos de commit. "
                + onde]


def _write_and_move(arquivo: Path, texto: str, raiz: Path) -> tuple[Path, list[str]]:
    """Grava a task; a avulsa vai para tasks/done/. Devolve o caminho final e as linhas da saída."""
    arquivo.write_text(texto, encoding="utf-8")
    if vt.task_type(arquivo) != "avulsa":
        return arquivo, [f"- continua na pasta da spec: {relative_to_root(arquivo, raiz)}"]
    destino = destination(arquivo)
    destino.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(arquivo), str(destino))
    return destino, [f"- movida para {relative_to_root(destino, raiz)}"]


# region Encerrar

def _closed_text(texto: str, hoje: date, antigos: int) -> str:
    """O texto encerrado (nada é gravado aqui): status, "Atualizado em" e a entrada no Andamento."""
    texto = set_metadata(texto, "Status", "`concluída`")
    texto = set_updated_at(texto, hoje, "concluída (aprovada pelo Juno)")
    return add_progress_entry(texto, vt.SECAO_ANDAMENTO, hoje,
                              f"encerrada: aprovada pelo Juno; governança sem erro novo ({antigos} antigos).")


def finish(arquivo: Path, raiz: Path, hoje: date | None = None, governanca: Governanca = run_governanca,
           branch_ativa: BranchAtiva = git_fluxo.current_branch) -> tuple[int, list[str]]:
    """Encerrar: (exit, linhas da saída). `governanca` e `branch_ativa` leem o repositório (os testes injetam)."""
    hoje = hoje or date.today()
    texto = read_text(arquivo)
    nome = relative_to_root(arquivo, raiz)

    problemas = _status_problem(texto, (STATUS_PARA_ENCERRAR,), "encerrar")

    comparacao = None
    base = progress_base(texto, vt.SECAO_ANDAMENTO)
    if base is None:
        problemas.append("base: sem base de achados da governança no Andamento (o \"iniciar\" grava a entrada "
                         "\"base de achados da governança\"); sem ela não dá para separar erro novo de antigo")
    else:
        try:
            comparacao = compare(read_base(base), governanca(raiz), raiz)
        except ValueError as e:
            problemas.append(f"base: {e}")
    if comparacao is not None:
        problemas += [f"governança, erro novo: {format_finding(f, raiz)}" for f in comparacao.erros_novos]

    try:
        encerrado = _closed_text(texto, hoje, len(comparacao.antigos) if comparacao else 0)
    except ValueError as e:  # linha de metadado ou Andamento ausente
        encerrado = None
        problemas.append(f"task: {e}")
    if encerrado is not None:
        problemas += [f"validador: {f}" for f in vt.validate(arquivo, encerrado, fechar=True, raiz=raiz)
                      if f.severidade == "erro"]

    da_task, ativa = _task_branch(texto), branch_ativa(raiz)
    if ativa != da_task:
        problemas.append(f"branch: branch ativa `{ativa or 'HEAD destacado'}`; a task é da `{da_task}`")

    avulsa = vt.task_type(arquivo) == "avulsa"
    if avulsa:
        problemas += _destination_problem(arquivo, raiz)

    if problemas:
        return 1, refusal_lines("Encerrar", f"a task {nome}", problemas)

    saida = [f"Task encerrada: {nome}", "- status `concluída`, com \"Atualizado em\" e a entrada no Andamento"]
    if avulsa:
        antigo = relative_to_root(arquivo, raiz).as_posix()
        novo = relative_to_root(destination(arquivo), raiz).as_posix()
        encerrado, trocas = rewrite_commit_paths(encerrado, SECAO_FECHAMENTO_TASK, antigo, novo)
        saida.append(f"- caminho reescrito nos \"Commits entregues\": {trocas} item(ns) de \"Arquivos:\" "
                     f"agora com {novo}")
    _, linhas = _write_and_move(arquivo, encerrado, raiz)
    saida += linhas
    saida += ["", "Governança comparada com a base do Andamento:", format_comparison(comparacao, raiz)]
    return 0, saida + _last_pending_lines(arquivo, sem_branch=False)

# endregion

# region Cancelar

def _cancelled_text(texto: str, hoje: date, motivo: str) -> str:
    texto = set_metadata(texto, "Status", "`cancelada`")
    texto = set_updated_at(texto, hoje, f"cancelada pelo Juno: {motivo}")
    return add_progress_entry(texto, vt.SECAO_ANDAMENTO, hoje, f"cancelada pelo Juno: {motivo}")


def cancel(arquivo: Path, raiz: Path, motivo: str, hoje: date | None = None) -> tuple[int, list[str]]:
    """Cancelar: (exit, linhas da saída)."""
    hoje = hoje or date.today()
    motivo = " ".join(motivo.split())
    texto = read_text(arquivo)
    nome = relative_to_root(arquivo, raiz)

    status, _ = read_status(texto)
    problemas = _status_problem(texto, STATUS_PARA_CANCELAR, "cancelar")
    if not motivo:
        problemas.append("motivo: vazio; o cancelamento registra o motivo do Juno (--cancelar \"motivo\")")

    cancelado = None
    try:
        cancelado = _cancelled_text(texto, hoje, motivo)
    except ValueError as e:
        problemas.append(f"task: {e}")

    avulsa = vt.task_type(arquivo) == "avulsa"
    design, design_riscado = _design(arquivo), None
    if avulsa:
        problemas += _destination_problem(arquivo, raiz)
    elif not design.is_file():
        problemas.append(f"design: {relative_to_root(design, raiz)} não encontrado")
    else:
        try:
            design_riscado = set_updated_at(strike_task_item(read_text(design), _numero(arquivo), hoje, motivo), hoje,
                                            f"task {_numero(arquivo)} cancelada: {motivo}")
        except ValueError as e:
            problemas.append(f"design: {e} de {relative_to_root(design, raiz)}")

    if problemas:
        return 1, refusal_lines("Cancelar", f"a task {nome}", problemas)

    saida = [f"Task cancelada: {nome}", "- status `cancelada`, com o motivo no \"Atualizado em\" e no Andamento"]
    _, linhas = _write_and_move(arquivo, cancelado, raiz)
    saida += linhas
    if design_riscado is not None:
        design.write_text(design_riscado, encoding="utf-8")
        saida.append(f"- item {_numero(arquivo)} riscado na lista \"## {SECAO_TASKS}\" de "
                     f"{relative_to_root(design, raiz)}, com a data e o motivo, e o \"Atualizado em\" do design")
    return 0, saida + _last_pending_lines(arquivo, sem_branch=status in ("aberta", "bloqueada"))

# endregion


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Encerra (ou cancela) uma task, depois da aprovação do Juno.")
    parser.add_argument("arquivo", type=Path, help="Caminho do arquivo da task (.md).")
    parser.add_argument("--cancelar", metavar="MOTIVO",
                        help="Cancela a task (aberta, bloqueada ou em andamento) com o motivo do Juno.")
    args = parser.parse_args(argv)

    arquivo: Path = args.arquivo.resolve()
    if not arquivo.is_file():
        raise SystemExit(f"Erro: o arquivo '{args.arquivo}' não foi encontrado.")

    raiz = get_project_root()
    if args.cancelar is not None:
        codigo, linhas = cancel(arquivo, raiz, args.cancelar)
    else:
        codigo, linhas = finish(arquivo, raiz)
    print("\n".join(linhas))
    return codigo


if __name__ == "__main__":
    sys.exit(main())
