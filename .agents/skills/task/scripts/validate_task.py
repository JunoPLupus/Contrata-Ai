"""
Valida o arquivo de uma task (avulsa ou de spec).

O tipo vem do caminho: dentro de .agents/docs/specs/ é task de spec; fora, avulsa.

Verifica:

- [x] Placeholders, comentários do modelo e datas não preenchidas
- [x] Status do conjunto; Tipo e Alcance com um valor só (não a lista do modelo)
- [x] "Atualizado em" com data e motivo
- [x] Seções 1 a 5, as mesmas nos dois tipos
- [x] Spec e Bloqueada por nos metadados: `não se aplica` na avulsa e só nela; a de spec liga o spec.md
- [x] Subseções "###" obrigatórias presentes e não vazias ("não se aplica" vale): Problema, Objetivo e
      Referências na seção 1 (e, na task de spec, Critérios de aceite); Fica fora, Decisões, Em aberto,
      Passos, Ler antes de começar, Arquivos previstos, Não deve mudar e Impacto na seção 2
- [x] Impacto com os seis eixos, cada um "sim — o que muda" ou "não"
- [x] Modo com um dos dois valores do conjunto
- [x] Andamento: entradas "- AAAA-MM-DD — texto"; a partir de `em andamento`, pelo menos uma
- [x] Avulsa: critérios CA-NN (formato, únicos, Dado / Quando / Então)
- [x] Task de spec: cita em "Critérios de aceite" CA-NN no formato, que existem no spec.md (se a pasta tiver
      um), e não copia critérios
- [x] Branch `<tipo>/juno/<assunto>`; task de spec com branch no design.md usa a mesma
- [x] "Ler antes de começar": todo caminho citado existe
- [x] Tabela critério → teste: cada CA-NN da task com um nome de teste entre aspas terminando em (CA-NN)
      (task de alcance `documentação`: só aviso, a prova costuma ser um cenário)
- [x] Links relativos (task irmã ainda não criada é aceita)
- [x] --fechar (ou status `concluída`): "Checagens não feitas" preenchida; `concluída` só com o fechamento
      inteiro preenchido e evidência para cada CA-NN; "Commits entregues" com um bloco ```text por commit,
      seguido da lista "Arquivos:". A veracidade da evidência continua com o agente.

As checagens comuns com a skill spec moram na lib global (.agents/scripts/lib/md_checks.py). As funções
públicas daqui são reaproveitadas pelos critérios dos evals (../evals/checks.py).

Saída: `arquivo:linha [SEVERIDADE] código mensagem`; exit 1 se houver erro.

Uso: python validate_task.py <arquivo da task> [--fechar]
"""

import argparse
import re
import sys
from datetime import date
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
from md_utils import COMENTARIO_PATTERN, find_placeholders, line_of, mask_code_and_comments  # noqa: E402
from projeto import get_project_root, read_text, relative_to_root  # noqa: E402

Tipo = Literal["avulsa", "spec"]

# region Variáveis auxiliares

OPCOES_STATUS = ("aberta", "em andamento", "bloqueada", "concluída", "cancelada")
TIPOS_COMMIT = ("feat", "fix", "refactor", "test", "docs", "chore")

SECAO_CONTEXTO = "1. Contexto e critérios"
SECAO_O_QUE_FAZER = "2. O que fazer nesta tarefa"
SECAO_ANDAMENTO = "4. Andamento"
_SECAO_FECHAMENTO = "5. Fechamento"
_SECOES_SEMPRE = (SECAO_CONTEXTO, SECAO_O_QUE_FAZER, "3. Como validar o que foi feito", SECAO_ANDAMENTO,
                  _SECAO_FECHAMENTO)
# Conferidas por check_sections em validate(): a seção 1 é de check_type_sections (com as partes do tipo) e o
# Andamento, que pode ficar vazio com `aberta` ou `bloqueada`, é de check_progress.
_SECOES_NAO_VAZIAS = tuple(s for s in _SECOES_SEMPRE if s not in (SECAO_CONTEXTO, SECAO_ANDAMENTO))

# Subseções "###" obrigatórias de cada seção: nunca apagadas; "não se aplica" é resposta válida.
SUBSECOES_CONTEXTO = ("Problema", "Objetivo", "Referências")
# Critérios: a task de spec cita os CA-NN do spec.md nesta subseção; a avulsa define os '### CA-NN'.
SUBSECAO_CRITERIOS = "Critérios de aceite"
SUBSECOES_O_QUE_FAZER = ("Fica fora", "Decisões", "Em aberto", "Passos", "Ler antes de começar",
                         "Arquivos previstos", "Não deve mudar", "Impacto")
SUBSECAO_LER_ANTES = "Ler antes de começar"
SUBSECAO_IMPACTO = "Impacto"

EIXOS_IMPACTO = ("Contrato da API", "Banco", "Front", "Permissões e segurança",
                 "Testes existentes que mudam de propósito", "Documentação")

MODOS = ("agente implementa, Juno revisa", "Juno implementa, agente guia e revisa")
STATUS_COM_ANDAMENTO = ("em andamento", "concluída", "cancelada")

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
_MODO = re.compile(_METADADO.format("Modo"), re.MULTILINE)
_SPEC = re.compile(_METADADO.format("Spec"), re.MULTILINE)
_BLOQUEADA_POR = re.compile(_METADADO.format("Bloqueada por"), re.MULTILINE)
_NAO_SE_APLICA = re.compile(r"^\s*não se aplica\.?\s*$", re.IGNORECASE)
_PRIMEIRO_CODIGO = re.compile(r"`([^`]+)`")

_SUBSECAO = re.compile(r"^### (.+?)[ \t]*$", re.MULTILINE)
_LINHA_TABELA = re.compile(r"^[ \t]*\|[ \t]*CA-(\d+)[ \t]*\|.*$", re.MULTILINE)
_CA_QUALQUER = re.compile(r"\bCA-(\w*)")
_ROTULO = re.compile(r"^- \*\*(.+?):\*\*[ \t]*(.*)$", re.MULTILINE)
_TASK_IRMA = re.compile(r"(?:^|/)\d{2}-[\w-]+\.md$")

# Eixo do Impacto: "sim — o que muda" (travessão como no "Atualizado em": —, – ou -) ou "não" (com ou sem
# comentário depois).
_SIM = re.compile(r"sim\b", re.IGNORECASE)
_SIM_COM_O_QUE = re.compile(r"sim\s*[—–-]\s*\S", re.IGNORECASE)
_NAO = re.compile(r"não\b", re.IGNORECASE)

_ENTRADA_ANDAMENTO = re.compile(r"^- (\d{4}-\d{2}-\d{2})\s*[—–-]\s*\S")

# "Commits entregues": bloco ```text com a mensagem, seguido da lista "Arquivos:".
_BLOCO_TEXT = re.compile(r"^[ \t]*```text[ \t]*\n([\s\S]*?)^[ \t]*```[ \t]*$", re.MULTILINE)
_ARQUIVOS = re.compile(r"\A\s*(?:\*\*)?Arquivos:(?:\*\*)?[ \t]*\n((?:[ \t]*- \S.*(?:\n|\Z))+)")

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
    """CA-NN da task: avulsa, os '### CA-NN'; de spec, os citados em '### Critérios de aceite'."""
    if tipo == "avulsa":
        return ca_numbers_defined(texto)
    corpo = subsection_body(texto, SECAO_CONTEXTO, SUBSECAO_CRITERIOS)
    return {n for n, _ in ca_numbers_cited(texto[corpo[0]:corpo[1]])} if corpo else set()


def subsections(texto: str, secao: str) -> dict[str, tuple[int, int, int]]:
    """Subseções '### ' da seção cujo título começa com `secao`: título → (posição do título, início e fim
    do corpo), com o corpo indo até o próximo '###' ou o fim da seção. Fora de código e comentários."""
    corpo_secao = section_body(texto, secao)
    if corpo_secao is None:
        return {}
    corpo, inicio = corpo_secao
    titulos = list(_SUBSECAO.finditer(mask_code_and_comments(corpo)))
    encontradas: dict[str, tuple[int, int, int]] = {}
    for i, titulo in enumerate(titulos):
        fim = titulos[i + 1].start() if i + 1 < len(titulos) else len(corpo)
        encontradas.setdefault(titulo.group(1), (inicio + titulo.start(), inicio + titulo.end(), inicio + fim))
    return encontradas


def subsection_body(texto: str, secao: str, titulo: str) -> tuple[int, int] | None:
    """(início, fim) do corpo da subseção '### <titulo>' da seção `secao`, ou None."""
    achada = subsections(texto, secao).get(titulo)
    return (achada[1], achada[2]) if achada else None


def ler_antes(texto: str) -> tuple[int, int] | None:
    """(início, fim) do corpo de '### Ler antes de começar', na seção 3."""
    return subsection_body(texto, SECAO_O_QUE_FAZER, SUBSECAO_LER_ANTES)


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


def labels(texto: str, inicio: int, fim: int) -> dict[str, tuple[int, str]]:
    """Rótulo '- **X:**' de texto[inicio:fim] → (linha, valor). O valor inclui as linhas seguintes até o
    próximo rótulo (os rótulos são achados fora de código e comentários; o valor sai do original)."""
    trecho = texto[inicio:fim]
    rotulos = list(_ROTULO.finditer(mask_code_and_comments(trecho)))
    valores: dict[str, tuple[int, str]] = {}
    for i, rotulo in enumerate(rotulos):
        fim_valor = rotulos[i + 1].start() if i + 1 < len(rotulos) else len(trecho)
        valores.setdefault(rotulo.group(1), (line_of(texto, inicio + rotulo.start()),
                                             COMENTARIO_PATTERN.sub("", trecho[rotulo.start(2):fim_valor]).strip()))
    return valores


def closing_labels(texto: str) -> dict[str, tuple[int, str]]:
    """Rótulo da seção 6 → (linha, valor). O valor inclui as linhas seguintes até o próximo rótulo."""
    secao = section_body(texto, _SECAO_FECHAMENTO)
    if secao is None:
        return {}
    corpo, inicio = secao
    return labels(texto, inicio, inicio + len(corpo))

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


def _metadado(texto: str, padrao: re.Pattern) -> tuple[int, str] | None:
    """(posição, valor) da linha de metadado, ou None sem a linha."""
    linha = padrao.search(texto)
    return (linha.start(), linha.group(1).strip()) if linha else None


def check_type_sections(arquivo: Path, texto: str, tipo: Tipo) -> list[Finding]:
    """O que muda com o tipo, num corpo igual: a seção 1 existe nos dois; Spec e Bloqueada por são
    `não se aplica` na avulsa e só nela; a de spec liga o spec.md e cita os critérios em '### Critérios de
    aceite'; a avulsa não tem essa subseção (define os '### CA-NN')."""
    findings = check_sections(arquivo, texto, (SECAO_CONTEXTO,), prefixo=True)
    nome_tipo = "avulsa" if tipo == "avulsa" else "de spec"

    for rotulo, padrao, codigo in (("Spec", _SPEC, "spec"), ("Bloqueada por", _BLOQUEADA_POR, "bloqueada-por")):
        achado = _metadado(texto, padrao)
        if achado is None:
            findings.append(erro(arquivo, 1, f"task.{codigo}-ausente", f"{rotulo.lower()}: linha **{rotulo}:** não encontrada"))
            continue
        posicao, valor = achado
        if find_placeholders(valor):
            continue  # o placeholder do modelo já é acusado por check_placeholders
        numero = line_of(texto, posicao)
        nao_se_aplica = bool(_NAO_SE_APLICA.match(valor))
        if tipo == "avulsa" and not nao_se_aplica:
            findings.append(erro(arquivo, numero, f"task.{codigo}-na-avulsa",
                                 f"{rotulo.lower()}: task avulsa usa 'não se aplica' em **{rotulo}:**"))
        elif tipo == "spec" and (nao_se_aplica or not valor):
            findings.append(erro(arquivo, numero, f"task.{codigo}-sem-vinculo",
                                 f"{rotulo.lower()}: task de spec preenche **{rotulo}:** (não vale 'não se aplica')"))
        elif tipo == "spec" and codigo == "spec" and "spec.md" not in valor:
            findings.append(erro(arquivo, numero, "task.spec-sem-link", "spec: **Spec:** sem o link para o spec.md"))

    criterios = subsections(texto, SECAO_CONTEXTO).get(SUBSECAO_CRITERIOS)
    contexto = section_body(texto, SECAO_CONTEXTO)
    if tipo == "avulsa" and criterios is not None:
        findings.append(erro(arquivo, line_of(texto, criterios[0]), "task.criterios-na-avulsa",
                             f"critério: task avulsa define os '### CA-NN'; apague '### {SUBSECAO_CRITERIOS}'"))
    elif tipo == "spec" and criterios is None and contexto is not None:
        findings.append(erro(arquivo, line_of(texto, contexto[1]), "task.subsecao-ausente",
                             f"subseção: obrigatória ausente: ### {SUBSECAO_CRITERIOS} (## {SECAO_CONTEXTO}, task {nome_tipo})"))
    return findings


def check_subsections(arquivo: Path, texto: str, tipo: Tipo) -> list[Finding]:
    """Subseções obrigatórias presentes e não vazias (comentário não conta); "não se aplica" é resposta válida.
    Seção ausente já é acusada por check_sections: aqui só se confere o que está dentro dela."""
    findings: list[Finding] = []
    exigidas = [(SECAO_CONTEXTO, SUBSECOES_CONTEXTO), (SECAO_O_QUE_FAZER, SUBSECOES_O_QUE_FAZER)]
    criterios = subsections(texto, SECAO_CONTEXTO).get(SUBSECAO_CRITERIOS)
    if tipo == "spec" and criterios is not None:
        # Ausente é acusada por check_type_sections; aqui só vazia.
        exigidas[0] = (SECAO_CONTEXTO, (*SUBSECOES_CONTEXTO, SUBSECAO_CRITERIOS))

    for secao, titulos in exigidas:
        corpo_secao = section_body(texto, secao)
        if corpo_secao is None:
            continue
        linha_secao = line_of(texto, corpo_secao[1])
        presentes = subsections(texto, secao)
        for titulo in titulos:
            if titulo not in presentes:
                findings.append(erro(arquivo, linha_secao, "task.subsecao-ausente",
                                     f"subseção: obrigatória ausente: ### {titulo} (## {secao})"))
                continue
            posicao, inicio, fim = presentes[titulo]
            if not COMENTARIO_PATTERN.sub("", texto[inicio:fim]).strip():
                findings.append(erro(arquivo, line_of(texto, posicao), "task.subsecao-vazia",
                                     f"subseção: vazia: ### {titulo} (escreva o conteúdo ou 'não se aplica')"))
    return findings


def check_impact(arquivo: Path, texto: str) -> list[Finding]:
    """Os seis eixos do Impacto, cada um "sim — o que muda" ou "não" (CA-03).
    Subseção ausente ou vazia já é acusada por check_subsections."""
    corpo = subsection_body(texto, SECAO_O_QUE_FAZER, SUBSECAO_IMPACTO)
    if corpo is None or not COMENTARIO_PATTERN.sub("", texto[corpo[0]:corpo[1]]).strip():
        return []
    findings: list[Finding] = []
    eixos = labels(texto, *corpo)
    linha_impacto = line_of(texto, corpo[0])

    for eixo in EIXOS_IMPACTO:
        if eixo not in eixos:
            findings.append(erro(arquivo, linha_impacto, "task.impacto-eixo-ausente",
                                 f"impacto: eixo '{eixo}' ausente (responda 'sim — o que muda' ou 'não')"))
            continue
        linha, valor = eixos[eixo]
        if find_placeholders(valor):
            continue  # o placeholder do modelo já é acusado por check_placeholders
        if not valor:
            findings.append(erro(arquivo, linha, "task.impacto-eixo-vazio",
                                 f"impacto: eixo '{eixo}' vazio (responda 'sim — o que muda' ou 'não')"))
        elif _SIM.match(valor):
            if not _SIM_COM_O_QUE.match(valor):
                findings.append(erro(arquivo, linha, "task.impacto-sim-sem-o-que",
                                     f"impacto: eixo '{eixo}' com 'sim' sem dizer o quê (use 'sim — o que muda')"))
        elif not _NAO.match(valor):
            findings.append(erro(arquivo, linha, "task.impacto-eixo-sem-resposta",
                                 f"impacto: eixo '{eixo}' sem 'sim — …' ou 'não'"))
    return findings


def task_mode(texto: str) -> str | None:
    """Valor entre crases da linha **Modo:** (None sem a linha; "" sem crases)."""
    linha = _MODO.search(texto)
    if linha is None:
        return None
    valor = _PRIMEIRO_CODIGO.search(linha.group(1))
    return valor.group(1) if valor else ""


def check_mode(arquivo: Path, texto: str) -> list[Finding]:
    """**Modo:** presente, com um valor só, dentro do conjunto de dois modos."""
    linha = _MODO.search(texto)
    if linha is None:
        return [erro(arquivo, 1, "task.modo-ausente", "modo: linha **Modo:** não encontrada")]
    numero = line_of(texto, linha.start())
    if "|" in linha.group(1):
        return [erro(arquivo, numero, "task.modo-opcoes-do-modelo", "modo: lista de opções do modelo; escolha um valor")]
    modo = task_mode(texto)
    if modo not in MODOS:
        opcoes = " ou ".join(f"`{m}`" for m in MODOS)
        return [erro(arquivo, numero, "task.modo-invalido", f"modo: '{modo}' inválido (opções: {opcoes})")]
    return []


def progress_entries(texto: str) -> list[tuple[int, str]]:
    """(linha, texto) de cada linha do Andamento que abre um item (fora de código e comentários).
    Linha recuada é continuação do item anterior e não conta como entrada."""
    secao = section_body(texto, SECAO_ANDAMENTO)
    if secao is None:
        return []
    corpo, inicio = secao
    mascarado = mask_code_and_comments(corpo)
    entradas: list[tuple[int, str]] = []
    posicao = 0
    for linha in mascarado.splitlines(keepends=True):
        if linha.strip() and not linha[0].isspace():
            entradas.append((line_of(texto, inicio + posicao), corpo[posicao:posicao + len(linha)].rstrip("\n")))
        posicao += len(linha)
    return entradas


def check_progress(arquivo: Path, texto: str) -> list[Finding]:
    """Andamento presente; toda entrada '- AAAA-MM-DD — texto'; a partir de `em andamento`, pelo menos uma."""
    secao = section_body(texto, SECAO_ANDAMENTO)
    if secao is None:
        return [erro(arquivo, 1, "task.andamento-ausente", f"seção: obrigatória ausente: ## {SECAO_ANDAMENTO}")]
    findings: list[Finding] = []
    entradas = progress_entries(texto)

    for linha, conteudo in entradas:
        formato = _ENTRADA_ANDAMENTO.match(conteudo)
        try:
            data_ok = formato is not None and bool(date.fromisoformat(formato.group(1)))
        except ValueError:
            data_ok = False
        if not data_ok:
            findings.append(erro(arquivo, linha, "task.andamento-entrada-formato",
                                 f"andamento: entrada fora do formato '- AAAA-MM-DD — texto': {conteudo.strip()[:60]}"))

    status, _ = read_status(texto)
    if status in STATUS_COM_ANDAMENTO and not entradas:
        findings.append(erro(arquivo, line_of(texto, secao[1]), "task.andamento-sem-entrada",
                             f"andamento: status `{status}` sem nenhuma entrada (registre pelo menos o início)"))
    return findings


def check_commits(arquivo: Path, linha: int, valor: str) -> list[Finding]:
    """"Commits entregues": um ou mais blocos ```text (a mensagem completa), cada um seguido da lista
    "Arquivos:" com pelo menos um item. Só confere o formato; quem compara com o git log é o "encerrar"."""
    blocos = list(_BLOCO_TEXT.finditer(valor))
    if not blocos:
        return [erro(arquivo, linha, "task.commits-sem-bloco",
                     "fechamento: 'Commits entregues' sem bloco ```text com a mensagem de cada commit")]
    findings: list[Finding] = []
    for i, bloco in enumerate(blocos):
        titulo = next((l.strip() for l in bloco.group(1).splitlines() if l.strip()), "")
        if not titulo:
            findings.append(erro(arquivo, linha, "task.commits-bloco-vazio",
                                 f"fechamento: bloco ```text {i + 1} de 'Commits entregues' sem a mensagem"))
            continue
        depois = valor[bloco.end():blocos[i + 1].start() if i + 1 < len(blocos) else len(valor)]
        if not _ARQUIVOS.match(depois):
            findings.append(erro(arquivo, linha, "task.commits-sem-arquivos",
                                 f"fechamento: commit '{titulo[:72]}' sem a lista 'Arquivos:' logo depois do bloco"))
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

    corpo_criterios = subsection_body(texto, SECAO_CONTEXTO, SUBSECAO_CRITERIOS)
    secao = (texto[corpo_criterios[0]:corpo_criterios[1]], corpo_criterios[0]) if corpo_criterios else None
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
    """"Ler antes de começar" com caminhos que existem (subseção ausente: check_subsections acusa)."""
    bloco = ler_antes(texto)
    if bloco is None:
        return []
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

    commits = rotulos.get("Commits entregues")
    if commits is not None and commits[1]:
        findings.extend(check_commits(arquivo, commits[0], commits[1]))

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
        *check_mode(arquivo, texto),
        *check_sections(arquivo, texto, _SECOES_NAO_VAZIAS, prefixo=True),
        *check_type_sections(arquivo, texto, tipo),
        *check_subsections(arquivo, texto, tipo),
        *check_impact(arquivo, texto),
        *check_progress(arquivo, texto),
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
                        help="Confere também o fechamento (seção 6), como ao fechar a task.")
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
