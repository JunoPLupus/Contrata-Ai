"""Texto das instruções que o agente segue: placeholder esquecido e comando sem `rtk`.

Valem para os documentos canônicos (coleta.canonical_docs): AGENTS.md, .agents/README.md, guias e os .md
das skills. Os modelos ficam de fora (o placeholder é de propósito), e tasks e specs são dos validadores.
"""
import re
from pathlib import Path

from md_checks import Finding, check_placeholders, erro
from md_utils import line_of


# region Placeholder esquecido

def check_canonical_placeholders(arquivo: Path, texto: str) -> list[Finding]:
    """Comentário do modelo, <placeholder> ou data AAAA-MM-DD fora de código: a mesma detecção que os
    validadores de task e spec usam (o que está em código é exemplo e não conta)."""
    return check_placeholders(arquivo, texto)

# endregion

# region Comando sem rtk

_BLOCO = re.compile(r"^([ \t]*)```(bash|sh)[ \t]*\n(.*?)^[ \t]*```", re.MULTILINE | re.DOTALL)
SEM_RTK = re.compile(r"#[ \t]*sem rtk:[ \t]*\S")


def check_rtk(arquivo: Path, texto: str) -> list[Finding]:
    """Todo comando de um bloco ```bash/```sh começa com `rtk `.

    Exceção (processo longo ou interativo, que não termina sozinho): um comentário `# sem rtk: motivo` no
    próprio bloco. Comentários, linhas vazias e continuações de linha (depois de `\\`) não são comandos.
    """
    findings: list[Finding] = []
    for bloco in _BLOCO.finditer(texto):
        corpo = bloco.group(3)
        if SEM_RTK.search(corpo):
            continue
        continuacao = False
        inicio = bloco.start(3)
        for linha in corpo.splitlines(keepends=True):
            comando = linha.strip()
            eh_continuacao, continuacao = continuacao, comando.endswith("\\")
            if comando and not comando.startswith("#") and not eh_continuacao and not comando.startswith("rtk "):
                findings.append(erro(arquivo, line_of(texto, inicio), "governanca.rtk",
                                     f"rtk: comando sem o prefixo `rtk`: {comando.rstrip(chr(92)).strip()}"))
            inicio += len(linha)
    return findings

# endregion
