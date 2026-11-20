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

O que entra em cada grupo: checagens/coleta.py. Este arquivo chama as checagens, imprime a saída e cuida da
base de achados (salvar antes de uma mudança e comparar depois).

Fica de fora: *-workspace/ (saídas de rodadas), scripts/testes/ e evals/files/ (exemplos quebrados ou
fictícios de propósito).

Saída: `arquivo:linha [SEVERIDADE] código mensagem`, ordenada por arquivo, com uma linha em branco entre
arquivos; exit 1 se houver erro.

Base de achados: uma linha por achado, sem número de linha (`arquivo [SEVERIDADE] código mensagem`). Um achado
é o mesmo antes e depois se arquivo, severidade, código e mensagem batem; repetidos contam pela quantidade.
- --salvar-base <arquivo>: roda tudo, imprime como sempre e grava a base; exit 0 (os erros que já existem são
  justamente o que a base registra).
- --comparar <arquivo>: roda tudo e separa erros novos, avisos novos, os que já existiam e os corrigidos;
  exit 1 só com erro novo.
As funções da base (format_base, read_base, compare, format_comparison) são importáveis: o "iniciar" e o
"encerrar" das tasks gravam e releem a mesma base no Andamento.

Uso: python3 .agents/skills/governanca/scripts/governanca.py [--salvar-base <arquivo> | --comparar <arquivo>]
"""
import argparse
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
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


def relative_name(f: Finding, raiz: Path) -> str:
    """Caminho do arquivo do achado relativo à raiz (há vários SKILL.md)."""
    try:
        return str(f.arquivo.relative_to(raiz))
    except ValueError:
        return str(f.arquivo)


def format_finding(f: Finding, raiz: Path) -> str:
    """Como Finding.__str__, mas com o caminho relativo à raiz."""
    return f"{relative_name(f, raiz)}:{f.linhas} [{f.severidade.upper()}] {f.codigo} {f.mensagem}"


def sort_findings(findings: list[Finding], raiz: Path) -> list[Finding]:
    """Por arquivo e, dentro dele, por linha."""
    return sorted(findings, key=lambda f: (relative_name(f, raiz), f.linha_inicio, f.linha_fim, f.codigo, f.mensagem))


def format_report(findings: list[Finding], raiz: Path) -> str:
    """Um achado por linha, agrupados por arquivo (linha em branco entre arquivos), e o resumo no fim."""
    linhas: list[str] = []
    anterior = None
    for f in sort_findings(findings, raiz):
        nome = relative_name(f, raiz)
        if anterior is not None and nome != anterior:
            linhas.append("")
        linhas.append(format_finding(f, raiz))
        anterior = nome
    erros = sum(f.severidade == "erro" for f in findings)
    if linhas:
        linhas.append("")
    linhas.append(f"{erros} erro(s), {len(findings) - erros} aviso(s)")
    return "\n".join(linhas)


def exit_code(findings: list[Finding]) -> int:
    """1 se houver erro; aviso (pendência) não falha."""
    return 1 if any(f.severidade == "erro" for f in findings) else 0


# region Base de achados

Chave = tuple[str, str, str, str]  # (arquivo relativo, severidade, código, mensagem): sem as linhas

_LINHA_BASE = re.compile(r"^(?P<arquivo>.+?) \[(?P<sev>ERRO|AVISO)\] (?P<codigo>\S+) (?P<mensagem>.*)$")


def key_of(f: Finding, raiz: Path) -> Chave:
    """Identidade do achado na base: arquivo, severidade, código e mensagem, sem número de linha."""
    return relative_name(f, raiz), f.severidade, f.codigo, f.mensagem


def format_key(chave: Chave) -> str:
    arquivo, severidade, codigo, mensagem = chave
    return f"{arquivo} [{severidade.upper()}] {codigo} {mensagem}"


def format_base(findings: list[Finding], raiz: Path) -> str:
    """A base: uma linha por achado (repetidos aparecem repetidos), em ordem de arquivo e linha."""
    return "".join(format_key(key_of(f, raiz)) + "\n" for f in sort_findings(findings, raiz))


def read_base(texto: str) -> Counter:
    """Chave → quantidade. Linha fora do formato é erro (ValueError com o número da linha), para não comparar
    errado uma base editada à mão; linhas vazias são ignoradas."""
    base: Counter = Counter()
    for numero, linha in enumerate(texto.splitlines(), start=1):
        if not linha.strip():
            continue
        m = _LINHA_BASE.match(linha)
        if m is None:
            raise ValueError(f"linha {numero} da base fora do formato 'arquivo [SEVERIDADE] código mensagem': {linha}")
        base[(m.group("arquivo"), m.group("sev").lower(), m.group("codigo"), m.group("mensagem"))] += 1
    return base


@dataclass
class Comparacao:
    """Achados de agora separados contra a base: novos, os que já existiam e os da base que sumiram."""

    novos: list[Finding] = field(default_factory=list)
    antigos: list[Finding] = field(default_factory=list)
    corrigidos: list[Chave] = field(default_factory=list)

    @property
    def erros_novos(self) -> list[Finding]:
        return [f for f in self.novos if f.severidade == "erro"]

    @property
    def avisos_novos(self) -> list[Finding]:
        return [f for f in self.novos if f.severidade == "aviso"]


def compare(base: Counter, findings: list[Finding], raiz: Path) -> Comparacao:
    """Cada achado de agora consome uma ocorrência igual da base (antigo); sem ocorrência sobrando, é novo. O
    que sobra na base no fim foi corrigido. Com repetidos, os primeiros (em ordem de linha) são os antigos."""
    restante = Counter(base)
    comparacao = Comparacao()
    for f in sort_findings(findings, raiz):
        chave = key_of(f, raiz)
        if restante[chave] > 0:
            restante[chave] -= 1
            comparacao.antigos.append(f)
        else:
            comparacao.novos.append(f)
    comparacao.corrigidos = sorted(restante.elements())
    return comparacao


def format_comparison(c: Comparacao, raiz: Path) -> str:
    """Os grupos que tiverem algum achado, nesta ordem, e o resumo no fim."""
    grupos = (
        ("Erros novos (bloqueiam):", [format_finding(f, raiz) for f in c.erros_novos]),
        ("Avisos novos (não bloqueiam; diga ao usuário):", [format_finding(f, raiz) for f in c.avisos_novos]),
        ("Já existiam antes da mudança (só informados):", [format_finding(f, raiz) for f in c.antigos]),
        ("Corrigidos:", [format_key(k) for k in c.corrigidos]),
    )
    blocos = ["\n".join([titulo, *linhas]) for titulo, linhas in grupos if linhas]
    resumo = (f"{len(c.erros_novos)} erro(s) novo(s), {len(c.avisos_novos)} aviso(s) novo(s), "
              f"{len(c.antigos)} já existiam, {len(c.corrigidos)} corrigido(s)")
    return "\n\n".join([*blocos, resumo])


def comparison_exit_code(c: Comparacao) -> int:
    """1 só com erro novo: o que já existia e os avisos não bloqueiam."""
    return 1 if c.erros_novos else 0

# endregion


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Governança do conjunto de instruções para agentes.")
    modo = parser.add_mutually_exclusive_group()
    modo.add_argument("--salvar-base", type=Path, metavar="ARQUIVO",
                      help="Grava a base de achados antes de uma mudança.")
    modo.add_argument("--comparar", type=Path, metavar="ARQUIVO",
                      help="Compara com a base salva: novos, antigos e corrigidos; falha só com erro novo.")
    args = parser.parse_args(argv)

    raiz = get_project_root()
    if args.comparar is not None:
        if not args.comparar.is_file():
            raise SystemExit(f"Erro: base não encontrada: {args.comparar} (salve com --salvar-base antes da mudança)")
        try:
            base = read_base(read_text(args.comparar))
        except ValueError as problema:
            raise SystemExit(f"Erro: {args.comparar}: {problema}")
        comparacao = compare(base, run(raiz), raiz)
        print(format_comparison(comparacao, raiz))
        return comparison_exit_code(comparacao)

    findings = run(raiz)
    print(format_report(findings, raiz))
    if args.salvar_base is not None:
        args.salvar_base.parent.mkdir(parents=True, exist_ok=True)
        args.salvar_base.write_text(format_base(findings, raiz), encoding="utf-8")
        print(f"Base salva em {args.salvar_base} ({len(findings)} achado(s))")
        return 0
    return exit_code(findings)


if __name__ == "__main__":
    sys.exit(main())
