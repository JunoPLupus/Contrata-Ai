"""Quais arquivos entram em cada checagem da governança, e o que cada um é (instrução, task, spec).

Três grupos:

- **instruções** (`AGENTS.md`, `.agents/README.md`, guias, modelos e os .md das skills): conferidas pela
  própria governança (links, caminhos, comandos, placeholders, `rtk`);
- **tasks e specs** (`.agents/docs/tasks/` e `.agents/docs/specs/`): o conteúdo é dos validadores das skills
  `task` e `spec`; a governança só confere lugar × status e duplicatas, e roda os validadores nas vivas;
- **fora**: `*-workspace/` (saídas de rodadas), `testes/` e `evals/files/` (exemplos quebrados de propósito).
"""
import re
from pathlib import Path

from md_checks import read_status

_PASTAS_FORA = ("testes", "files", "__pycache__")

TASK_VIVA = ("aberta", "bloqueada", "em andamento")
SPEC_VIVA = ("rascunho", "aprovada", "em andamento")
FECHADO = ("concluída", "cancelada", "substituída")


def collect_md(raiz: Path) -> list[Path]:
    """AGENTS.md + .md de .agents/, sem *-workspace/, scripts/testes/, evals/files/ e __pycache__/."""
    arquivos = [raiz / "AGENTS.md"] if (raiz / "AGENTS.md").exists() else []
    for md in sorted((raiz / ".agents").rglob("*.md")):
        partes = md.relative_to(raiz / ".agents").parts[:-1]
        if any(p.endswith("-workspace") or p in _PASTAS_FORA for p in partes):
            continue
        arquivos.append(md)
    return arquivos


def docs_dir(raiz: Path) -> Path:
    return raiz / ".agents" / "docs"


def is_record(arquivo: Path, raiz: Path) -> bool:
    """Task ou spec (qualquer .md em docs/tasks/ ou docs/specs/): o conteúdo é dos validadores das skills."""
    for pasta in ("tasks", "specs"):
        try:
            arquivo.relative_to(docs_dir(raiz) / pasta)
            return True
        except ValueError:
            continue
    return False


def is_template(arquivo: Path, raiz: Path) -> bool:
    return arquivo.parent == docs_dir(raiz) / "templates"


def instructions(raiz: Path) -> list[Path]:
    """Os .md que a governança confere por conta própria: tudo o que não é task nem spec."""
    return [md for md in collect_md(raiz) if not is_record(md, raiz)]


def canonical_docs(raiz: Path) -> list[Path]:
    """Instruções que o agente segue (sem os modelos, que têm placeholder de propósito)."""
    return [md for md in instructions(raiz) if not is_template(md, raiz)]


def skill_dir(arquivo: Path, raiz: Path) -> Path | None:
    """Pasta da skill que contém `arquivo` (.agents/skills/<nome>/), ou None."""
    try:
        partes = arquivo.relative_to(raiz / ".agents" / "skills").parts
    except ValueError:
        return None
    return raiz / ".agents" / "skills" / partes[0] if len(partes) > 1 else None


def existing_skills(raiz: Path) -> set[str]:
    return {p.parent.name for p in (raiz / ".agents" / "skills").glob("*/SKILL.md")}


# region Tasks e specs

def _md_sem_fora(pasta: Path) -> list[Path]:
    return sorted(p for p in pasta.glob("*.md") if p.is_file()) if pasta.is_dir() else []


def loose_tasks(raiz: Path) -> list[Path]:
    """Tasks avulsas fora de done/."""
    return _md_sem_fora(docs_dir(raiz) / "tasks")


def done_tasks(raiz: Path) -> list[Path]:
    """Tasks avulsas em done/ (inclusive em subpastas, se um dia existirem)."""
    pasta = docs_dir(raiz) / "tasks" / "done"
    return sorted(pasta.rglob("*.md")) if pasta.is_dir() else []


def spec_dirs(raiz: Path) -> list[Path]:
    """Pastas de spec fora de done/ (as que têm spec.md)."""
    pasta = docs_dir(raiz) / "specs"
    if not pasta.is_dir():
        return []
    return sorted(p for p in pasta.iterdir() if p.is_dir() and p.name != "done" and (p / "spec.md").exists())


def done_spec_dirs(raiz: Path) -> list[Path]:
    pasta = docs_dir(raiz) / "specs" / "done"
    return sorted(p for p in pasta.iterdir() if p.is_dir()) if pasta.is_dir() else []


def spec_tasks(pasta_spec: Path) -> list[Path]:
    return _md_sem_fora(pasta_spec / "tasks")


def status_of(arquivo: Path) -> str | None:
    return read_status(arquivo.read_text(encoding="utf-8"))[0]


_BRANCH = re.compile(r"^[ \t]*-?[ \t]*\*\*Branch:\*\*[ \t]*`([^`<>\n]+)`", re.MULTILINE)


def has_branch(texto: str) -> bool:
    """A linha **Branch:** tem um nome entre crases (sem placeholder)."""
    return _BRANCH.search(texto) is not None

# endregion
