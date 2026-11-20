"""
Valida o arquivo de uma task (avulsa ou de spec).

O tipo vem do caminho: dentro de .agents/docs/specs/ é task de spec; fora, avulsa.

Verifica:

- [x] Placeholders, comentários do modelo e datas não preenchidas
- [x] Status do conjunto; Tipo e Alcance com um valor só (não a lista do modelo)
- [x] "Atualizado em" com data e motivo
- [x] Seções 3, 4 e 5; avulsa só com a seção 2, task de spec só com a seção 1
- [x] Avulsa: critérios CA-NN (formato, únicos, Dado / Quando / Então)
- [x] Task de spec: cita CA-NN no formato, que existem no spec.md (se a pasta tiver um), e não copia critérios
- [x] Branch `<tipo>/juno/<assunto>`; task de spec com branch no design.md usa a mesma
- [x] "Ler antes de começar": todo caminho citado existe
- [x] Tabela critério → teste: cada CA-NN da task com um nome de teste entre aspas terminando em (CA-NN)
      (task de alcance `documentação`: só aviso, a prova costuma ser um cenário)
- [x] Links relativos (task irmã ainda não criada é aceita)
- [x] --fechar (ou status `concluída`): "Checagens não feitas" preenchida; `concluída` só com o fechamento
      inteiro preenchido e evidência para cada CA-NN. A veracidade da evidência continua com o agente.

As checagens comuns com a skill spec moram na lib global (.agents/scripts/lib/md_checks.py). As funções
públicas daqui são reaproveitadas pelos critérios dos evals (../evals/checks.py).

Saída: `arquivo:linha [SEVERIDADE] código mensagem`; exit 1 se houver erro.

Uso: python validate_task.py <arquivo da task> [--fechar]
"""

import argparse
import re
import sys
from pathlib import Path
from typing import Literal

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "lib"))
from md_checks import (  # noqa: E402  (precisa do sys.path ajustado acima)
    CA_PASSO_LINHA,
    Finding,
    aviso,
    ca_numbers_cited,
    ca_numbers_defined,
    ca_titles,
    check_acceptance_criteria,
    check_ca_refs_exist,
    check_links,
    check_paths_exist,
    check_placeholders,
    check_sections,
    check_status,
    check_updated_at,
    erro,
    find_paths,
    read_status,
    section_body,
)
from md_utils import line_of, mask_code_and_comments  # noqa: E402
from projeto import get_project_root, read_text, relative_to_root  # noqa: E402

Tipo = Literal["avulsa", "spec"]

# region Variáveis auxiliares

OPCOES_STATUS = ("aberta", "em andamento", "bloqueada", "concluída", "cancelada")
TIPOS_COMMIT = ("feat", "fix", "refactor", "test", "docs", "chore")

SECAO_SPEC = "1. Vínculo com a spec"
SECAO_AVULSA = "2. Contexto e critérios"
_SECOES_SEMPRE = ("3. O que fazer nesta tarefa", "4. Como validar o que foi feito", "5. Fechamento")
_SECAO_FECHAMENTO = "5. Fechamento"

ROTULOS_FECHAMENTO = (
    "O que foi feito",
    "Arquivos alterados",
    "Decisões tomadas no caminho",
    "Testes antes de começar",
    "Testes no fim",
    "Evidência por critério",
    "Checagens não feitas",
    "Ficou para depois",
    "Commits entregues",
)

_METADADO = r"^[ \t]*-?[ \t]*\*\*{}:\*\*(.*)$"
_BRANCH = re.compile(_METADADO.format("Branch"), re.MULTILINE)
_BRANCH_VALOR = re.compile(r"^\s*`?([a-z]+/juno/[a-z0-9][a-z0-9-]*)`?(?=[\s.;,(]|$)")
_TIPO = re.compile(_METADADO.format("Tipo"), re.MULTILINE)
_ALCANCE = re.compile(_METADADO.format("Alcance"), re.MULTILINE)
_PRIMEIRO_CODIGO = re.compile(r"`([^`]+)`")

_LER_ANTES = re.compile(r"\*\*Ler antes de começar:?\*\*:?([\s\S]*?)(?=\*\*Arquivos previstos|^## |\Z)", re.MULTILINE)
_LINHA_TABELA = re.compile(r"^[ \t]*\|[ \t]*CA-(\d+)[ \t]*\|.*$", re.MULTILINE)
_CA_QUALQUER = re.compile(r"\bCA-(\w*)")
_ROTULO = re.compile(r"^- \*\*(.+?):\*\*[ \t]*(.*)$", re.MULTILINE)
_TASK_IRMA = re.compile(r"(?:^|/)\d{2}-[\w-]+\.md$")

# endregion

# region Tipo da task e partes do texto

def task_type(arquivo: Path) -> Tipo:
    """Task de spec mora em .agents/docs/specs/<pasta>/tasks/; o resto é avulsa."""
    return "spec" if "specs" in arquivo.parts else "avulsa"


def spec_dir(arquivo: Path) -> Path | None:
    """Pasta da spec da task (a primeira acima com spec.md), se existir no disco."""
    for pasta in arquivo.parents:
        if pasta.name == "specs":
            return None
        if (pasta / "spec.md").exists():
            return pasta
    return None


def task_cas(texto: str, tipo: Tipo) -> set[int]:
    """CA-NN da task: avulsa, os '### CA-NN'; de spec, os citados na seção 1."""
    if tipo == "avulsa":
        return ca_numbers_defined(texto)
    secao = section_body(texto, SECAO_SPEC)
    return {n for n, _ in ca_numbers_cited(secao[0])} if secao else set()


def ler_antes(texto: str) -> tuple[int, int] | None:
    """(início, fim) do bloco "Ler antes de começar", até "Arquivos previstos" ou a próxima seção."""
    bloco = _LER_ANTES.search(texto)
    return (bloco.start(1), bloco.end(1)) if bloco else None


def ler_antes_paths(texto: str) -> list[str]:
    """Caminhos de arquivo citados em "Ler antes de começar", sem repetição, em ordem."""
    bloco = ler_antes(texto)
    if bloco is None:
        return []
    return list(dict.fromkeys(c for c, _ in find_paths(texto[bloco[0]:bloco[1]])))


def criteria_table(texto: str) -> dict[int, list[tuple[int, bool]]]:
    """CA → [(linha, tem nome de teste?)] das linhas '| CA-NN | ...' da tabela critério → teste.
    Nome de teste = trecho entre aspas ("…" ou “…”) que termina com o próprio (CA-NN) da linha."""
    linhas: dict[int, list[tuple[int, bool]]] = {}
    # Acha as linhas no texto mascarado (tabela de exemplo em comentário não conta) e lê o nome no original.
    for m in _LINHA_TABELA.finditer(mask_code_and_comments(texto)):
        ca = m.group(1)
        nome = re.search(r'["“][^"”\n]*\(CA-' + ca + r'\)["”]', texto[m.start():m.end()])
        linhas.setdefault(int(ca), []).append((line_of(texto, m.start()), nome is not None))
    return linhas


def closing_labels(texto: str) -> dict[str, tuple[int, str]]:
    """Rótulo da seção 5 → (linha, valor). O valor inclui as linhas seguintes até o próximo rótulo."""
    secao = section_body(texto, _SECAO_FECHAMENTO)
    if secao is None:
        return {}
    corpo, inicio = secao
    corpo_limpo = mask_code_and_comments(corpo)
    rotulos = list(_ROTULO.finditer(corpo_limpo))
    valores: dict[str, tuple[int, str]] = {}
    for i, rotulo in enumerate(rotulos):
        fim = rotulos[i + 1].start() if i + 1 < len(rotulos) else len(corpo)
        valor = corpo[rotulo.start(2):fim]
        valores[rotulo.group(1)] = (line_of(texto, inicio + rotulo.start()), valor.strip())
    return valores

# endregion

# region Checagens específicas da task (todas devolvem list[Finding])

def check_metadata_options(arquivo: Path, texto: str) -> list[Finding]:
    """Tipo e Alcance com um valor só; Tipo dentro dos tipos de commit."""
    findings: list[Finding] = []
    for nome, padrao in (("tipo", _TIPO), ("alcance", _ALCANCE)):
        linha = padrao.search(texto)
        if linha is None:
            findings.append(erro(arquivo, 1, f"task.{nome}-ausente", f"{nome}: linha **{nome.capitalize()}:** não encontrada"))
            continue
        numero = line_of(texto, linha.start())
        if "|" in linha.group(1):
            findings.append(erro(arquivo, numero, f"task.{nome}-opcoes-do-modelo", f"{nome}: lista de opções do modelo; escolha um valor"))
        elif nome == "tipo":
            valor = _PRIMEIRO_CODIGO.search(linha.group(1))
            if valor is None or valor.group(1) not in TIPOS_COMMIT:
                atual = valor.group(1) if valor else linha.group(1).strip()
                findings.append(erro(arquivo, numero, "task.tipo-invalido", f"tipo: '{atual}' inválido (opções: {', '.join(TIPOS_COMMIT)})"))
    return findings


def check_type_sections(arquivo: Path, texto: str, tipo: Tipo) -> list[Finding]:
    """Avulsa usa só a seção 2; task de spec, só a seção 1."""
    usa, nao_usa = (SECAO_AVULSA, SECAO_SPEC) if tipo == "avulsa" else (SECAO_SPEC, SECAO_AVULSA)
    findings = check_sections(arquivo, texto, (usa,), prefixo=True)
    if section_body(texto, nao_usa) is not None:
        findings.append(erro(arquivo, 1, "task.secao-do-outro-tipo", f"seção: task {'avulsa' if tipo == 'avulsa' else 'de spec'} "
                                         f"não usa a seção '## {nao_usa}'"))
    return findings


def check_spec_criteria(arquivo: Path, texto: str) -> list[Finding]:
    """Task de spec: cita CA-NN no formato, não copia critérios e só cita os que existem no spec.md."""
    findings: list[Finding] = []
    mascarado = mask_code_and_comments(texto)

    for passo in CA_PASSO_LINHA.finditer(mascarado):
        findings.append(erro(arquivo, line_of(texto, passo.start()), "task.criterio-copiado",
                             "critério: task de spec cita os CA-NN do spec.md, não copia Dado / Quando / Então"))
    for ca_id, titulo in ca_titles(texto):
        findings.append(erro(arquivo, line_of(texto, titulo.start()), "task.criterio-definido",
                             f"critério: task de spec não define '### {ca_id}'; cite o critério do spec.md"))

    secao = section_body(texto, SECAO_SPEC)
    if secao is not None:
        corpo, inicio = secao
        for ref in _CA_QUALQUER.finditer(mask_code_and_comments(corpo)):
            if not re.fullmatch(r"\d{2,}", ref.group(1)):
                findings.append(erro(arquivo, line_of(texto, inicio + ref.start()), "task.criterio-id-invalido",
                                     f"critério: '{ref.group(0)}' fora do formato CA-NN"))

    pasta = spec_dir(arquivo)
    if pasta is not None and secao is not None:
        existentes = ca_numbers_defined(read_text(pasta / "spec.md"))
        corpo, inicio = secao
        findings.extend(
            erro(arquivo, line_of(texto, inicio) + f.linha_inicio - 1, f.codigo, f.mensagem)
            for f in check_ca_refs_exist(arquivo, corpo, existentes, "spec.md")
        )
    return findings


def _design_branch(arquivo: Path) -> str | None:
    """Branch preenchida no design.md da spec da task, se houver."""
    pasta = spec_dir(arquivo)
    design = pasta / "design.md" if pasta else None
    if design is None or not design.exists():
        return None
    linha = _BRANCH.search(read_text(design))
    if linha is None or "<" in linha.group(1):
        return None
    valor = _PRIMEIRO_CODIGO.search(linha.group(1))
    return valor.group(1) if valor else (linha.group(1).split() or [None])[0]


def task_branch(texto: str) -> str | None:
    """Branch da task no padrão <tipo>/juno/<assunto> (primeira coisa depois do rótulo), ou None."""
    linha = _BRANCH.search(texto)
    valor = _BRANCH_VALOR.match(linha.group(1)) if linha else None
    return valor.group(1) if valor else None


def check_branch(arquivo: Path, texto: str, branch_design: str | None = None) -> list[Finding]:
    """Branch `<tipo>/juno/<assunto>`; com branch no design.md da spec, a task usa a mesma."""
    linha = _BRANCH.search(texto)
    if linha is None:
        return [erro(arquivo, 1, "task.branch-ausente", "branch: linha **Branch:** não encontrada")]
    numero = line_of(texto, linha.start())

    if branch_design is not None:
        if branch_design not in linha.group(1):
            return [erro(arquivo, numero, "task.branch-diferente-do-design", f"branch: task de spec usa a branch do design.md ({branch_design})")]
        return []

    branch = task_branch(texto)
    if branch is None:
        return [erro(arquivo, numero, "task.branch-formato", "branch: use '<tipo>/juno/<assunto>' logo depois do rótulo")]
    if branch.split("/")[0] not in TIPOS_COMMIT:
        return [erro(arquivo, numero, "task.branch-tipo-invalido", f"branch: tipo '{branch.split('/')[0]}' fora de {', '.join(TIPOS_COMMIT)}")]
    return []


def check_read_first(arquivo: Path, texto: str, raiz: Path) -> list[Finding]:
    """"Ler antes de começar" presente e com caminhos que existem."""
    bloco = ler_antes(texto)
    if bloco is None:
        return [aviso(arquivo, 1, "task.ler-antes-ausente", "ler antes: rótulo **Ler antes de começar** não encontrado")]
    if not find_paths(texto[bloco[0]:bloco[1]]):
        return [aviso(arquivo, line_of(texto, bloco[0]), "task.ler-antes-sem-caminho", "ler antes: nenhum caminho de arquivo citado")]
    return check_paths_exist(arquivo, texto, bloco[0], bloco[1], raiz, "ler antes", "task.ler-antes-caminho-inexistente")


def is_documentation(texto: str) -> bool:
    """Task de alcance `documentação`: o critério é provado por cenário, não por teste com nome."""
    linha = _ALCANCE.search(texto)
    return bool(linha) and "`documentação`" in linha.group(1) and "|" not in linha.group(1)


def check_criteria_table(arquivo: Path, texto: str, cas: set[int]) -> list[Finding]:
    """Cada CA-NN da task tem linha na tabela com nome de teste; a tabela não cita CA de fora da task.
    Em task de documentação, linha sem nome de teste é só aviso (a prova costuma ser um cenário)."""
    findings: list[Finding] = []
    tabela = criteria_table(texto)
    sem_nome = aviso if is_documentation(texto) else erro

    for ca, linhas in sorted(tabela.items()):
        for numero, tem_nome in linhas:
            if not tem_nome:
                findings.append(sem_nome(arquivo, numero, "task.tabela-sem-nome-de-teste", f'tabela: CA-{ca:02d} sem nome de teste entre aspas '
                                                          f'terminando em "(CA-{ca:02d})"'))
        if cas and ca not in cas:
            findings.append(erro(arquivo, linhas[0][0], "task.tabela-ca-de-fora", f"tabela: CA-{ca:02d} não é critério desta task"))

    for ca in sorted(cas - tabela.keys()):
        findings.append(erro(arquivo, 1, "task.tabela-ca-sem-linha", f"tabela: CA-{ca:02d} sem linha na tabela critério → teste"))
    return findings


def check_closing(arquivo: Path, texto: str, cas: set[int]) -> list[Finding]:
    """Fechamento: "Checagens não feitas" preenchida; `concluída` só com tudo preenchido e evidência por CA."""
    findings: list[Finding] = []
    status, pos = read_status(texto)
    linha_status = line_of(texto, pos) if pos >= 0 else 1

    if status not in ("concluída", "em andamento"):
        findings.append(erro(arquivo, linha_status, "task.fechamento-status",
                             f"fechamento: status '{status}' ao fechar; use `concluída` ou `em andamento`"))

    rotulos = closing_labels(texto)
    checagens = rotulos.get("Checagens não feitas")
    if checagens is None or not checagens[1]:
        linha = checagens[0] if checagens else 1
        findings.append(erro(arquivo, linha, "task.fechamento-checagens-vazia", "fechamento: preencha 'Checagens não feitas' (o que não rodou, ou 'nenhuma')"))

    if status != "concluída":
        return findings

    for rotulo in ROTULOS_FECHAMENTO:
        if rotulo not in rotulos:
            findings.append(erro(arquivo, 1, "task.fechamento-rotulo-ausente", f"fechamento: rótulo '{rotulo}' ausente"))
        elif not rotulos[rotulo][1] and rotulo != "Checagens não feitas":
            findings.append(erro(arquivo, rotulos[rotulo][0], "task.fechamento-rotulo-vazio", f"fechamento: '{rotulo}' vazio com status `concluída`"))

    evidencia = rotulos.get("Evidência por critério")
    if evidencia is not None and evidencia[1]:
        citados = {n for n, _ in ca_numbers_cited(evidencia[1])}
        for ca in sorted(cas - citados):
            findings.append(erro(arquivo, evidencia[0], "task.fechamento-sem-evidencia", f"fechamento: CA-{ca:02d} sem evidência com status `concluída`"))

    if checagens is not None and checagens[1] and not re.match(r"nenhuma\b", checagens[1], re.IGNORECASE):
        findings.append(aviso(arquivo, checagens[0], "task.fechamento-checagens-pendentes",
                              "fechamento: há checagens não feitas com status `concluída`; confira se não impedem"))
    return findings

# endregion


def validate(arquivo: Path, texto: str | None = None, fechar: bool = False, raiz: Path | None = None,
             tipo: Tipo | None = None) -> list[Finding]:
    """Todas as checagens da task. `texto`, `raiz` e `tipo` permitem validar cópias fora do lugar (evals)."""
    texto = read_text(arquivo) if texto is None else texto
    raiz = raiz or get_project_root()
    tipo = tipo or task_type(arquivo)
    cas = task_cas(texto, tipo)

    findings = [
        *check_placeholders(arquivo, texto),
        *check_status(arquivo, texto, OPCOES_STATUS),
        *check_metadata_options(arquivo, texto),
        *check_updated_at(arquivo, texto),
        *check_sections(arquivo, texto, _SECOES_SEMPRE, prefixo=True),
        *check_type_sections(arquivo, texto, tipo),
        *check_branch(arquivo, texto, _design_branch(arquivo) if tipo == "spec" else None),
        *check_read_first(arquivo, texto, raiz),
        *check_criteria_table(arquivo, texto, cas),
        *check_links(arquivo, texto, raiz, ignorar=lambda alvo: bool(_TASK_IRMA.search(alvo))),
    ]
    if tipo == "avulsa":
        findings.extend(check_acceptance_criteria(arquivo, texto))
    else:
        findings.extend(check_spec_criteria(arquivo, texto))

    status, _ = read_status(texto)
    if fechar or status == "concluída":
        findings.extend(check_closing(arquivo, texto, cas))

    return sorted(findings, key=lambda f: f.linha_inicio)


def main() -> None:
    parser = argparse.ArgumentParser(description="Valida o arquivo de uma task.")
    parser.add_argument("arquivo", type=Path, help="Caminho do arquivo da task (.md).")
    parser.add_argument("--fechar", action="store_true",
                        help="Confere também o fechamento (seção 5), como ao fechar a task.")
    args = parser.parse_args()

    arquivo: Path = args.arquivo
    if not arquivo.is_file():
        raise SystemExit(f"Erro: o arquivo '{arquivo}' não foi encontrado.")

    findings = validate(arquivo, fechar=args.fechar)
    if not findings:
        print("Nenhum problema encontrado.")
        return

    print(f"{len(findings)} problema(s) encontrado(s) em {relative_to_root(arquivo)}:")
    print("\n".join(str(f) for f in findings))

    if any(f.severidade == "erro" for f in findings):
        sys.exit(1)


if __name__ == "__main__":
    main()
