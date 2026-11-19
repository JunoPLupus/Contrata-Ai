"""Referências das instruções: links e caminhos citados, comandos `python3` e skills citadas.

Migradas do antigo verificador geral sem mudar o que acusam. Rodam só nas instruções (ver coleta.py):
tasks e specs são conferidas pelos validadores das skills `task` e `spec`.
"""
import re
from pathlib import Path

from coleta import existing_skills, is_template, skill_dir
from md_checks import Finding, aviso, check_links, erro, find_paths
from md_utils import line_of


# region Links e caminhos citados

def _top_dirs(raiz: Path) -> set[str]:
    """Primeiros segmentos que marcam um caminho como relativo à raiz (.agents, api, docs, web…)."""
    return {p.name for p in raiz.iterdir() if p.is_dir() and p.name != ".git"}


def path_exists(caminho: str, arquivo: Path, raiz: Path) -> bool | None:
    """True/False se o caminho é conferível; None se é ambíguo e fica de fora.

    - './' e '../': relativo à pasta do arquivo;
    - primeiro segmento é pasta da raiz (.agents/, api/, docs/…): relativo à raiz (ou ao arquivo);
    - outro relativo ('evals/checks.py', '2026-11-20-x/tasks/01-y.md'): costuma ser padrão genérico ou
      exemplo; só é conferido dentro de uma skill, contra a pasta da skill e a do arquivo.
    """
    primeiro = caminho.split("/")[0]
    if primeiro in (".", ".."):
        return (arquivo.parent / caminho).exists()
    if primeiro in _top_dirs(raiz):
        return (raiz / caminho).exists() or (arquivo.parent / caminho).exists()
    skill = skill_dir(arquivo, raiz)
    if skill is None:
        return None
    return (skill / caminho).exists() or (arquivo.parent / caminho).exists()


_DESTINO_LINK = re.compile(r"\]\([^)\n]*\)")


def check_refs(arquivo: Path, texto: str, raiz: Path) -> list[Finding]:
    """Links relativos (fora de código) e caminhos citados a partir da raiz ou com './' '../' existem.

    Fora da checagem: modelos (docs/templates/), cujos links apontam para onde a cópia vai morar, e os
    caminhos (não os links) do ORIGEM.md, que citam arquivos do repositório de origem da skill."""
    if is_template(arquivo, raiz):
        return []
    findings = check_links(arquivo, texto, raiz)
    if arquivo.name == "ORIGEM.md":
        return findings
    # Destino de link já foi conferido por check_links: some daqui para não sair em dobro.
    sem_destinos = _DESTINO_LINK.sub(lambda m: " " * len(m.group(0)), texto)
    for caminho, pos in find_paths(sem_destinos):
        caminho = caminho.lstrip("[")  # '[ref/x.md](ref/x.md)': o '[' do texto do link entra no casamento
        if caminho.split("/")[0] not in (".", "..") and caminho.split("/")[0] not in _top_dirs(raiz):
            continue
        if not path_exists(caminho, arquivo, raiz):
            findings.append(erro(arquivo, line_of(texto, pos), f"caminho: não existe: {caminho}"))
    return findings

# endregion

# region Comandos python3

_PYTHON = re.compile(r"python3\s+(?:-m\s+unittest\s+discover\s+-s\s+(?P<pasta>[^\s`]+)|(?P<script>[^\s`]+\.py))")
_PASTA_DA_SKILL = "<pasta-desta-skill>"


def check_python_commands(arquivo: Path, texto: str, raiz: Path) -> list[Finding]:
    """Todo `python3 x.py` e `python3 -m unittest discover -s pasta` aponta para algo que existe.
    '<pasta-desta-skill>' vale a pasta da skill do arquivo; outro <placeholder> no caminho é ignorado."""
    findings: list[Finding] = []
    skill = skill_dir(arquivo, raiz)
    for comando in _PYTHON.finditer(texto):
        caminho = comando.group("pasta") or comando.group("script")
        if caminho.startswith(_PASTA_DA_SKILL) and skill is not None:
            destino_ok = (skill / caminho[len(_PASTA_DA_SKILL):].lstrip("/")).exists()
        elif "<" in caminho:
            continue
        else:
            destino_ok = path_exists(caminho, arquivo, raiz)
            if destino_ok is None:
                continue
        if not destino_ok:
            findings.append(erro(arquivo, line_of(texto, comando.start()), f"comando: alvo não existe: {caminho}"))
    return findings

# endregion

# region Skills citadas que não existem

# skill `nome`, skills `nome`, skill de `nome` e links/caminhos .agents/skills/nome/
_SKILL_CITADA = re.compile(
    r"\bskills?\s+(?:d[eao]\s+)?`([a-z][a-z0-9-]*)`"
    r"|\.agents/skills/([a-z][a-z0-9-]*)/"
)


def check_cited_skills(arquivo: Path, texto: str, raiz: Path) -> list[Finding]:
    """Skill citada sem pasta em .agents/skills/ vira AVISO de pendência (pode ser uma skill futura)."""
    existentes = existing_skills(raiz)
    findings: list[Finding] = []
    for citacao in _SKILL_CITADA.finditer(texto):
        nome = next(g for g in citacao.groups() if g)
        if nome not in existentes:
            findings.append(aviso(arquivo, line_of(texto, citacao.start()),
                                  f"pendência: skill '{nome}' citada, ainda não existe"))
    return findings

# endregion
