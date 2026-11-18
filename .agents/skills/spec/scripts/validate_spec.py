"""
Valida a pasta de uma spec (spec.md obrigatório; design.md só se existir).

Verifica:

- [x] Placeholders, comentários do modelo e datas não preenchidas
- [x] Seções obrigatórias presentes e não vazias
- [x] Status válido; `aprovada` só sem item "Em aberto" que bloqueie a aprovação
- [x] Critérios CA-NN: formato do ID, IDs únicos, sequência (aviso), Dado / Quando / Então
- [x] design.md só cita CA-NN que existem no spec.md
- [x] Links relativos (lib global .agents/scripts/lib/links.py); link para tasks/ ainda não criada é aceito

Saída: `arquivo:linha [SEVERIDADE] mensagem`; exit 1 se houver erro.

Uso: python validate_spec.py <pasta da spec>
"""
import argparse
import re
import sys

from dataclasses import dataclass
from pathlib import Path

from typing import Literal

from utils import get_project_root, read_text, relative_to_root, use_global_lib

use_global_lib()
from links import broken_links  # noqa: E402  (precisa do sys.path ajustado acima)
from md_utils import (  # noqa: E402
    COMENTARIO_PATTERN as _COMENTARIO_PATTERN,
    find_placeholders,
    line_of as _linha,
    mask_code_and_comments as _mask_code_and_comments,
)


# region Variáveis auxiliares

_OPCOES_STATUS = ("rascunho", "aprovada", "em andamento", "concluída", "cancelada", "substituída")

_STATUS_PATTERN = re.compile(r"\*\*Status:\*\*\s*`([^`]+)`")
_BLOQUEIA_APROVACAO_PATTERN = re.compile(r"bloqueia:\s*aprovação")

_SECOES_OBRIGATORIAS = {
    "spec.md": (
        "Referências de produto",
        "1. Problema e objetivo",
        "2. Escopo",
        "3. Decisões de produto",
        "4. Critérios de aceite",
    ),
    "design.md": (
        "Referências técnicas",
        "1. Decisões técnicas",
        "2. Mudanças no modelo e na API (antes → depois)",
        "3. Impacto",
        "4. Riscos",
        "5. Estratégia de testes",
        "6. Tasks",
    ),
}
_SECAO_PATTERN = re.compile(r"^## (.+?)\s*$", re.MULTILINE)

_CA_TITULO_PATTERN = re.compile(r"^### (CA-\S*?):?(?:\s|$)", re.MULTILINE)
_CA_ID_VALIDO = re.compile(r"^CA-(\d{2,})$")
_TITULO_QUALQUER_PATTERN = re.compile(r"^#{2,3} ", re.MULTILINE)
_CA_PASSOS = ("Dado", "Quando", "Então")
_CA_REFERENCIA_PATTERN = re.compile(r"\bCA-(\d{2,})\b")

# endregion

@dataclass(frozen=True)
class Finding:
    """Representa um problema encontrado na validação de uma spec."""

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

# region Funções auxiliares

def _erro(arquivo: Path, linha: int, mensagem: str, linha_fim: int | None = None) -> Finding:
    return Finding(arquivo, linha, linha_fim or linha, "erro", mensagem)


def _aviso(arquivo: Path, linha: int, mensagem: str) -> Finding:
    return Finding(arquivo, linha, linha, "aviso", mensagem)


def _format_preview(texto: str, max_len: int = 80) -> str:
    """Compacta espaços e resume o meio do texto com '...' se o trecho for longo."""
    limpo = " ".join(texto.split())
    if len(limpo) <= max_len:
        return limpo

    metade = (max_len - 5) // 2
    return f"{limpo[:metade]} ... {limpo[-metade:]}"


def _ca_ids(conteudo: str) -> list[tuple[str, re.Match]]:
    """IDs dos títulos '### CA-...' fora de código e comentários, na ordem em que aparecem."""
    mascarado = _mask_code_and_comments(conteudo)
    return [(m.group(1), m) for m in _CA_TITULO_PATTERN.finditer(mascarado)]

# endregion

# region Checagens (todas recebem o arquivo e devolvem list[Finding])

def _check_placeholders(arquivo: Path) -> list[Finding]:
    """Verifica se há placeholders, comentários do modelo ou datas não preenchidas (lib md_utils)."""
    return [
        _erro(arquivo, inicio, f"{tipo}: {_format_preview(trecho, 80)}", linha_fim=fim)
        for inicio, fim, tipo, trecho in find_placeholders(read_text(arquivo))
    ]


def _check_status(arquivo: Path) -> list[Finding]:
    """Verifica se o status da spec é válido e, se aprovada, se há item 'Em aberto' bloqueando."""
    if arquivo.name != "spec.md":
        return []

    conteudo = read_text(arquivo)
    match = _STATUS_PATTERN.search(conteudo)

    if match is None:
        return [_erro(arquivo, 1, "status: linha **Status:** não encontrada")]

    findings: list[Finding] = []
    status = match.group(1)

    if status not in _OPCOES_STATUS:
        findings.append(_erro(arquivo, _linha(conteudo, match.start()), f"status: valor '{status}' inválido"))

    if status == "aprovada":
        for bloqueio in _BLOQUEIA_APROVACAO_PATTERN.finditer(conteudo):
            findings.append(
                _erro(arquivo, _linha(conteudo, bloqueio.start()),
                      "status: spec aprovada com item 'Em aberto' que bloqueia a aprovação")
            )

    return findings


def _check_sections(arquivo: Path) -> list[Finding]:
    """Verifica se as seções obrigatórias existem (título exato) e não estão vazias."""
    esperadas = _SECOES_OBRIGATORIAS.get(arquivo.name, ())
    if not esperadas:
        return []

    findings: list[Finding] = []
    conteudo = read_text(arquivo)
    secoes = list(_SECAO_PATTERN.finditer(_mask_code_and_comments(conteudo)))
    titulos = [s.group(1) for s in secoes]

    for titulo in esperadas:
        if titulo not in titulos:
            findings.append(_erro(arquivo, 1, f"seção: obrigatória ausente: ## {titulo}"))

    for i, secao in enumerate(secoes):
        if secao.group(1) not in esperadas:
            continue
        fim = secoes[i + 1].start() if i + 1 < len(secoes) else len(conteudo)
        corpo = conteudo[secao.end():fim]  # recorte no original: bloco de código conta como conteúdo
        if not _COMENTARIO_PATTERN.sub("", corpo).strip():
            findings.append(_erro(arquivo, _linha(conteudo, secao.start()), f"seção: vazia: ## {secao.group(1)}"))

    return findings


def _check_acceptance_criteria(arquivo: Path) -> list[Finding]:
    """Verifica os critérios CA-NN do spec.md: formato, unicidade, sequência e Dado/Quando/Então."""
    if arquivo.name != "spec.md":
        return []

    findings: list[Finding] = []
    conteudo = read_text(arquivo)
    mascarado = _mask_code_and_comments(conteudo)
    criterios = _ca_ids(conteudo)

    if not criterios:
        return [_erro(arquivo, 1, "critério: nenhum '### CA-NN' encontrado")]

    titulos = list(_TITULO_QUALQUER_PATTERN.finditer(mascarado))
    vistos: dict[int, int] = {}

    for ca_id, match in criterios:
        linha = _linha(conteudo, match.start())
        valido = _CA_ID_VALIDO.match(ca_id)

        if not valido:
            findings.append(_erro(arquivo, linha, f"critério: ID '{ca_id}' fora do formato CA-NN"))
        else:
            numero = int(valido.group(1))
            if numero in vistos:
                findings.append(_erro(arquivo, linha, f"critério: {ca_id} repetido (já na linha {vistos[numero]})"))
            else:
                vistos[numero] = linha

        # Corpo do critério: até o próximo título de nível 2 ou 3.
        fim = next((t.start() for t in titulos if t.start() > match.start()), len(conteudo))
        corpo = mascarado[match.end():fim]
        faltando = [p for p in _CA_PASSOS if not re.search(rf"^\s*-\s*\*\*{p}\*\*", corpo, re.MULTILINE)]
        if faltando:
            findings.append(_erro(arquivo, linha, f"critério: {ca_id} sem {', '.join(faltando)}"))

    if vistos:
        lacunas = [n for n in range(1, max(vistos) + 1) if n not in vistos]
        if lacunas:
            ausentes = ", ".join(f"CA-{n:02d}" for n in lacunas)
            findings.append(
                _aviso(arquivo, vistos[max(vistos)],
                       f"critério: sequência com lacuna ({ausentes}); ok se foi removido numa atualização")
            )

    return findings


def _check_design_ca_refs(arquivo: Path) -> list[Finding]:
    """Verifica se o design.md só cita CA-NN que existem no spec.md da mesma pasta."""
    if arquivo.name != "design.md":
        return []

    spec = arquivo.parent / "spec.md"
    existentes = {
        int(m.group(1))
        for ca_id, _ in _ca_ids(read_text(spec))
        if (m := _CA_ID_VALIDO.match(ca_id))
    }

    findings: list[Finding] = []
    conteudo = read_text(arquivo)
    for ref in _CA_REFERENCIA_PATTERN.finditer(_mask_code_and_comments(conteudo)):
        if int(ref.group(1)) not in existentes:
            findings.append(
                _erro(arquivo, _linha(conteudo, ref.start()), f"critério: {ref.group(0)} citado mas não existe no spec.md")
            )

    return findings


def _check_links(arquivo: Path) -> list[Finding]:
    """Verifica links relativos; link para tasks/ ainda não criada é aceito (a task nasce depois)."""
    conteudo = read_text(arquivo)
    findings: list[Finding] = []

    for linha, alvo in broken_links(arquivo, _mask_code_and_comments(conteudo), raiz=get_project_root()):
        if alvo.startswith("tasks/"):
            continue
        findings.append(_erro(arquivo, linha, f"link: destino não existe: {alvo}"))

    return findings

# endregion

_CHECKS = (
    _check_placeholders,
    _check_status,
    _check_sections,
    _check_acceptance_criteria,
    _check_design_ca_refs,
    _check_links,
)


def main():
    parser = argparse.ArgumentParser(description="Valida uma spec.")
    parser.add_argument("pasta_spec", type=Path, help="Caminho da pasta da spec.")
    args = parser.parse_args()

    pasta: Path = args.pasta_spec
    spec = pasta / "spec.md"
    design = pasta / "design.md"

    if not spec.exists():
        raise SystemExit(f"Erro: O arquivo 'spec.md' não foi encontrado em '{pasta}'.")

    arquivos = [spec]
    if design.exists():
        arquivos.append(design)

    todos: list[Finding] = []
    blocos: list[str] = []

    for arquivo in arquivos:
        problemas_encontrados: list[Finding] = []

        for check in _CHECKS:
            problemas_encontrados.extend(check(arquivo))

        if problemas_encontrados:
            problemas_encontrados.sort(key=lambda f: f.linha_inicio)
            todos.extend(problemas_encontrados)
            blocos.append("\n".join(str(a) for a in problemas_encontrados))

    if not blocos:
        print("Nenhum problema encontrado.")
        return

    print(f"{len(todos)} problema(s) encontrado(s) em {relative_to_root(pasta)}:")
    print("\n\n".join(blocos))

    if any(f.severidade == "erro" for f in todos):
        sys.exit(1)


if __name__ == "__main__":
    main()
