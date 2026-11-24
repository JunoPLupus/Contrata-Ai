"""Comandos de git do fluxo de trabalho das tasks (o "iniciar"; depois, o "encerrar").

Só estes comandos, e nenhum outro: o que muda o repositório (`pull --ff-only`, `switch -c`) é a exceção da
regra de Git do AGENTS.md, restrita ao script do "iniciar". Cada função recebe a pasta do repositório (os
testes usam um repositório temporário).
"""

import subprocess
from pathlib import Path


def _git(repo: Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True)


def _saida(processo: subprocess.CompletedProcess) -> str:
    """stdout + stderr, sem linhas vazias nas pontas (o git escreve a causa de uma falha no stderr)."""
    return "\n".join(p.strip() for p in (processo.stdout, processo.stderr) if p.strip())


def pending_files(repo: Path) -> list[str]:
    """Arquivos alterados, novos (não ignorados) ou removidos, como o `git status --porcelain` os lista."""
    processo = _git(repo, "status", "--porcelain")
    if processo.returncode != 0:
        raise RuntimeError(_saida(processo))
    return [linha[3:] for linha in processo.stdout.splitlines() if linha.strip()]


def current_branch(repo: Path) -> str:
    """Nome da branch ativa ("" com HEAD destacado)."""
    processo = _git(repo, "branch", "--show-current")
    if processo.returncode != 0:
        raise RuntimeError(_saida(processo))
    return processo.stdout.strip()


def branch_exists(repo: Path, nome: str) -> bool:
    """A branch local `nome` existe."""
    return _git(repo, "rev-parse", "--verify", "--quiet", f"refs/heads/{nome}").returncode == 0


def pull_ff_only(repo: Path) -> tuple[bool, str]:
    """`git pull --ff-only`: (deu certo, mensagem do git). A falha (divergência, rede, autenticação) volta com
    a mensagem do próprio git, sem tradução."""
    processo = _git(repo, "pull", "--ff-only")
    return processo.returncode == 0, _saida(processo)


def switch_create(repo: Path, nome: str) -> None:
    """`git switch -c <nome>`: cria a branch a partir do HEAD e a deixa ativa."""
    processo = _git(repo, "switch", "-c", nome)
    if processo.returncode != 0:
        raise RuntimeError(_saida(processo))


def head_sha(repo: Path) -> str:
    """SHA curto (8) do HEAD."""
    processo = _git(repo, "rev-parse", "--short=8", "HEAD")
    if processo.returncode != 0:
        raise RuntimeError(_saida(processo))
    return processo.stdout.strip()
