"""
Valida a pasta de uma spec (spec.md obrigatório; design.md só se existir).

Verifica:

- [x] Placeholders, comentários do modelo e datas não preenchidas
- [x] Seções obrigatórias presentes e não vazias
- [x] Subseções "###" obrigatórias presentes e não vazias ("não se aplica" vale): no spec.md, Problema,
      Objetivo, Entra, Fica fora, Fechadas e Em aberto; no design.md, Fechadas, Em aberto, ADR novo? e Impacto
- [x] design.md: Impacto com os seis eixos da task, cada um "sim — o que muda" ou "não"
- [x] Status válido; a partir de `aprovada`, "Em aberto" do spec.md igual a "nada" (cada item é acusado)
- [x] design.md: cada item da lista de tasks com "bloqueada por" e "cobre" (lido inteiro, mesmo quebrando linha;
      item riscado, de task cancelada, fica de fora)
- [x] "Atualizado em" com data e motivo
- [x] Critérios CA-NN: formato do ID, IDs únicos, sequência (aviso), Dado / Quando / Então
- [x] design.md só cita CA-NN que existem no spec.md
- [x] Links relativos; link para tasks/ ainda não criada é aceito

As checagens comuns com a skill task moram na lib global (.agents/scripts/lib/md_checks.py).

Saída: `arquivo:linha [SEVERIDADE] código mensagem` e, no fim, `N erro(s), M aviso(s)`; exit 1 se houver erro.

Uso: python validate_spec.py <pasta da spec>
"""
import argparse
import re
import sys
from pathlib import Path

from utils import get_project_root, read_text, relative_to_root, use_global_lib

use_global_lib()
from md_checks import (  # noqa: E402  (precisa do sys.path ajustado acima)
    CA_ID_VALIDO,
    Finding,
    ca_titles,
    check_acceptance_criteria,
    check_ca_refs_exist,
    check_impact_axes,
    check_links,
    check_placeholders,
    check_sections,
    check_status,
    check_subsections,
    check_updated_at,
    erro,
    format_preview,
    read_status,
    subsection_body,
    summary_line,
    task_list_items,
)
from md_utils import COMENTARIO_PATTERN, line_of, mask_code_and_comments  # noqa: E402


# region Variáveis auxiliares

_OPCOES_STATUS = ("rascunho", "aprovada", "em andamento", "concluída", "cancelada", "substituída")

# A partir da aprovação, o "Em aberto" do spec.md precisa dizer "nada".
STATUS_SEM_ABERTO = ("aprovada", "em andamento", "concluída")
_NADA = re.compile(r"^\s*nada\.?\s*$", re.IGNORECASE)

SECAO_DECISOES_SPEC = "3. Decisões de produto"
SUBSECAO_EM_ABERTO = "Em aberto"

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

# Subseções "###" obrigatórias de cada arquivo: (seção, títulos). Nunca apagadas; "não se aplica" vale.
SUBSECOES_OBRIGATORIAS = {
    "spec.md": [
        ("1. Problema e objetivo", ("Problema", "Objetivo")),
        ("2. Escopo", ("Entra", "Fica fora")),
        (SECAO_DECISOES_SPEC, ("Fechadas", SUBSECAO_EM_ABERTO)),
    ],
    "design.md": [
        ("1. Decisões técnicas", ("Fechadas", SUBSECAO_EM_ABERTO, "ADR novo?")),
        ("3. Impacto", ("Impacto",)),
    ],
}

# endregion

# region Checagens (todas recebem o arquivo e devolvem list[Finding]; as comuns vêm da lib md_checks)

def _check_placeholders(arquivo: Path) -> list[Finding]:
    return check_placeholders(arquivo, read_text(arquivo))


def open_items(texto: str) -> list[tuple[int, str]] | None:
    """(linha, texto) de cada item de '### Em aberto' do spec.md; [] quando diz "nada"; None sem a subseção
    (ausente é acusada pela checagem de subseções). Item = linha que abre um item de lista ou, sem lista,
    cada parágrafo; escrito de qualquer jeito (sem marcador exato). Comentários não contam."""
    corpo = subsection_body(texto, SECAO_DECISOES_SPEC, SUBSECAO_EM_ABERTO)
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


def _check_status(arquivo: Path) -> list[Finding]:
    """Status do conjunto e, a partir de `aprovada`, "Em aberto" igual a "nada" (CA-32): cada item é acusado."""
    if arquivo.name != "spec.md":
        return []

    conteudo = read_text(arquivo)
    findings = check_status(arquivo, conteudo, _OPCOES_STATUS)

    status, _ = read_status(conteudo)
    if status in STATUS_SEM_ABERTO:
        for linha, item in open_items(conteudo) or []:
            findings.append(
                erro(arquivo, linha, "spec.aprovada-com-aberto",
                     f"em aberto: spec `{status}` com item em aberto (resolva ou volte a `rascunho`): "
                     f"{format_preview(item)}")
            )

    return findings


def _check_updated_at(arquivo: Path) -> list[Finding]:
    return check_updated_at(arquivo, read_text(arquivo))


def _check_sections(arquivo: Path) -> list[Finding]:
    return check_sections(arquivo, read_text(arquivo), _SECOES_OBRIGATORIAS.get(arquivo.name, ()))


def _check_subsections(arquivo: Path) -> list[Finding]:
    """Subseções obrigatórias presentes e não vazias, no spec.md e no design.md (CA-31)."""
    return check_subsections(arquivo, read_text(arquivo), SUBSECOES_OBRIGATORIAS.get(arquivo.name, []), "spec")


def _check_impact(arquivo: Path) -> list[Finding]:
    """design.md: os seis eixos do Impacto, como na task."""
    if arquivo.name != "design.md":
        return []
    texto = read_text(arquivo)
    corpo = subsection_body(texto, "3. Impacto", "Impacto")
    return check_impact_axes(arquivo, texto, *corpo, "spec") if corpo else []


def _check_task_list(arquivo: Path) -> list[Finding]:
    """design.md: cada item da lista de tasks diz "bloqueada por" e "cobre" (CA-33). "cobre: nenhum" vale.
    Item riscado (task cancelada) fica de fora: não bloqueia nem cobre nada."""
    if arquivo.name != "design.md":
        return []
    findings: list[Finding] = []
    for item in task_list_items(read_text(arquivo)):
        if item.riscada:
            continue
        if item.bloqueada_por is None:
            findings.append(erro(arquivo, item.linha, "spec.task-sem-bloqueada-por",
                                 f"lista de tasks: item {item.numero} sem 'bloqueada por' (use 'bloqueada por: nenhuma' se não depende)"))
        if item.cobre is None:
            findings.append(erro(arquivo, item.linha, "spec.task-sem-cobre",
                                 f"lista de tasks: item {item.numero} sem 'cobre' (use 'cobre: nenhum' se não cobre critério)"))
    return findings


def _check_acceptance_criteria(arquivo: Path) -> list[Finding]:
    if arquivo.name != "spec.md":
        return []
    return check_acceptance_criteria(arquivo, read_text(arquivo))


def _check_design_ca_refs(arquivo: Path) -> list[Finding]:
    """Verifica se o design.md só cita CA-NN que existem no spec.md da mesma pasta."""
    if arquivo.name != "design.md":
        return []

    existentes = {
        int(m.group(1))
        for ca_id, _ in ca_titles(read_text(arquivo.parent / "spec.md"))
        if (m := CA_ID_VALIDO.match(ca_id))
    }
    return check_ca_refs_exist(arquivo, read_text(arquivo), existentes, "spec.md")


def _check_links(arquivo: Path, raiz: Path) -> list[Finding]:
    """Links relativos; link para tasks/ ainda não criada é aceito (a task nasce depois)."""
    return check_links(arquivo, read_text(arquivo), raiz, ignorar=lambda alvo: alvo.startswith("tasks/"))

# endregion

_CHECKS = (
    _check_placeholders,
    _check_status,
    _check_updated_at,
    _check_sections,
    _check_subsections,
    _check_impact,
    _check_task_list,
    _check_acceptance_criteria,
    _check_design_ca_refs,
)


def files(pasta: Path) -> list[Path]:
    """spec.md e, se existir, design.md da pasta. Falha (SystemExit) sem spec.md."""
    spec = pasta / "spec.md"
    if not spec.exists():
        raise SystemExit(f"Erro: O arquivo 'spec.md' não foi encontrado em '{pasta}'.")
    design = pasta / "design.md"
    return [spec, design] if design.exists() else [spec]


def validate_file(arquivo: Path, raiz: Path | None = None) -> list[Finding]:
    """Todas as checagens de um arquivo da spec (spec.md ou design.md), em ordem de linha."""
    raiz = raiz or get_project_root()
    findings = [f for check in _CHECKS for f in check(arquivo)] + _check_links(arquivo, raiz)
    return sorted(findings, key=lambda f: f.linha_inicio)


def validate(pasta: Path, raiz: Path | None = None) -> list[Finding]:
    """Todas as checagens da pasta da spec (importada pela governança). `raiz` permite validar fora do lugar."""
    return [f for arquivo in files(pasta) for f in validate_file(arquivo, raiz)]


def main():
    parser = argparse.ArgumentParser(description="Valida uma spec.")
    parser.add_argument("pasta_spec", type=Path, help="Caminho da pasta da spec.")
    args = parser.parse_args()

    pasta: Path = args.pasta_spec
    todos: list[Finding] = []
    blocos: list[str] = []

    for arquivo in files(pasta):
        problemas_encontrados = validate_file(arquivo)
        if problemas_encontrados:
            todos.extend(problemas_encontrados)
            blocos.append("\n".join(str(a) for a in problemas_encontrados))

    if not blocos:
        print("Nenhum problema encontrado.")
        return

    print(f"{len(todos)} problema(s) encontrado(s) em {relative_to_root(pasta)}:")
    print("\n\n".join(blocos))
    print(summary_line(todos))

    if any(f.severidade == "erro" for f in todos):
        sys.exit(1)


if __name__ == "__main__":
    main()
