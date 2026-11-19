"""
Governança do conjunto de instruções para agentes (AGENTS.md + .agents/), sem LLM. Ponto de entrada único:
roda sempre inteira, sem filtro por área.

Verifica:

- Instruções (AGENTS.md, .agents/README.md, guias, modelos e os .md das skills):
  - [x] links relativos e caminhos citados existem (checagens/referencias.py)
  - [x] comandos `python3 <script>.py` e `python3 -m unittest discover -s <pasta>` apontam para algo real
  - [x] skill citada que ainda não existe vira AVISO (pendência conhecida), não erro
  - [x] placeholder esquecido (comentário do modelo, texto entre < e >, data AAAA-MM-DD) fora de código;
        os modelos ficam de fora (checagens/instrucoes.py)
  - [x] comando de bloco bash/sh sem o prefixo `rtk`, salvo o bloco com `# sem rtk: motivo`
- Skills (checagens/skills.py):
  - [x] tabela de skills do AGENTS.md × pastas .agents/skills/*/SKILL.md (nos dois sentidos)
  - [x] cabeçalho YAML de cada SKILL.md passa no quick_validate da oficina-de-skills (precisa de pyyaml)
  - [x] seções que os validadores (validate_spec, validate_task) esperam existem nos modelos
- Tasks e specs (checagens/registros.py):
  - [x] status × pasta (done/ só fechadas; avulsa fechada fora de done/ é erro) e task `em andamento` sem branch
  - [x] a mesma task ou spec entre as abertas e entre as concluídas
  - [x] as vivas passam pelo validador da skill dona (mesma mensagem); as fechadas não têm o conteúdo conferido

O que entra em cada grupo: checagens/coleta.py. Este arquivo só chama as checagens e imprime a saída.

Fica de fora: *-workspace/ (saídas de rodadas), scripts/testes/ e evals/files/ (exemplos quebrados ou
fictícios de propósito).

Saída: `arquivo:linha [SEVERIDADE] mensagem`; exit 1 se houver erro.

Uso: python3 .agents/skills/governanca/scripts/governanca.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "lib"))
sys.path.insert(0, str(Path(__file__).resolve().parent / "checagens"))
from coleta import canonical_docs, instructions  # noqa: E402
from instrucoes import check_canonical_placeholders, check_rtk  # noqa: E402
from md_checks import Finding  # noqa: E402
from projeto import get_project_root, read_text  # noqa: E402
from referencias import check_cited_skills, check_python_commands, check_refs  # noqa: E402
from registros import check_duplicates, check_live_records, check_place_status, load_validators  # noqa: E402
from skills import (  # noqa: E402
    check_skill_headers,
    check_skill_table,
    check_template_sections,
    load_expected_sections,
    load_skill_validator,
)

_CARREGAR = object()  # marca "carregue o real" (None já quer dizer "sem pyyaml" no validador de cabeçalho)


def run(raiz: Path, esperadas=None, validar=_CARREGAR, validadores=None) -> list[Finding]:
    """Todas as checagens. Sem os parâmetros, as seções dos modelos, o validador de cabeçalho e os validadores
    de task e spec vêm dos scripts das skills (os testes passam versões falsas)."""
    findings: list[Finding] = []
    for arquivo in instructions(raiz):
        texto = read_text(arquivo)
        findings += check_refs(arquivo, texto, raiz)
        findings += check_python_commands(arquivo, texto, raiz)
        findings += check_cited_skills(arquivo, texto, raiz)
        if arquivo == raiz / "AGENTS.md":
            findings += check_skill_table(arquivo, texto, raiz)
    for arquivo in canonical_docs(raiz):
        texto = read_text(arquivo)
        findings += check_canonical_placeholders(arquivo, texto)
        findings += check_rtk(arquivo, texto)
    findings += check_template_sections(raiz, load_expected_sections(raiz) if esperadas is None else esperadas)
    findings += check_skill_headers(raiz, load_skill_validator(raiz) if validar is _CARREGAR else validar)
    findings += check_place_status(raiz)
    findings += check_duplicates(raiz)
    findings += check_live_records(raiz, *(load_validators(raiz) if validadores is None else validadores))
    return findings


def format_finding(f: Finding, raiz: Path) -> str:
    """Como Finding.__str__, mas com o caminho relativo à raiz (há vários SKILL.md)."""
    try:
        nome = f.arquivo.relative_to(raiz)
    except ValueError:
        nome = f.arquivo
    linhas = f"{f.linha_inicio}-{f.linha_fim}" if f.linha_fim != f.linha_inicio else f"{f.linha_inicio}"
    return f"{nome}:{linhas} [{f.severidade.upper()}] {f.mensagem}"


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
