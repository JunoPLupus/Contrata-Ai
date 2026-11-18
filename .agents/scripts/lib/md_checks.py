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


@dataclass(frozen=True)
class Finding:
    """Um problema encontrado na validação de um documento."""

    arquivo: Path
    linha_inicio: int
    linha_fim: int
    severidade: Literal["aviso", "erro"]
    mensagem: str

    def __str__(self) -> str:
        linhas = (
            f"{self.linha_inicio}-{self.linha_fim}"
            if self.linha_inicio != self.linha_fim
            else f"{self.linha_inicio}"
        )
        return f"{self.arquivo.name}:{linhas} [{self.severidade.upper()}] {self.mensagem}"


def erro(arquivo: Path, linha: int, mensagem: str, linha_fim: int | None = None) -> Finding:
    return Finding(arquivo, linha, linha_fim or linha, "erro", mensagem)


def aviso(arquivo: Path, linha: int, mensagem: str) -> Finding:
    return Finding(arquivo, linha, linha, "aviso", mensagem)


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
        erro(arquivo, inicio, f"{tipo}: {format_preview(trecho, 80)}", linha_fim=fim)
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
        return [erro(arquivo, 1, "status: linha **Status:** não encontrada")]

    numero = line_of(texto, linha.start())
    if "|" in linha.group(1):
        return [erro(arquivo, numero, "status: lista de opções do modelo; escolha um valor")]

    status, _ = read_status(texto)
    if status not in opcoes:
        return [erro(arquivo, numero, f"status: valor '{status}' inválido (opções: {', '.join(opcoes)})")]
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
        return [erro(arquivo, 1, "atualizado em: linha **Atualizado em:** não encontrada")]

    numero = line_of(texto, linha.start())
    valor = linha.group(1)
    if find_placeholders(valor):
        return []  # o placeholder já é acusado por check_placeholders

    formato = _DATA_E_MOTIVO.match(valor)
    atualizado = _data(formato.group(1)) if formato else None
    if atualizado is None:
        return [erro(arquivo, numero, "atualizado em: use 'AAAA-MM-DD — motivo' (data válida e motivo)")]

    criado_m = _CRIADO_LINHA.search(texto)
    criado = _data(criado_m.group(1)) if criado_m else None
    if criado and atualizado < criado:
        return [erro(arquivo, numero, f"atualizado em: {atualizado} é anterior ao 'Criado em' ({criado})")]
    return []

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
            findings.append(erro(arquivo, 1, f"seção: obrigatória ausente: ## {esperada}"))

    for i, secao in enumerate(secoes):
        if not any(casa(secao.group(1), e) for e in esperadas):
            continue
        fim = secoes[i + 1].start() if i + 1 < len(secoes) else len(texto)
        corpo = texto[secao.end():fim]  # recorte no original: bloco de código conta como conteúdo
        if not COMENTARIO_PATTERN.sub("", corpo).strip():
            findings.append(erro(arquivo, line_of(texto, secao.start()), f"seção: vazia: ## {secao.group(1)}"))

    return findings

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
        return [erro(arquivo, 1, "critério: nenhum '### CA-NN' encontrado")]

    titulos = list(_TITULO_QUALQUER.finditer(mascarado))
    vistos: dict[int, int] = {}

    for ca_id, match in criterios:
        linha = line_of(texto, match.start())
        valido = CA_ID_VALIDO.match(ca_id)

        if not valido:
            findings.append(erro(arquivo, linha, f"critério: ID '{ca_id}' fora do formato CA-NN"))
        else:
            numero = int(valido.group(1))
            if numero in vistos:
                findings.append(erro(arquivo, linha, f"critério: {ca_id} repetido (já na linha {vistos[numero]})"))
            else:
                vistos[numero] = linha

        # Corpo do critério: até o próximo título de nível 2 ou 3.
        fim = next((t.start() for t in titulos if t.start() > match.start()), len(texto))
        corpo = mascarado[match.end():fim]
        faltando = [p for p in _CA_PASSOS if not re.search(rf"^\s*-\s*\*\*{p}\*\*", corpo, re.MULTILINE)]
        if faltando:
            findings.append(erro(arquivo, linha, f"critério: {ca_id} sem {', '.join(faltando)}"))

    if vistos:
        lacunas = [n for n in range(1, max(vistos) + 1) if n not in vistos]
        if lacunas:
            ausentes = ", ".join(f"CA-{n:02d}" for n in lacunas)
            findings.append(
                aviso(arquivo, vistos[max(vistos)],
                      f"critério: sequência com lacuna ({ausentes}); ok se foi removido numa atualização")
            )

    return findings


def check_ca_refs_exist(arquivo: Path, texto: str, existentes: set[int], origem: str) -> list[Finding]:
    """Todo CA-NN citado em `texto` existe em `existentes` (os definidos em `origem`, ex.: 'spec.md')."""
    return [
        erro(arquivo, line_of(texto, pos), f"critério: CA-{n:02d} citado mas não existe no {origem}")
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


def check_paths_exist(arquivo: Path, texto: str, inicio: int, fim: int, raiz: Path, rotulo: str) -> list[Finding]:
    """Todo caminho citado em texto[inicio:fim] existe. Relativo à raiz; './' e '../', relativo ao arquivo."""
    findings: list[Finding] = []
    for caminho, pos in find_paths(texto[inicio:fim]):
        base = arquivo.parent if caminho.split("/")[0] in (".", "..") else raiz
        if not (base / caminho).exists():
            findings.append(erro(arquivo, line_of(texto, inicio + pos), f"{rotulo}: caminho não existe: {caminho}"))
    return findings


def check_links(arquivo: Path, texto: str, raiz: Path, ignorar: Callable[[str], bool] = lambda alvo: False) -> list[Finding]:
    """Links relativos cujo destino não existe; `ignorar(alvo)` aceita destinos que ainda vão nascer."""
    return [
        erro(arquivo, linha, f"link: destino não existe: {alvo}")
        for linha, alvo in broken_links(arquivo, mask_code_and_comments(texto), raiz=raiz)
        if not ignorar(alvo)
    ]

# endregion


__all__ = [
    "CA_ID_VALIDO", "CA_PASSO_LINHA", "Finding", "aviso", "ca_numbers_cited", "ca_numbers_defined", "ca_titles",
    "check_acceptance_criteria", "check_ca_refs_exist", "check_links", "check_paths_exist", "check_placeholders",
    "check_sections", "check_status", "check_updated_at", "erro", "find_paths", "format_preview",
    "read_status", "section_body", "section_titles",
]
