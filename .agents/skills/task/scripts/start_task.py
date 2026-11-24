"""
O "iniciar" de uma task: rode só depois do "aprovado" do Juno na conversa.

Ordem (nada muda antes de todas as checagens passarem; cada bloco mostra todos os problemas dele):

1. Bloco da task: status `aberta` (CA-06); task de spec com a spec `aprovada` ou `em andamento` (CA-36);
   validate_task sem erro (CA-08); "Em aberto" igual a "nada" (CA-07).
2. Só com a task ok, bloco do repositório: árvore limpa (CA-09), na `main` (CA-10), branch da task ainda
   inexistente (CA-11).
3. `git pull --ff-only` (CA-12): a falha volta com a mensagem do git, e nada muda.
4. Governança na `main` atualizada: os achados viram a base de achados (CA-05); erro antigo não impede.
5. `git switch -c <branch>` a partir da `main` atualizada (o commit de base).
6. Task `em andamento`, Branch (só o nome), "Atualizado em" e duas entradas no Andamento: a aprovação, a
   branch e o commit de base; a base de achados num bloco ```text (ou "nenhum") (CA-05).
7. Spec `aprovada` → `em andamento` (primeira task; CA-36); spec já `em andamento` não muda.
8. Aviso de possível spec pela regra dos eixos do Impacto (CA-13): só avisa.

Nome da branch: `<tipo>/juno/<assunto>`; avulsa, o nome do arquivo sem a data; de spec, o assunto da spec (a
pasta sem a data) e o número da task (`-NN`).

Saída: o que foi feito, ou "Iniciar recusado" com os problemas do bloco; exit 1 na recusa.

Uso: python3 start_task.py <caminho da task>
"""

import argparse
import re
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
from governanca import format_base  # noqa: E402
from governanca import run as run_governanca  # noqa: E402
from md_checks import (  # noqa: E402
    Finding,
    add_progress_entry,
    format_spec_warning,
    open_items,
    read_metadata,
    read_status,
    set_metadata,
    set_updated_at,
)
from projeto import get_project_root, read_text, relative_to_root  # noqa: E402

MAIN = "main"
STATUS_SPEC_PARA_INICIAR = ("aprovada", "em andamento")
_DATA_NO_NOME = re.compile(r"^\d{4}-\d{2}-\d{2}-")
_NUMERO_NO_NOME = re.compile(r"^(\d{2})-")
_PRIMEIRO_CODIGO = re.compile(r"`([^`]+)`")

Governanca = Callable[[Path], list[Finding]]


def _spec_file(arquivo: Path) -> Path:
    """spec.md da task de spec: a pasta acima de tasks/."""
    return arquivo.parent.parent / "spec.md"


def branch_name(arquivo: Path, texto: str) -> str | None:
    """`<tipo>/juno/<assunto>` pelo padrão do design; None se faltar o tipo ou o NN do arquivo de spec."""
    tipo = _PRIMEIRO_CODIGO.search(read_metadata(texto, "Tipo") or "")
    if tipo is None:
        return None
    if vt.task_type(arquivo) == "avulsa":
        assunto = _DATA_NO_NOME.sub("", arquivo.stem)
    else:
        numero = _NUMERO_NO_NOME.match(arquivo.stem)
        if numero is None:
            return None
        assunto = f"{_DATA_NO_NOME.sub('', arquivo.parent.parent.name)}-{numero.group(1)}"
    return f"{tipo.group(1)}/juno/{assunto}"


# region Checagens de leitura (nada muda aqui)

def _check_task(arquivo: Path, texto: str, raiz: Path) -> list[str]:
    """Bloco da task: todos os problemas juntos."""
    problemas: list[str] = []
    status, _ = read_status(texto)
    if status != "aberta":
        problemas.append(f"status: a task está `{status}`; o iniciar só começa task `aberta`")

    if vt.task_type(arquivo) == "spec":
        spec = _spec_file(arquivo)
        if not spec.is_file():
            problemas.append(f"spec: {relative_to_root(spec, raiz)} não encontrado")
        else:
            status_spec, _ = read_status(read_text(spec))
            if status_spec not in STATUS_SPEC_PARA_INICIAR:
                problemas.append(f"spec: a spec está `{status_spec}`; task de spec só inicia com a spec "
                                 "`aprovada` ou `em andamento`")

    for f in vt.validate(arquivo, texto, raiz=raiz):
        if f.severidade == "erro":
            problemas.append(f"validador: {f}")

    for linha, item in open_items(texto, vt.SECAO_O_QUE_FAZER) or []:
        problemas.append(f"em aberto: {arquivo.name}:{linha} {item}")
    return problemas


def _check_repository(raiz: Path, branch: str) -> list[str]:
    """Bloco do repositório: todos os problemas juntos."""
    problemas: list[str] = []
    pendentes = git_fluxo.pending_files(raiz)
    if pendentes:
        problemas.append("árvore: mudanças pendentes (commite ou descarte antes): " + ", ".join(pendentes))
    atual = git_fluxo.current_branch(raiz)
    if atual != MAIN:
        problemas.append(f"branch: o repositório está em `{atual or 'HEAD destacado'}`; o iniciar parte da `{MAIN}`")
    if git_fluxo.branch_exists(raiz, branch):
        problemas.append(f"branch: `{branch}` já existe")
    return problemas

# endregion

# region O que muda (só depois das checagens)

def _base_entry(findings: list[Finding], raiz: Path) -> str:
    """Entrada do Andamento com a base de achados: o bloco ```text no formato do --salvar-base, ou "nenhum"."""
    if not findings:
        return "base de achados da governança: nenhum"
    return f"base de achados da governança ({len(findings)}):\n\n```text\n{format_base(findings, raiz).rstrip()}\n```"


def _started_task(texto: str, hoje: date, branch: str, sha: str, base: str) -> str:
    texto = set_metadata(texto, "Status", "`em andamento`")
    texto = set_metadata(texto, "Branch", f"`{branch}`")
    texto = set_updated_at(texto, hoje, "iniciada (aprovada pelo Juno)")
    texto = add_progress_entry(texto, vt.SECAO_ANDAMENTO, hoje,
                               f"iniciar: aprovada pelo Juno; branch `{branch}` criada a partir da `{MAIN}` "
                               f"no commit de base `{sha}`.")
    return add_progress_entry(texto, vt.SECAO_ANDAMENTO, hoje, base)


def _started_spec(texto: str, hoje: date, arquivo_task: Path) -> str:
    texto = set_metadata(texto, "Status", "`em andamento`")
    return set_updated_at(texto, hoje, f"em andamento: primeira task iniciada ({arquivo_task.name})")

# endregion


def start(arquivo: Path, raiz: Path, hoje: date | None = None,
          governanca: Governanca = run_governanca) -> tuple[int, list[str]]:
    """(exit, linhas da saída). `raiz` é o repositório; `governanca` devolve os achados (os testes injetam)."""
    hoje = hoje or date.today()
    texto = read_text(arquivo)
    nome = relative_to_root(arquivo, raiz)

    problemas = _check_task(arquivo, texto, raiz)
    if problemas:
        return 1, [f"Iniciar recusado: a task {nome} tem {len(problemas)} problema(s); nada foi mudado.",
                   *(f"- {p}" for p in problemas)]

    branch = branch_name(arquivo, texto)
    if branch is None:
        return 1, [f"Iniciar recusado: não deu para montar o nome da branch de {nome} (Tipo ou NN do arquivo)."]

    problemas = _check_repository(raiz, branch)
    if problemas:
        return 1, [f"Iniciar recusado: o repositório tem {len(problemas)} problema(s); nada foi mudado.",
                   *(f"- {p}" for p in problemas)]

    ok, mensagem = git_fluxo.pull_ff_only(raiz)
    if not ok:
        return 1, [f"Iniciar recusado: `git pull --ff-only` falhou; a branch não foi criada e a task não mudou.",
                   "Mensagem do git:", mensagem]

    sha = git_fluxo.head_sha(raiz)
    findings = governanca(raiz)
    git_fluxo.switch_create(raiz, branch)

    arquivo.write_text(_started_task(texto, hoje, branch, sha, _base_entry(findings, raiz)), encoding="utf-8")
    saida = [
        f"Task iniciada: {nome}",
        f"- `{MAIN}` atualizada (git pull --ff-only): {mensagem.splitlines()[0] if mensagem else 'ok'}",
        f"- branch `{branch}` criada a partir de `{sha}` e ativa",
        "- task `em andamento`, com a aprovação, a branch e o commit de base no Andamento",
        f"- base de achados da governança no Andamento: {len(findings)} achado(s) "
        f"({sum(f.severidade == 'erro' for f in findings)} erro(s) que já existiam)",
    ]

    if vt.task_type(arquivo) == "spec":
        spec = _spec_file(arquivo)
        texto_spec = read_text(spec)
        if read_status(texto_spec)[0] == "aprovada":
            spec.write_text(_started_spec(texto_spec, hoje, arquivo), encoding="utf-8")
            saida.append(f"- spec `em andamento` (primeira task): {relative_to_root(spec, raiz)}")

    aviso = format_spec_warning(vt.impact_spec_criteria(texto))
    if aviso:
        saida += ["", *aviso]
    return 0, saida


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Inicia uma task aprovada: confere, atualiza a main e cria a branch.")
    parser.add_argument("arquivo", type=Path, help="Caminho do arquivo da task (.md).")
    args = parser.parse_args(argv)

    arquivo: Path = args.arquivo.resolve()
    if not arquivo.is_file():
        raise SystemExit(f"Erro: o arquivo '{args.arquivo}' não foi encontrado.")

    codigo, linhas = start(arquivo, get_project_root())
    print("\n".join(linhas))
    return codigo


if __name__ == "__main__":
    sys.exit(main())
