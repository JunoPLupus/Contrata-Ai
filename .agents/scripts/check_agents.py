"""
Checagens mecânicas do conjunto de instruções para agentes (AGENTS.md + .agents/), sem LLM.

Verifica:

- [x] Links relativos e caminhos de arquivo citados nos .md existem
- [x] Tabela de skills do AGENTS.md × pastas .agents/skills/*/SKILL.md (nos dois sentidos)
- [x] Comandos `python3 <script>.py` e `python3 -m unittest discover -s <pasta>` apontam para algo real
- [x] Seções que os validadores (validate_spec, validate_task) esperam existem nos modelos
- [x] Cabeçalho YAML de cada SKILL.md passa no quick_validate da oficina-de-skills (precisa de pyyaml)
- [x] Skills citadas que ainda não existem viram AVISO (pendência conhecida), não erro; registros fechados
      (spec/task `concluída`, `cancelada` ou `substituída`) ficam de fora dessa checagem

Entram o AGENTS.md e os .md de .agents/, menos *-workspace/ (saídas de rodadas), scripts/testes/ e
evals/files/ (exemplos de propósito quebrados ou fictícios).

Saída: `arquivo:linha [SEVERIDADE] mensagem`; exit 1 se houver erro.

Uso: python3 .agents/scripts/check_agents.py
"""
import importlib.util
import re
import sys
from pathlib import Path
from typing import Callable

sys.path.insert(0, str(Path(__file__).resolve().parent / "lib"))
from md_checks import Finding, aviso, check_links, erro, find_paths, read_status, section_titles  # noqa: E402
from md_utils import line_of  # noqa: E402
from projeto import get_project_root, read_text  # noqa: E402


# region Coleta dos arquivos

_PASTAS_FORA = ("testes", "files", "__pycache__")


def collect_md(raiz: Path) -> list[Path]:
    """AGENTS.md + .md de .agents/, sem *-workspace/, scripts/testes/, evals/files/ e __pycache__/."""
    arquivos = [raiz / "AGENTS.md"] if (raiz / "AGENTS.md").exists() else []
    for md in sorted((raiz / ".agents").rglob("*.md")):
        partes = md.relative_to(raiz / ".agents").parts[:-1]
        if any(p.endswith("-workspace") or p in _PASTAS_FORA for p in partes):
            continue
        arquivos.append(md)
    return arquivos


def skill_dir(arquivo: Path, raiz: Path) -> Path | None:
    """Pasta da skill que contém `arquivo` (.agents/skills/<nome>/), ou None."""
    try:
        partes = arquivo.relative_to(raiz / ".agents" / "skills").parts
    except ValueError:
        return None
    return raiz / ".agents" / "skills" / partes[0] if len(partes) > 1 else None


def existing_skills(raiz: Path) -> set[str]:
    return {p.parent.name for p in (raiz / ".agents" / "skills").glob("*/SKILL.md")}

# endregion

# region 1. Links e caminhos citados


def _top_dirs(raiz: Path) -> set[str]:
    """Primeiros segmentos que marcam um caminho como relativo à raiz (.agents, api, docs, web…)."""
    return {p.name for p in raiz.iterdir() if p.is_dir() and p.name != ".git"}


def _exists(caminho: str, arquivo: Path, raiz: Path) -> bool | None:
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
    if arquivo.parent == raiz / ".agents" / "docs" / "templates":
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
        if not _exists(caminho, arquivo, raiz):
            findings.append(erro(arquivo, line_of(texto, pos), f"caminho: não existe: {caminho}"))
    return findings

# endregion

# region 2. Tabela de skills do AGENTS.md

_LINHA_SKILL = re.compile(r"^\|.*\|\s*\[`?([\w-]+)`?\]\(([^)\s]+)\)\s*\|\s*$", re.MULTILINE)


def check_skill_table(arquivo: Path, texto: str, raiz: Path) -> list[Finding]:
    """Toda skill com SKILL.md tem linha na tabela de '## Skills' e toda linha aponta para um SKILL.md real."""
    secao = re.search(r"^## Skills\s*$([\s\S]*?)(?=^## |\Z)", texto, re.MULTILINE)
    if secao is None:
        return [erro(arquivo, 1, "skills: seção '## Skills' não encontrada")]

    findings: list[Finding] = []
    na_tabela: set[str] = set()
    for linha in _LINHA_SKILL.finditer(texto, secao.start(1), secao.end(1)):
        nome, alvo = linha.group(1), linha.group(2)
        destino = (arquivo.parent / alvo).resolve()
        numero = line_of(texto, linha.start())
        if destino.name != "SKILL.md" or not destino.exists():
            findings.append(erro(arquivo, numero, f"skills: linha '{nome}' não aponta para um SKILL.md existente: {alvo}"))
        else:
            na_tabela.add(destino.parent.name)

    for faltando in sorted(existing_skills(raiz) - na_tabela):
        findings.append(erro(arquivo, line_of(texto, secao.start()),
                             f"skills: .agents/skills/{faltando}/SKILL.md sem linha na tabela"))
    return findings

# endregion

# region 3. Comandos python3


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
            destino_ok = _exists(caminho, arquivo, raiz)
            if destino_ok is None:
                continue
        if not destino_ok:
            findings.append(erro(arquivo, line_of(texto, comando.start()), f"comando: alvo não existe: {caminho}"))
    return findings

# endregion

# region 4. Seções dos modelos


def _load(caminho: Path):
    """Importa um script de skill pelo caminho, com a pasta dele no sys.path (para os imports locais)."""
    sys.path.insert(0, str(caminho.parent))
    try:
        spec = importlib.util.spec_from_file_location(f"_check_{caminho.stem}", caminho)
        modulo = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(modulo)
        return modulo
    finally:
        sys.path.remove(str(caminho.parent))


def load_expected_sections(raiz: Path) -> dict[str, tuple[str, ...]]:
    """Modelo → títulos de seção (começo do título) que os validadores esperam. Uma só fonte: os validadores."""
    skills = raiz / ".agents" / "skills"
    spec = _load(skills / "spec" / "scripts" / "validate_spec.py")
    task = _load(skills / "task" / "scripts" / "validate_task.py")
    return {
        **spec._SECOES_OBRIGATORIAS,
        "task.md": (task.SECAO_SPEC, task.SECAO_AVULSA, *task._SECOES_SEMPRE),
    }


def check_template_sections(raiz: Path, esperadas: dict[str, tuple[str, ...]]) -> list[Finding]:
    """Cada modelo de .agents/docs/templates/ tem um '## ' que começa com cada título esperado."""
    findings: list[Finding] = []
    pasta = raiz / ".agents" / "docs" / "templates"
    for nome, titulos in esperadas.items():
        modelo = pasta / nome
        if not modelo.exists():
            findings.append(erro(modelo, 1, "modelo: arquivo não existe"))
            continue
        presentes = [m.group(1) for m in section_titles(read_text(modelo))]
        for titulo in titulos:
            if not any(p.startswith(titulo) for p in presentes):
                findings.append(erro(modelo, 1, f"modelo: falta a seção '## {titulo}' que o validador espera"))
    return findings

# endregion

# region 5. Skills citadas que não existem

# skill `nome`, skills `nome`, skill de `nome` e links/caminhos .agents/skills/nome/
_SKILL_CITADA = re.compile(
    r"\bskills?\s+(?:d[eao]\s+)?`([a-z][a-z0-9-]*)`"
    r"|\.agents/skills/([a-z][a-z0-9-]*)/"
)


_STATUS_FECHADO = ("concluída", "cancelada", "substituída")


def check_cited_skills(arquivo: Path, texto: str, raiz: Path) -> list[Finding]:
    """Skill citada sem pasta em .agents/skills/ vira AVISO de pendência (pode ser uma skill futura).

    Spec ou task fechada é registro do que aconteceu e não vai ser editada: os nomes que cita (inclusive de
    skills que nunca vão existir) gerariam aviso para sempre e ensinariam a ignorar os avisos."""
    if read_status(texto)[0] in _STATUS_FECHADO:
        return []
    existentes = existing_skills(raiz)
    findings: list[Finding] = []
    for citacao in _SKILL_CITADA.finditer(texto):
        nome = next(g for g in citacao.groups() if g)
        if nome not in existentes:
            findings.append(aviso(arquivo, line_of(texto, citacao.start()),
                                  f"pendência: skill '{nome}' citada, ainda não existe"))
    return findings

# endregion


# region 6. Cabeçalho das skills

Validador = Callable[[Path], tuple[bool, str]]


def load_skill_validator(raiz: Path) -> Validador | None:
    """validate_skill do quick_validate da oficina (fonte única das regras do cabeçalho); None sem pyyaml."""
    try:
        return _load(raiz / ".agents" / "skills" / "oficina-de-skills" / "scripts" / "quick_validate.py").validate_skill
    except ImportError:
        return None


def check_skill_headers(raiz: Path, validar: Validador | None) -> list[Finding]:
    """Cada .agents/skills/*/SKILL.md com cabeçalho válido. Um cabeçalho quebrado (YAML inválido, campo
    faltando) deixa a skill invisível para ferramentas que leem a description, sem aviso nenhum."""
    skills = sorted((raiz / ".agents" / "skills").glob("*/SKILL.md"))
    if validar is None:
        return [aviso(skill, 1, "cabeçalho: não conferido, falta o pyyaml (pip install pyyaml)") for skill in skills[:1]]
    findings: list[Finding] = []
    for skill in skills:
        valido, mensagem = validar(skill.parent)
        if not valido:
            findings.append(erro(skill, 1, f"cabeçalho: {mensagem}"))
    return findings

# endregion


_CARREGAR = object()  # marca "carregue o validador real" (None já quer dizer "sem pyyaml")


def run(raiz: Path, esperadas: dict[str, tuple[str, ...]] | None = None, validar=_CARREGAR) -> list[Finding]:
    """Todas as checagens. `esperadas` (seções dos modelos) e `validar` (cabeçalho das skills) vêm dos
    scripts das skills se não forem passados."""
    findings: list[Finding] = []
    for arquivo in collect_md(raiz):
        texto = read_text(arquivo)
        findings += check_refs(arquivo, texto, raiz)
        findings += check_python_commands(arquivo, texto, raiz)
        findings += check_cited_skills(arquivo, texto, raiz)
        if arquivo == raiz / "AGENTS.md":
            findings += check_skill_table(arquivo, texto, raiz)
    findings += check_template_sections(raiz, load_expected_sections(raiz) if esperadas is None else esperadas)
    findings += check_skill_headers(raiz, load_skill_validator(raiz) if validar is _CARREGAR else validar)
    return findings


def format_finding(f: Finding, raiz: Path) -> str:
    """Como Finding.__str__, mas com o caminho relativo à raiz (há vários SKILL.md)."""
    try:
        nome = f.arquivo.relative_to(raiz)
    except ValueError:
        nome = f.arquivo
    return f"{nome}:{f.linha_inicio} [{f.severidade.upper()}] {f.mensagem}"


def exit_code(findings: list[Finding]) -> int:
    """1 se houver erro; aviso (pendência) não falha."""
    return 1 if any(f.severidade == "erro" for f in findings) else 0


def main() -> int:
    raiz = get_project_root()
    findings = run(raiz)
    for f in sorted(findings, key=lambda f: (f.severidade != "erro", str(f.arquivo), f.linha_inicio)):
        print(format_finding(f, raiz))
    erros = sum(f.severidade == "erro" for f in findings)
    print(f"{erros} erro(s), {len(findings) - erros} aviso(s)")
    return exit_code(findings)


if __name__ == "__main__":
    sys.exit(main())
