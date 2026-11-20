"""O conjunto de skills: tabela do AGENTS.md, cabeçalho de cada SKILL.md e seções que os validadores esperam
nos modelos. Migradas do antigo verificador geral sem mudar o que acusam."""
import importlib.util
import re
import sys
from pathlib import Path
from typing import Callable

from coleta import existing_skills
from md_checks import Finding, aviso, erro, section_titles
from md_utils import line_of
from projeto import read_text


def load_script(caminho: Path):
    """Importa um script de skill pelo caminho, com a pasta dele no sys.path (para os imports locais)."""
    sys.path.insert(0, str(caminho.parent))
    try:
        spec = importlib.util.spec_from_file_location(f"_governanca_{caminho.parent.parent.name}_{caminho.stem}", caminho)
        modulo = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(modulo)
        return modulo
    finally:
        sys.path.remove(str(caminho.parent))


# region Tabela de skills do AGENTS.md

_LINHA_SKILL = re.compile(r"^\|.*\|\s*\[`?([\w-]+)`?\]\(([^)\s]+)\)\s*\|\s*$", re.MULTILINE)


def check_skill_table(arquivo: Path, texto: str, raiz: Path) -> list[Finding]:
    """Toda skill com SKILL.md tem linha na tabela de '## Skills' e toda linha aponta para um SKILL.md real."""
    secao = re.search(r"^## Skills\s*$([\s\S]*?)(?=^## |\Z)", texto, re.MULTILINE)
    if secao is None:
        return [erro(arquivo, 1, "governanca.skills-secao-ausente", "skills: seção '## Skills' não encontrada")]

    findings: list[Finding] = []
    na_tabela: set[str] = set()
    for linha in _LINHA_SKILL.finditer(texto, secao.start(1), secao.end(1)):
        nome, alvo = linha.group(1), linha.group(2)
        destino = (arquivo.parent / alvo).resolve()
        numero = line_of(texto, linha.start())
        if destino.name != "SKILL.md" or not destino.exists():
            findings.append(erro(arquivo, numero, "governanca.skills-linha-invalida", f"skills: linha '{nome}' não aponta para um SKILL.md existente: {alvo}"))
        else:
            na_tabela.add(destino.parent.name)

    for faltando in sorted(existing_skills(raiz) - na_tabela):
        findings.append(erro(arquivo, line_of(texto, secao.start()), "governanca.skills-sem-linha",
                             f"skills: .agents/skills/{faltando}/SKILL.md sem linha na tabela"))
    return findings

# endregion

# region Seções dos modelos

def load_expected_sections(raiz: Path) -> dict[str, tuple[str, ...]]:
    """Modelo → títulos de seção (começo do título) que os validadores esperam. Uma só fonte: os validadores."""
    skills = raiz / ".agents" / "skills"
    spec = load_script(skills / "spec" / "scripts" / "validate_spec.py")
    task = load_script(skills / "task" / "scripts" / "validate_task.py")
    return {
        **spec._SECOES_OBRIGATORIAS,
        "task.md": task._SECOES_SEMPRE,
    }


def check_template_sections(raiz: Path, esperadas: dict[str, tuple[str, ...]]) -> list[Finding]:
    """Cada modelo de .agents/docs/templates/ tem um '## ' que começa com cada título esperado."""
    findings: list[Finding] = []
    pasta = raiz / ".agents" / "docs" / "templates"
    for nome, titulos in esperadas.items():
        modelo = pasta / nome
        if not modelo.exists():
            findings.append(erro(modelo, 1, "governanca.modelo-ausente", "modelo: arquivo não existe"))
            continue
        presentes = [m.group(1) for m in section_titles(read_text(modelo))]
        for titulo in titulos:
            if not any(p.startswith(titulo) for p in presentes):
                findings.append(erro(modelo, 1, "governanca.modelo-secao-ausente", f"modelo: falta a seção '## {titulo}' que o validador espera"))
    return findings

# endregion

# region Cabeçalho das skills

Validador = Callable[[Path], tuple[bool, str]]


def load_skill_validator(raiz: Path) -> Validador | None:
    """validate_skill do quick_validate da oficina (fonte única das regras do cabeçalho); None sem pyyaml."""
    try:
        return load_script(raiz / ".agents" / "skills" / "oficina-de-skills" / "scripts" / "quick_validate.py").validate_skill
    except ImportError:
        return None


def check_skill_headers(raiz: Path, validar: Validador | None) -> list[Finding]:
    """Cada .agents/skills/*/SKILL.md com cabeçalho válido. Um cabeçalho quebrado (YAML inválido, campo
    faltando) deixa a skill invisível para ferramentas que leem a description, sem aviso nenhum."""
    skills = sorted((raiz / ".agents" / "skills").glob("*/SKILL.md"))
    if validar is None:
        return [aviso(skill, 1, "governanca.cabecalho-sem-pyyaml", "cabeçalho: não conferido, falta o pyyaml (pip install pyyaml)") for skill in skills[:1]]
    findings: list[Finding] = []
    for skill in skills:
        valido, mensagem = validar(skill.parent)
        if not valido:
            findings.append(erro(skill, 1, "governanca.cabecalho-invalido", f"cabeçalho: {mensagem}"))
    return findings

# endregion
