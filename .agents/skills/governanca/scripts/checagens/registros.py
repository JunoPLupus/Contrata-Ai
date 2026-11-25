"""Tasks e specs: lugar × status, duplicatas e os validadores das vivas.

A governança não tem regra de conteúdo própria para tasks e specs: o conteúdo das vivas é conferido pelos
validadores das skills `task` e `spec` (importados aqui, a mensagem sai idêntica), e o das fechadas não é
conferido (são registro do que aconteceu). Aqui ficam só as regras do conjunto: onde cada uma mora.
"""
from pathlib import Path
from typing import Callable

from coleta import (
    SPEC_VIVA,
    TASK_VIVA,
    done_spec_dirs,
    done_tasks,
    has_branch,
    loose_tasks,
    spec_dirs,
)
from md_checks import TASK_FECHADA, Finding, erro, spec_tasks, status_of
from projeto import read_text
from skills import load_script

_SPEC_FECHADA = ("concluída", "cancelada", "substituída")


def _rel(caminho: Path, raiz: Path) -> str:
    try:
        return str(caminho.relative_to(raiz))
    except ValueError:
        return str(caminho)


def _status_txt(status: str | None) -> str:
    return f"`{status}`" if status else "sem status"


def all_tasks(raiz: Path) -> list[Path]:
    """Todas as tasks fora de done/: avulsas e de spec (inclusive das specs em specs/done/)."""
    tarefas = list(loose_tasks(raiz))
    for pasta in [*spec_dirs(raiz), *done_spec_dirs(raiz)]:
        tarefas += spec_tasks(pasta)
    return tarefas


# region Lugar × status

def check_place_status(raiz: Path) -> list[Finding]:
    """Status que não bate com a pasta, e task `em andamento` sem branch."""
    findings: list[Finding] = []
    for task in done_tasks(raiz):
        status = status_of(task)
        if status not in TASK_FECHADA:
            findings.append(erro(task, 1, "governanca.lugar-task-em-done", f"lugar: task em done/ com status {_status_txt(status)} "
                                          f"(em done/ só `concluída` ou `cancelada`)"))
    for task in loose_tasks(raiz):
        status = status_of(task)
        if status in TASK_FECHADA:
            findings.append(erro(task, 1, "governanca.lugar-avulsa-fechada", f"lugar: task avulsa `{status}` fora de done/ "
                                          f"(mova para .agents/docs/tasks/done/)"))
    for pasta in done_spec_dirs(raiz):
        spec = pasta / "spec.md"
        status = status_of(spec) if spec.exists() else None
        if status not in _SPEC_FECHADA:
            findings.append(erro(spec, 1, "governanca.lugar-spec-em-done", f"lugar: spec em specs/done/ com status {_status_txt(status)} "
                                          f"(em done/ só `concluída`, `cancelada` ou `substituída`)"))
    for task in [*all_tasks(raiz), *done_tasks(raiz)]:
        texto = read_text(task)
        if status_of(task) == "em andamento" and not has_branch(texto):
            findings.append(erro(task, 1, "governanca.lugar-sem-branch", "lugar: task `em andamento` sem branch preenchida"))
    return findings

# endregion

# region Duplicatas

def check_duplicates(raiz: Path) -> list[Finding]:
    """A mesma task (nome do arquivo) ou spec (nome da pasta) entre as abertas e entre as concluídas."""
    findings: list[Finding] = []
    concluidas = {t.name: t for t in done_tasks(raiz)}
    for task in loose_tasks(raiz):
        if task.name in concluidas:
            findings.append(erro(task, 1, "governanca.duplicata-task", f"duplicata: a mesma task está em {_rel(task, raiz)} "
                                          f"e em {_rel(concluidas[task.name], raiz)}"))
    specs_concluidas = {p.name: p for p in done_spec_dirs(raiz)}
    for pasta in spec_dirs(raiz):
        if pasta.name in specs_concluidas:
            findings.append(erro(pasta / "spec.md", 1, "governanca.duplicata-spec", f"duplicata: a mesma spec está em {_rel(pasta, raiz)}/ "
                                                       f"e em {_rel(specs_concluidas[pasta.name], raiz)}/"))
    return findings

# endregion

# region Validadores das vivas

ValidaTask = Callable[..., list[Finding]]
ValidaSpec = Callable[..., list[Finding]]


def load_validators(raiz: Path) -> tuple[ValidaTask, ValidaSpec]:
    """O validate() de cada validador, importado do script da skill (fonte única das regras de conteúdo)."""
    skills = raiz / ".agents" / "skills"
    task = load_script(skills / "task" / "scripts" / "validate_task.py")
    spec = load_script(skills / "spec" / "scripts" / "validate_spec.py")
    return task.validate, spec.validate


def check_live_records(raiz: Path, validar_task: ValidaTask, validar_spec: ValidaSpec) -> list[Finding]:
    """Roda o validador de cada task viva e de cada pasta de spec viva e junta os achados, sem mudar nada."""
    findings: list[Finding] = []
    for pasta in spec_dirs(raiz):
        if status_of(pasta / "spec.md") in SPEC_VIVA:
            findings += validar_spec(pasta, raiz=raiz)
    for task in all_tasks(raiz):
        if status_of(task) in TASK_VIVA:
            findings += validar_task(task, raiz=raiz)
    return findings

# endregion
