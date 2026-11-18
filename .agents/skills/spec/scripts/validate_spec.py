"""
Valida a pasta de uma spec (spec.md obrigatório; design.md só se existir).

Verifica:

- [x] Placeholders, comentários do modelo e datas não preenchidas
- [x] Seções obrigatórias presentes e não vazias
- [x] Status válido; `aprovada` só sem item "Em aberto" que bloqueie a aprovação
- [x] "Atualizado em" com data e motivo
- [x] Critérios CA-NN: formato do ID, IDs únicos, sequência (aviso), Dado / Quando / Então
- [x] design.md só cita CA-NN que existem no spec.md
- [x] Links relativos; link para tasks/ ainda não criada é aceito

As checagens comuns com a skill task moram na lib global (.agents/scripts/lib/md_checks.py).

Saída: `arquivo:linha [SEVERIDADE] mensagem`; exit 1 se houver erro.

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
    check_links,
    check_placeholders,
    check_sections,
    check_status,
    check_updated_at,
    erro,
    read_status,
)
from md_utils import line_of  # noqa: E402


# region Variáveis auxiliares

_OPCOES_STATUS = ("rascunho", "aprovada", "em andamento", "concluída", "cancelada", "substituída")

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

# endregion

# region Checagens (todas recebem o arquivo e devolvem list[Finding]; as comuns vêm da lib md_checks)

def _check_placeholders(arquivo: Path) -> list[Finding]:
    return check_placeholders(arquivo, read_text(arquivo))


def _check_status(arquivo: Path) -> list[Finding]:
    """Status do conjunto e, se aprovada, nenhum item 'Em aberto' bloqueando a aprovação."""
    if arquivo.name != "spec.md":
        return []

    conteudo = read_text(arquivo)
    findings = check_status(arquivo, conteudo, _OPCOES_STATUS)

    status, _ = read_status(conteudo)
    if status == "aprovada":
        for bloqueio in _BLOQUEIA_APROVACAO_PATTERN.finditer(conteudo):
            findings.append(
                erro(arquivo, line_of(conteudo, bloqueio.start()),
                     "status: spec aprovada com item 'Em aberto' que bloqueia a aprovação")
            )

    return findings


def _check_updated_at(arquivo: Path) -> list[Finding]:
    return check_updated_at(arquivo, read_text(arquivo))


def _check_sections(arquivo: Path) -> list[Finding]:
    return check_sections(arquivo, read_text(arquivo), _SECOES_OBRIGATORIAS.get(arquivo.name, ()))


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


def _check_links(arquivo: Path) -> list[Finding]:
    """Links relativos; link para tasks/ ainda não criada é aceito (a task nasce depois)."""
    return check_links(arquivo, read_text(arquivo), get_project_root(), ignorar=lambda alvo: alvo.startswith("tasks/"))

# endregion

_CHECKS = (
    _check_placeholders,
    _check_status,
    _check_updated_at,
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
