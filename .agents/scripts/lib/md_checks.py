"""Checagens de documentos Markdown compartilhadas entre os validadores das skills (spec, task).

Cada checagem recebe o arquivo (só para o relatório) e o texto, e devolve list[Finding]. Quem chama decide
quais rodar e com quais opções (status do conjunto, seções obrigatórias…). Receber o texto, e não só o
arquivo, deixa os critérios dos evals reaproveitarem as checagens em saídas de qualquer pasta.
"""

import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Callable, Literal

from links import broken_links
from md_utils import COMENTARIO_PATTERN, find_placeholders, line_of, mask_code_and_comments


# Código da regra: `<dono>.<regra>`, com o dono sendo quem define a regra (`md` para as checagens desta lib,
# `task`, `spec`, `governanca`) e a regra em minúsculas com hífen (ex.: `md.secao-vazia`).
CODIGO_VALIDO = re.compile(r"^[a-z]+\.[a-z0-9]+(?:-[a-z0-9]+)*$")


@dataclass(frozen=True)
class Finding:
    """Um problema encontrado na validação de um documento.

    A identidade do achado na base da governança é arquivo + código + mensagem (sem as linhas): por isso a
    mensagem não cita número de linha, e o código é obrigatório."""

    arquivo: Path
    linha_inicio: int
    linha_fim: int
    severidade: Literal["aviso", "erro"]
    codigo: str
    mensagem: str

    def __post_init__(self) -> None:
        if not CODIGO_VALIDO.match(self.codigo):
            raise ValueError(f"código de regra fora do formato '<dono>.<regra>': {self.codigo!r}")

    @property
    def linhas(self) -> str:
        return (
            f"{self.linha_inicio}-{self.linha_fim}"
            if self.linha_inicio != self.linha_fim
            else f"{self.linha_inicio}"
        )

    def __str__(self) -> str:
        return f"{self.arquivo.name}:{self.linhas} [{self.severidade.upper()}] {self.codigo} {self.mensagem}"


def erro(arquivo: Path, linha: int, codigo: str, mensagem: str, linha_fim: int | None = None) -> Finding:
    return Finding(arquivo, linha, linha_fim or linha, "erro", codigo, mensagem)


def aviso(arquivo: Path, linha: int, codigo: str, mensagem: str) -> Finding:
    return Finding(arquivo, linha, linha, "aviso", codigo, mensagem)


def format_preview(texto: str, max_len: int = 80) -> str:
    """Compacta espaços e resume o meio do texto com '...' se o trecho for longo."""
    limpo = " ".join(texto.split())
    if len(limpo) <= max_len:
        return limpo

    metade = (max_len - 5) // 2
    return f"{limpo[:metade]} ... {limpo[-metade:]}"


# region Placeholders

def check_placeholders(arquivo: Path, texto: str) -> list[Finding]:
    """Comentários do modelo, <placeholders> e datas AAAA-MM-DD que sobraram fora de código."""
    return [
        erro(arquivo, inicio, "md.placeholder", f"{tipo}: {format_preview(trecho, 80)}", linha_fim=fim)
        for inicio, fim, tipo, trecho in find_placeholders(texto)
    ]

# endregion

# region Metadados: status e "Atualizado em"

_STATUS_LINHA = re.compile(r"^[ \t]*-?[ \t]*\*\*Status:\*\*(.*)$", re.MULTILINE)
_PRIMEIRO_CODIGO = re.compile(r"`([^`]+)`")


def read_status(texto: str) -> tuple[str | None, int]:
    """(valor entre crases da linha **Status:**, posição da linha). (None, -1) sem a linha."""
    linha = _STATUS_LINHA.search(texto)
    if linha is None:
        return None, -1
    valor = _PRIMEIRO_CODIGO.search(linha.group(1))
    return (valor.group(1) if valor else ""), linha.start()


def check_status(arquivo: Path, texto: str, opcoes: tuple[str, ...]) -> list[Finding]:
    """Linha **Status:** presente, com um só valor (não a lista do modelo) e dentro do conjunto."""
    linha = _STATUS_LINHA.search(texto)
    if linha is None:
        return [erro(arquivo, 1, "md.status-ausente", "status: linha **Status:** não encontrada")]

    numero = line_of(texto, linha.start())
    if "|" in linha.group(1):
        return [erro(arquivo, numero, "md.status-opcoes-do-modelo", "status: lista de opções do modelo; escolha um valor")]

    status, _ = read_status(texto)
    if status not in opcoes:
        return [erro(arquivo, numero, "md.status-invalido", f"status: valor '{status}' inválido (opções: {', '.join(opcoes)})")]
    return []


_ATUALIZADO_LINHA = re.compile(r"^[ \t]*-?[ \t]*\*\*Atualizado em:\*\*(.*)$", re.MULTILINE)
_CRIADO_LINHA = re.compile(r"\*\*Criado em:\*\*\s*(\d{4}-\d{2}-\d{2})")
_DATA_E_MOTIVO = re.compile(r"^\s*(\d{4}-\d{2}-\d{2})\s*[—–-]\s*\S")


def _data(texto: str) -> date | None:
    try:
        return date.fromisoformat(texto)
    except ValueError:
        return None


def check_updated_at(arquivo: Path, texto: str) -> list[Finding]:
    """"**Atualizado em:** AAAA-MM-DD — motivo" com data real e motivo; não anterior ao "Criado em"."""
    linha = _ATUALIZADO_LINHA.search(texto)
    if linha is None:
        return [erro(arquivo, 1, "md.atualizado-ausente", "atualizado em: linha **Atualizado em:** não encontrada")]

    numero = line_of(texto, linha.start())
    valor = linha.group(1)
    if find_placeholders(valor):
        return []  # o placeholder já é acusado por check_placeholders

    formato = _DATA_E_MOTIVO.match(valor)
    atualizado = _data(formato.group(1)) if formato else None
    if atualizado is None:
        return [erro(arquivo, numero, "md.atualizado-formato", "atualizado em: use 'AAAA-MM-DD — motivo' (data válida e motivo)")]

    criado_m = _CRIADO_LINHA.search(texto)
    criado = _data(criado_m.group(1)) if criado_m else None
    if criado and atualizado < criado:
        return [erro(arquivo, numero, "md.atualizado-antes-da-criacao", f"atualizado em: {atualizado} é anterior ao 'Criado em' ({criado})")]
    return []


def _metadata_line(rotulo: str) -> re.Pattern:
    """Linha '- **Rótulo:** valor' mais as linhas recuadas logo abaixo (continuação do valor)."""
    return re.compile(rf"^([ \t]*-?[ \t]*\*\*{re.escape(rotulo)}:\*\*)[^\n]*(?:\n[ \t]+\S[^\n]*)*", re.MULTILINE)


def read_metadata(texto: str, rotulo: str) -> str | None:
    """Valor da linha de metadado '- **Rótulo:**', com as continuações juntadas; None sem a linha."""
    linha = _metadata_line(rotulo).search(texto)
    if linha is None:
        return None
    return " ".join(linha.group(0)[len(linha.group(1)):].split())


def set_metadata(texto: str, rotulo: str, valor: str) -> str:
    """Troca o valor da linha de metadado '- **Rótulo:**' (e as continuações) por `valor`, numa linha só.
    ValueError sem a linha: quem chama confere antes (o validador acusa metadado ausente)."""
    texto_novo, trocas = _metadata_line(rotulo).subn(lambda m: f"{m.group(1)} {valor}", texto, count=1)
    if trocas == 0:
        raise ValueError(f"linha **{rotulo}:** não encontrada")
    return texto_novo


def set_updated_at(texto: str, dia: date, motivo: str) -> str:
    """"**Atualizado em:** AAAA-MM-DD — motivo"."""
    return set_metadata(texto, "Atualizado em", f"{dia.isoformat()} — {motivo}")


def add_progress_entry(texto: str, secao: str, dia: date, entrada: str) -> str:
    """Acrescenta '- AAAA-MM-DD — entrada' no fim da seção `secao` (o Andamento), antes da seção seguinte.
    `entrada` pode ter várias linhas (um bloco de código logo abaixo, por exemplo). ValueError sem a seção."""
    corpo = section_body(texto, secao)
    if corpo is None:
        raise ValueError(f"seção '## {secao}' não encontrada")
    conteudo, inicio = corpo
    fim = inicio + len(conteudo)
    separador = "\n" if conteudo.strip() else "\n\n"  # seção vazia: linha em branco depois do título
    novo = f"{texto[:fim].rstrip()}{separador}- {dia.isoformat()} — {entrada.rstrip()}\n"
    depois = texto[fim:]
    return novo + (f"\n{depois}" if depois else "")

# endregion

# region "Em aberto" (task, spec e design)

_NADA = re.compile(r"^\s*nada\.?\s*$", re.IGNORECASE)


def open_items(texto: str, secao: str, subsecao: str = "Em aberto") -> list[tuple[int, str]] | None:
    """(linha, texto) de cada item de '### Em aberto' da seção `secao`; [] quando diz "nada"; None sem a
    subseção (ausente é acusada pela checagem de subseções). Item = linha que abre um item de lista ou, sem
    lista, cada parágrafo; escrito de qualquer jeito (sem marcador exato). Comentários não contam."""
    corpo = subsection_body(texto, secao, subsecao)
    if corpo is None:
        return None
    inicio, fim = corpo
    trecho = COMENTARIO_PATTERN.sub(lambda m: "".join("\n" if c == "\n" else " " for c in m.group(0)),
                                    texto[inicio:fim])
    if not trecho.strip() or _NADA.match(trecho):
        return []
    itens: list[tuple[int, str]] = []
    posicao = 0
    anterior_vazia = True
    for linha in trecho.split("\n"):
        conteudo = linha.strip()
        abre = conteudo and (linha[:1] not in (" ", "\t") and (conteudo.startswith(("-", "*")) or anterior_vazia))
        if abre:
            itens.append((line_of(texto, inicio + posicao), conteudo.lstrip("-* ").strip()))
        anterior_vazia = not conteudo
        posicao += len(linha) + 1
    return itens

# endregion

# region Seções

_SECAO = re.compile(r"^## (.+?)\s*$", re.MULTILINE)


def section_titles(texto: str) -> list[re.Match]:
    """Títulos '## ...' fora de código e comentários (exemplos do modelo não contam)."""
    return list(_SECAO.finditer(mask_code_and_comments(texto)))


def section_body(texto: str, comeco_titulo: str) -> tuple[str, int] | None:
    """(corpo da seção cujo título começa com `comeco_titulo`, posição do corpo) ou None."""
    secoes = section_titles(texto)
    for i, secao in enumerate(secoes):
        if secao.group(1).startswith(comeco_titulo):
            fim = secoes[i + 1].start() if i + 1 < len(secoes) else len(texto)
            return texto[secao.end():fim], secao.end()
    return None


def check_sections(arquivo: Path, texto: str, esperadas: tuple[str, ...], prefixo: bool = False) -> list[Finding]:
    """Seções obrigatórias presentes e não vazias. prefixo=True aceita sufixo no título
    (ex.: '## 2. Contexto e critérios (task avulsa)' para a esperada '2. Contexto e critérios')."""
    def casa(titulo: str, esperada: str) -> bool:
        return titulo.startswith(esperada) if prefixo else titulo == esperada

    findings: list[Finding] = []
    secoes = section_titles(texto)
    titulos = [s.group(1) for s in secoes]

    for esperada in esperadas:
        if not any(casa(t, esperada) for t in titulos):
            findings.append(erro(arquivo, 1, "md.secao-ausente", f"seção: obrigatória ausente: ## {esperada}"))

    for i, secao in enumerate(secoes):
        if not any(casa(secao.group(1), e) for e in esperadas):
            continue
        fim = secoes[i + 1].start() if i + 1 < len(secoes) else len(texto)
        corpo = texto[secao.end():fim]  # recorte no original: bloco de código conta como conteúdo
        if not COMENTARIO_PATTERN.sub("", corpo).strip():
            findings.append(erro(arquivo, line_of(texto, secao.start()), "md.secao-vazia", f"seção: vazia: ## {secao.group(1)}"))

    return findings

# endregion

# region Subseções "###", rótulos e eixos do Impacto (modelos de task, spec e design)

_SUBSECAO = re.compile(r"^### (.+?)[ \t]*$", re.MULTILINE)
_ROTULO = re.compile(r"^- \*\*(.+?):\*\*[ \t]*(.*)$", re.MULTILINE)


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


def check_subsections(arquivo: Path, texto: str, exigidas: list[tuple[str, tuple[str, ...]]],
                      dono: str) -> list[Finding]:
    """Subseções obrigatórias presentes e não vazias (comentário não conta); "não se aplica" é resposta
    válida. `exigidas`: [(seção, títulos)]. Seção ausente é de check_sections: aqui só o que está dentro dela.
    `dono` é o prefixo do código (`task`, `spec`)."""
    findings: list[Finding] = []
    for secao, titulos in exigidas:
        corpo_secao = section_body(texto, secao)
        if corpo_secao is None:
            continue
        linha_secao = line_of(texto, corpo_secao[1])
        presentes = subsections(texto, secao)
        for titulo in titulos:
            if titulo not in presentes:
                findings.append(erro(arquivo, linha_secao, f"{dono}.subsecao-ausente",
                                     f"subseção: obrigatória ausente: ### {titulo} (## {secao})"))
                continue
            posicao, inicio, fim = presentes[titulo]
            if not COMENTARIO_PATTERN.sub("", texto[inicio:fim]).strip():
                findings.append(erro(arquivo, line_of(texto, posicao), f"{dono}.subsecao-vazia",
                                     f"subseção: vazia: ### {titulo} (escreva o conteúdo ou 'não se aplica')"))
    return findings


EIXOS_IMPACTO = ("Contrato da API", "Banco", "Front", "Permissões e segurança",
                 "Testes existentes que mudam de propósito", "Documentação")

# Eixo do Impacto: "sim — o que muda" (travessão como no "Atualizado em": —, – ou -) ou "não" (com ou sem
# comentário depois).
_SIM = re.compile(r"sim\b", re.IGNORECASE)
_SIM_COM_O_QUE = re.compile(r"sim\s*[—–-]\s*\S", re.IGNORECASE)
_NAO = re.compile(r"não\b", re.IGNORECASE)


def check_impact_axes(arquivo: Path, texto: str, inicio: int, fim: int, dono: str) -> list[Finding]:
    """Os seis eixos do Impacto em texto[inicio:fim], cada um "sim — o que muda" ou "não". Corpo vazio não é
    acusado aqui (é da checagem de subseções). `dono` é o prefixo do código (`task`, `spec`)."""
    if not COMENTARIO_PATTERN.sub("", texto[inicio:fim]).strip():
        return []
    findings: list[Finding] = []
    eixos = labels(texto, inicio, fim)
    linha_impacto = line_of(texto, inicio)

    for eixo in EIXOS_IMPACTO:
        if eixo not in eixos:
            findings.append(erro(arquivo, linha_impacto, f"{dono}.impacto-eixo-ausente",
                                 f"impacto: eixo '{eixo}' ausente (responda 'sim — o que muda' ou 'não')"))
            continue
        linha, valor = eixos[eixo]
        if find_placeholders(valor):
            continue  # o placeholder do modelo já é acusado por check_placeholders
        if not valor:
            findings.append(erro(arquivo, linha, f"{dono}.impacto-eixo-vazio",
                                 f"impacto: eixo '{eixo}' vazio (responda 'sim — o que muda' ou 'não')"))
        elif _SIM.match(valor):
            if not _SIM_COM_O_QUE.match(valor):
                findings.append(erro(arquivo, linha, f"{dono}.impacto-sim-sem-o-que",
                                     f"impacto: eixo '{eixo}' com 'sim' sem dizer o quê (use 'sim — o que muda')"))
        elif not _NAO.match(valor):
            findings.append(erro(arquivo, linha, f"{dono}.impacto-eixo-sem-resposta",
                                 f"impacto: eixo '{eixo}' sem 'sim — …' ou 'não'"))
    return findings


# Regra dos eixos (CA-13): eixo "sim" → critério de spec do AGENTS.md ("Spec ou task?") que parece valer.
CRITERIOS_SPEC = {
    1: "cria um agregado ou coleção nova, ou muda como os agregados se relacionam",
    3: "vai virar mais de uma task",
    4: "muda o contrato da API em mais de um recurso",
}
EIXOS_PARA_SPEC = 4  # quatro ou mais eixos "sim" → critério 3


def possible_spec_criteria(texto: str, inicio: int, fim: int) -> list[tuple[int, str]]:
    """(critério, motivo) de spec que os eixos do Impacto em texto[inicio:fim] apontam, na ordem 1, 4, 3:
    banco "sim" → 1; contrato da API "sim" → 4; quatro ou mais eixos "sim" → 3. Só aponta: quem decide é o
    Juno."""
    eixos = labels(texto, inicio, fim)
    sim = [eixo for eixo in EIXOS_IMPACTO if eixo in eixos and _SIM.match(eixos[eixo][1])]
    criterios: list[tuple[int, str]] = []
    if "Banco" in sim:
        criterios.append((1, "eixo 'Banco' com 'sim'"))
    if "Contrato da API" in sim:
        criterios.append((4, "eixo 'Contrato da API' com 'sim'"))
    if len(sim) >= EIXOS_PARA_SPEC:
        criterios.append((3, f"{len(sim)} eixos do Impacto com 'sim' ({', '.join(sim)})"))
    return criterios


def format_spec_warning(criterios: list[tuple[int, str]]) -> list[str]:
    """Linhas do aviso de possível spec ([] sem critério): o critério, o texto dele no AGENTS.md e o motivo."""
    if not criterios:
        return []
    linhas = ["Aviso: esta task talvez seja spec (seção \"Spec ou task?\" do AGENTS.md):"]
    linhas += [f"- critério {n} ({CRITERIOS_SPEC[n]}): {motivo}" for n, motivo in criterios]
    linhas.append("Reavalie e pergunte ao Juno se segue como task ou vira spec; o aviso não bloqueia.")
    return linhas

# endregion

# region Lista de tasks do design.md ("## 6. Tasks")

SECAO_TASKS = "6. Tasks"

# Item: marcador de lista, caixa opcional ("[ ]"), risco opcional ("~~"), link opcional e "NN — título".
_ITEM_TASK = re.compile(r"^[ \t]*[-*][ \t]+(?:\[[ xX]\][ \t]*)?(~~)?(\[)?(\d{2})[ \t]*[—–-][ \t]*(.*)$")
_LINK_ITEM = re.compile(r"^([^\]]+)\]\((tasks/[^)\s]+\.md)\)(.*)$")
_BLOQUEADA_POR_ITEM = re.compile(r"bloqueada por:?\s*(.+?)\s*(?:[—–]|$)")
_COBRE_ITEM = re.compile(r"cobre:?\s*(.+?)\s*(?:~~|\s[—–]\s|$)")


@dataclass(frozen=True)
class TaskItem:
    """Um item da lista de tasks do design.md, com as linhas de continuação juntadas."""

    numero: str
    titulo: str
    alvo: str | None          # tasks/NN-x.md, quando o item tem link
    linha: int
    texto: str                # o item inteiro numa linha só
    riscada: bool
    bloqueada_por: str | None
    cobre: str | None


def task_list_items(texto: str) -> list[TaskItem]:
    """Itens da lista "## 6. Tasks": a linha que abre o item é o marcador seguido de "NN —"; as linhas recuadas
    logo abaixo são continuação (o item que quebra linha é lido inteiro). Outras linhas (notas) não contam."""
    secao = section_body(texto, SECAO_TASKS)
    if secao is None:
        return []
    corpo, inicio = secao
    mascarado = COMENTARIO_PATTERN.sub(lambda m: "".join("\n" if c == "\n" else " " for c in m.group(0)), corpo)
    linhas = mascarado.split("\n")
    itens: list[TaskItem] = []
    posicao = 0
    i = 0
    while i < len(linhas):
        abre = _ITEM_TASK.match(linhas[i])
        if abre is None:
            posicao += len(linhas[i]) + 1
            i += 1
            continue
        linha = line_of(texto, inicio + posicao)
        partes = [linhas[i].strip()]
        posicao += len(linhas[i]) + 1
        i += 1
        while i < len(linhas) and linhas[i][:1] in (" ", "\t") and linhas[i].strip() \
                and not _ITEM_TASK.match(linhas[i]):
            partes.append(linhas[i].strip())
            posicao += len(linhas[i]) + 1
            i += 1
        inteiro = " ".join(partes)
        riscada, colchete, numero, resto = abre.groups()
        resto = " ".join([resto, *partes[1:]])
        titulo, alvo = resto, None
        if colchete:
            link = _LINK_ITEM.match(resto)
            if link:
                titulo, alvo, resto = link.group(1), link.group(2), link.group(3)
        else:
            titulo = re.split(r"\s+[—–]\s+", resto, maxsplit=1)[0]
        bloqueio = _BLOQUEADA_POR_ITEM.search(resto)
        cobre = _COBRE_ITEM.search(resto)
        itens.append(TaskItem(
            numero=numero,
            titulo=titulo.strip().strip("~").strip(),
            alvo=alvo,
            linha=linha,
            texto=inteiro,
            riscada=bool(riscada),
            bloqueada_por=bloqueio.group(1).strip() if bloqueio else None,
            cobre=cobre.group(1).strip().rstrip(".") if cobre else None,
        ))
    return itens

# region Status das tasks (de spec e avulsas) e rótulos do fechamento

# Task fechada: não conta mais como pendência (em done/ só ficam estas).
TASK_FECHADA = ("concluída", "cancelada")


def status_of(arquivo: Path) -> str | None:
    """Valor da linha **Status:** do arquivo (task ou spec); None sem a linha."""
    return read_status(arquivo.read_text(encoding="utf-8"))[0]


def spec_tasks(pasta_spec: Path) -> list[Path]:
    """Arquivos .md de <pasta da spec>/tasks/, em ordem (sem subpastas como done/)."""
    pasta = pasta_spec / "tasks"
    return sorted(p for p in pasta.glob("*.md") if p.is_file()) if pasta.is_dir() else []


def spec_task_status(pasta_tasks: Path, arquivo: str | None) -> str:
    """Status atual de uma task da spec: lido do arquivo; em done/ é concluída; sem arquivo, 'não criada'."""
    if arquivo is None:
        return "não criada"
    if (pasta_tasks / "done" / arquivo).exists():
        return "concluída"
    caminho = pasta_tasks / arquivo
    if not caminho.exists():
        return "não criada"
    return status_of(caminho) or "sem status"


def closing_labels(texto: str, secao: str) -> dict[str, tuple[int, str]]:
    """Rótulo do fechamento (a seção `secao`) → (linha, valor). O valor inclui as linhas seguintes até o
    próximo rótulo; sem a seção, {}."""
    corpo = section_body(texto, secao)
    if corpo is None:
        return {}
    conteudo, inicio = corpo
    return labels(texto, inicio, inicio + len(conteudo))

# endregion
# endregion

# region Resumo da saída

def summary_line(findings: list[Finding]) -> str:
    """Última linha da saída dos validadores: 'N erro(s), M aviso(s)'."""
    erros = sum(1 for f in findings if f.severidade == "erro")
    return f"{erros} erro(s), {len(findings) - erros} aviso(s)"


def refusal_lines(acao: str, sujeito: str, problemas: list[str]) -> list[str]:
    """Saída da recusa dos scripts do fluxo: '<Ação> recusado: <sujeito> tem N problema(s); nada foi mudado.' e
    um '- problema' por linha (ex.: acao='Iniciar', sujeito='a task x.md')."""
    return [f"{acao} recusado: {sujeito} tem {len(problemas)} problema(s); nada foi mudado.",
            *(f"- {p}" for p in problemas)]

# endregion

# region Critérios de aceite (CA-NN)

_CA_TITULO = re.compile(r"^### (CA-\S*?):?(?:\s|$)", re.MULTILINE)
CA_ID_VALIDO = re.compile(r"^CA-(\d{2,})$")
_TITULO_QUALQUER = re.compile(r"^#{2,3} ", re.MULTILINE)
_CA_PASSOS = ("Dado", "Quando", "Então")
_CA_REFERENCIA = re.compile(r"\bCA-(\d{2,})\b")
_CA_INTERVALO = re.compile(r"\bCA-(\d{2,})\s*(?:a|até|–|-)\s*CA-(\d{2,})\b")
CA_PASSO_LINHA = re.compile(r"^\s*-\s*\*\*(?:Dado|Quando|Então)\*\*", re.MULTILINE)


def ca_titles(texto: str) -> list[tuple[str, re.Match]]:
    """IDs dos títulos '### CA-...' fora de código e comentários, na ordem em que aparecem."""
    return [(m.group(1), m) for m in _CA_TITULO.finditer(mask_code_and_comments(texto))]


def ca_numbers_defined(texto: str) -> set[int]:
    """Números dos '### CA-NN' válidos do texto."""
    return {int(m.group(1)) for ca_id, _ in ca_titles(texto) if (m := CA_ID_VALIDO.match(ca_id))}


def ca_numbers_cited(texto: str) -> list[tuple[int, int]]:
    """(número, posição) de cada CA-NN citado fora de código e comentários; 'CA-04 a CA-08' vira 04..08."""
    mascarado = mask_code_and_comments(texto)
    citados: list[tuple[int, int]] = []
    intervalos = list(_CA_INTERVALO.finditer(mascarado))
    for intervalo in intervalos:
        inicio, fim = int(intervalo.group(1)), int(intervalo.group(2))
        citados.extend((n, intervalo.start()) for n in range(inicio, fim + 1))
    dentro = [(i.start(), i.end()) for i in intervalos]
    for ref in _CA_REFERENCIA.finditer(mascarado):
        if not any(a <= ref.start() < b for a, b in dentro):
            citados.append((int(ref.group(1)), ref.start()))
    return citados


def check_acceptance_criteria(arquivo: Path, texto: str) -> list[Finding]:
    """Critérios '### CA-NN': pelo menos um, formato do ID, unicidade, sequência (aviso) e Dado/Quando/Então."""
    findings: list[Finding] = []
    mascarado = mask_code_and_comments(texto)
    criterios = ca_titles(texto)

    if not criterios:
        return [erro(arquivo, 1, "md.criterio-nenhum", "critério: nenhum '### CA-NN' encontrado")]

    titulos = list(_TITULO_QUALQUER.finditer(mascarado))
    vistos: dict[int, int] = {}

    for ca_id, match in criterios:
        linha = line_of(texto, match.start())
        valido = CA_ID_VALIDO.match(ca_id)

        if not valido:
            findings.append(erro(arquivo, linha, "md.criterio-id-invalido", f"critério: ID '{ca_id}' fora do formato CA-NN"))
        else:
            numero = int(valido.group(1))
            if numero in vistos:
                findings.append(erro(arquivo, linha, "md.criterio-repetido", f"critério: {ca_id} repetido"))
            else:
                vistos[numero] = linha

        # Corpo do critério: até o próximo título de nível 2 ou 3.
        fim = next((t.start() for t in titulos if t.start() > match.start()), len(texto))
        corpo = mascarado[match.end():fim]
        faltando = [p for p in _CA_PASSOS if not re.search(rf"^\s*-\s*\*\*{p}\*\*", corpo, re.MULTILINE)]
        if faltando:
            findings.append(erro(arquivo, linha, "md.criterio-sem-passo", f"critério: {ca_id} sem {', '.join(faltando)}"))

    if vistos:
        lacunas = [n for n in range(1, max(vistos) + 1) if n not in vistos]
        if lacunas:
            ausentes = ", ".join(f"CA-{n:02d}" for n in lacunas)
            findings.append(
                aviso(arquivo, vistos[max(vistos)], "md.criterio-lacuna",
                      f"critério: sequência com lacuna ({ausentes}); ok se foi removido numa atualização")
            )

    return findings


def check_ca_refs_exist(arquivo: Path, texto: str, existentes: set[int], origem: str) -> list[Finding]:
    """Todo CA-NN citado em `texto` existe em `existentes` (os definidos em `origem`, ex.: 'spec.md')."""
    return [
        erro(arquivo, line_of(texto, pos), "md.criterio-inexistente", f"critério: CA-{n:02d} citado mas não existe no {origem}")
        for n, pos in sorted(ca_numbers_cited(texto), key=lambda c: c[1])
        if n not in existentes
    ]

# endregion

# region Caminhos e links

# Caminho de arquivo citado no texto: tem "/" e extensão (api/src/x.use-case.ts, .agents/docs/y.md), com
# ":linha" opcional. Fica de fora o que vem depois de "://" (URL) ou de "*" (glob).
_CAMINHO = re.compile(r"(?<![\w.*/:\-])((?:\.{1,2}/)*[\w.\-\[\]]+(?:/[\w.\-\[\]]+)+\.[A-Za-z]{1,5})(?=[:\s`'\")\],;]|\.(?!\w)|$)")


def find_paths(texto: str) -> list[tuple[str, int]]:
    """(caminho, posição) de cada caminho de arquivo citado em `texto` (dentro ou fora de código)."""
    return [(m.group(1), m.start(1)) for m in _CAMINHO.finditer(texto)]


def check_paths_exist(arquivo: Path, texto: str, inicio: int, fim: int, raiz: Path, rotulo: str,
                      codigo: str) -> list[Finding]:
    """Todo caminho citado em texto[inicio:fim] existe. Relativo à raiz; './' e '../', relativo ao arquivo.
    `codigo` é o da regra de quem chama (a regra é dele; a lib só sabe procurar)."""
    findings: list[Finding] = []
    for caminho, pos in find_paths(texto[inicio:fim]):
        base = arquivo.parent if caminho.split("/")[0] in (".", "..") else raiz
        if not (base / caminho).exists():
            findings.append(erro(arquivo, line_of(texto, inicio + pos), codigo, f"{rotulo}: caminho não existe: {caminho}"))
    return findings


def check_links(arquivo: Path, texto: str, raiz: Path, ignorar: Callable[[str], bool] = lambda alvo: False) -> list[Finding]:
    """Links relativos cujo destino não existe; `ignorar(alvo)` aceita destinos que ainda vão nascer."""
    return [
        erro(arquivo, linha, "md.link-quebrado", f"link: destino não existe: {alvo}")
        for linha, alvo in broken_links(arquivo, mask_code_and_comments(texto), raiz=raiz)
        if not ignorar(alvo)
    ]

# endregion


__all__ = [
    "CA_ID_VALIDO", "CA_PASSO_LINHA", "CODIGO_VALIDO", "CRITERIOS_SPEC", "Finding", "add_progress_entry", "aviso",
    "ca_numbers_cited", "ca_numbers_defined", "ca_titles", "check_acceptance_criteria", "check_ca_refs_exist",
    "check_links", "check_paths_exist", "check_placeholders", "check_sections", "check_status", "check_updated_at",
    "erro", "find_paths", "format_preview", "format_spec_warning", "open_items", "possible_spec_criteria",
    "read_metadata", "read_status", "section_body", "section_titles", "set_metadata", "set_updated_at",
]
