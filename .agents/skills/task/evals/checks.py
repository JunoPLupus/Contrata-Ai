"""Critérios determinísticos ([script]) dos evals da skill task.

Contrato: .agents/skills/oficina-de-skills/references/schemas.md, seção "checks.py".
Aplicado por: python3 -m scripts.apply_checks <esta skill> <workspace>/iteration-N (na oficina-de-skills).

As regras sobre o arquivo da task vêm do ../scripts/validate_task.py (e da lib global que ele usa): aqui
fica só o que é do cenário (onde gravou, quais CA-NN, o que não podia mudar).
"""

import re
import sys
from pathlib import Path

_EVALS = Path(__file__).resolve().parent
_RAIZ = next(p for p in _EVALS.parents if (p / ".agents").is_dir())
sys.path.insert(0, str(_EVALS.parent / "scripts"))
import validate_task as vt  # noqa: E402  (ajusta o sys.path da lib global ao ser importado)
from md_checks import ca_numbers_cited, ca_titles, check_updated_at, read_status  # noqa: E402
from md_utils import find_placeholders  # noqa: E402

_ATUALIZADO = re.compile(r"\*\*Atualizado em:\*\*\s*(.+)")

Resultado = dict[str, tuple[bool, str]]


# region Auxiliares

def _arquivos(outputs: Path) -> list[str]:
    """Arquivos gravados pela execução (relativos a outputs/), sem a resposta ao usuário."""
    if not outputs.is_dir():
        return []
    return sorted(
        p.relative_to(outputs).as_posix()
        for p in outputs.rglob("*")
        if p.is_file() and p.name != "resposta.md"
    )


def _ler(outputs: Path, relativo: str) -> str:
    return (outputs / relativo).read_text(encoding="utf-8")


def _status(texto: str) -> str | None:
    return read_status(texto)[0]


def _nada_em_api(arquivos: list[str]) -> tuple[bool, str]:
    em_api = [a for a in arquivos if a.startswith("api/")]
    return (not em_api, f"gravou em api/: {em_api}" if em_api else "nenhum arquivo em api/")


def _so_resposta(arquivos: list[str]) -> tuple[bool, str]:
    return (not arquivos, f"gravou: {arquivos}" if arquivos else "só resposta.md")


def _cas_de(texto: str) -> list[str]:
    return [ca_id for ca_id, _ in ca_titles(texto)]


def _caminhos_api_ler_antes(texto: str) -> list[str]:
    """Caminhos api/ citados em "Ler antes de começar" ("Arquivos previstos" pode listar arquivos novos)."""
    return [c for c in vt.ler_antes_paths(texto) if c.startswith("api/")]


def _api_inexistentes(arquivo: Path, texto: str) -> list[str]:
    """Caminhos api/ de "Ler antes de começar" que não existem no repositório (regra do validate_task)."""
    prefixo = "ler antes: caminho não existe: "
    return [
        f.mensagem[len(prefixo):] for f in vt.check_read_first(arquivo, texto, _RAIZ)
        if f.mensagem.startswith(prefixo + "api/")
    ]


def _mensagens(findings) -> str:
    return "; ".join(f.mensagem for f in findings[:5]) or "nenhum"


_CAS_TASK_02 = set(range(4, 9))

# endregion

# region Cenários

def _eval_1(outputs: Path) -> Resultado:
    arquivos = _arquivos(outputs)
    tasks = [a for a in arquivos if re.fullmatch(r"\.agents/docs/tasks/\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md", a)]
    r: Resultado = {}

    unico = len(tasks) == 1 and len(arquivos) == 1
    r["[script] Grava exatamente um arquivo em .agents/docs/tasks/ (nome AAAA-MM-DD-<assunto>.md) e nenhum outro além de resposta.md"] = (
        unico, f"arquivos gravados: {arquivos}")
    r["[script] Não grava nada em api/ (não implementa)"] = _nada_em_api(arquivos)

    if not tasks:
        falta = (False, "nenhum arquivo de task em .agents/docs/tasks/")
        for chave in (
            "[script] Segue o modelo task.md: tem a seção '## 2. Contexto e critérios' e não tem a seção '## 1. Vínculo com a spec'",
            "[script] A task cita buscar-cliente-por-id, cliente.controller e buscar-avaliacoes-do-cliente, e todo caminho api/... de 'Ler antes de começar' existe no repositório",
            "[script] Linha **Branch:** com um nome no padrão <tipo>/juno/<assunto>",
            "[script] Status 'aberta'",
            "[script] Sem placeholder do modelo sobrando (comentário, <placeholder> ou AAAA-MM-DD)",
        ):
            r[chave] = falta
        return r

    arquivo = outputs / tasks[0]
    texto = _ler(outputs, tasks[0])

    secoes = vt.check_type_sections(arquivo, texto, "avulsa")
    r["[script] Segue o modelo task.md: tem a seção '## 2. Contexto e critérios' e não tem a seção '## 1. Vínculo com a spec'"] = (
        not secoes, _mensagens(secoes))

    nomes = ("buscar-cliente-por-id", "cliente.controller", "buscar-avaliacoes-do-cliente")
    faltando = [n for n in nomes if n not in texto]
    caminhos = _caminhos_api_ler_antes(texto)
    inexistentes = _api_inexistentes(arquivo, texto)
    r["[script] A task cita buscar-cliente-por-id, cliente.controller e buscar-avaliacoes-do-cliente, e todo caminho api/... de 'Ler antes de começar' existe no repositório"] = (
        not faltando and not inexistentes,
        f"nomes ausentes: {faltando or 'nenhum'}; caminhos citados: {len(caminhos)}; inexistentes: {inexistentes or 'nenhum'}")

    branch = vt.check_branch(arquivo, texto)
    r["[script] Linha **Branch:** com um nome no padrão <tipo>/juno/<assunto>"] = (
        not branch, f"branch: {vt.task_branch(texto)}" if not branch else _mensagens(branch))

    status = _status(texto)
    r["[script] Status 'aberta'"] = (status == "aberta", f"status: {status}")

    sobras = find_placeholders(texto)
    r["[script] Sem placeholder do modelo sobrando (comentário, <placeholder> ou AAAA-MM-DD)"] = (
        not sobras,
        "nenhum" if not sobras else "; ".join(f"linha {i}: {t[:40]}" for i, _, _, t in sobras[:5]))
    return r


def _eval_2(outputs: Path) -> Resultado:
    arquivos = _arquivos(outputs)
    pasta = ".agents/docs/specs/2026-11-15-notificacoes/"
    tasks = [a for a in arquivos if a.startswith(pasta + "tasks/")]
    r: Resultado = {}

    r["[script] Não grava nada em api/"] = _nada_em_api(arquivos)
    design = [a for a in arquivos if a.endswith("design.md")]
    r["[script] Não grava o design.md (não mexe na lista de tasks)"] = (
        not design, f"gravou: {design}" if design else "design.md não gravado")

    chave_local = "[script] Se escreve o arquivo: só em .agents/docs/specs/2026-11-15-notificacoes/tasks/02-<assunto>.md, com a seção '## 1. Vínculo com a spec' citando CA-04 a CA-08 e sem a seção '## 2. Contexto e critérios'"
    chave_copia = "[script] Se escreve o arquivo: não copia os critérios da spec (nenhuma linha **Dado** / **Quando** / **Então**)"
    chave_tabela = "[script] Se escreve o arquivo: tabela critério → teste cobre CA-04 a CA-08, e cada linha traz um nome de teste entre aspas terminando em (CA-NN)"

    chave_status = "[script] Se grava a task 02, o status é 'bloqueada'"
    chave_ler = "[script] Se grava a task 02: 'Ler antes de começar' cita pelo menos um caminho api/ e todos existem no repositório"

    escritos = [a for a in arquivos if a.endswith(".md") and not a.endswith(("spec.md", "design.md"))]
    if not escritos:
        for chave in (chave_local, chave_copia, chave_tabela, chave_status, chave_ler):
            r[chave] = (True, "não escreveu arquivo de task (critério condicional)")
        return r

    certo = [a for a in tasks if re.fullmatch(re.escape(pasta) + r"tasks/02-[a-z0-9-]+\.md", a)]
    if len(certo) != 1 or len(escritos) != 1:
        r[chave_local] = (False, f"arquivos de task gravados: {escritos}")
        arquivo = outputs / escritos[0]
        texto = _ler(outputs, escritos[0])
    else:
        arquivo = outputs / certo[0]
        texto = _ler(outputs, certo[0])
        secoes = vt.check_type_sections(arquivo, texto, "spec")
        cita = _CAS_TASK_02 <= {n for n, _ in ca_numbers_cited(texto)}
        r[chave_local] = (not secoes and cita, f"seções: {_mensagens(secoes)}; cita CA-04 a CA-08: {cita}")

    copia = [f for f in vt.check_spec_criteria(arquivo, texto) if "Dado / Quando / Então" in f.mensagem]
    r[chave_copia] = (not copia, f"{len(copia)} linha(s) Dado/Quando/Então" if copia else "nenhuma")

    tabela = vt.check_criteria_table(arquivo, texto, _CAS_TASK_02)
    r[chave_tabela] = (not tabela, _mensagens(tabela))

    status = _status(texto)
    r[chave_status] = (status == "bloqueada", f"status: {status}")

    caminhos = _caminhos_api_ler_antes(texto)
    inexistentes = _api_inexistentes(arquivo, texto)
    r[chave_ler] = (bool(caminhos) and not inexistentes,
                    f"caminhos api/ em 'Ler antes': {len(caminhos)}; inexistentes: {inexistentes or 'nenhum'}")
    return r


def _eval_3(outputs: Path) -> Resultado:
    return {"[script] Não grava nenhum arquivo além de resposta.md": _so_resposta(_arquivos(outputs))}


def _eval_4(outputs: Path) -> Resultado:
    tasks = [a for a in _arquivos(outputs) if a.startswith(".agents/docs/tasks/")]
    if not tasks:
        return {"[script] Não marca a task como 'concluída' (se gravou a task)": (True, "não gravou a task")}
    status = [_status(_ler(outputs, a)) for a in tasks]
    return {"[script] Não marca a task como 'concluída' (se gravou a task)": (
        "concluída" not in status, f"status gravado: {status}")}


def _eval_5(outputs: Path) -> Resultado:
    arquivos = _arquivos(outputs)
    alvo = ".agents/docs/tasks/2026-11-16-restringir-perfil-cliente.md"
    original = (_EVALS / "files" / "task-perfil-cliente-em-andamento.md").read_text(encoding="utf-8")
    r: Resultado = {}

    r["[script] Grava só a própria task (.agents/docs/tasks/2026-11-16-restringir-perfil-cliente.md), sem task nova nem versão paralela"] = (
        arquivos == [alvo], f"arquivos gravados: {arquivos}")
    r["[script] Não grava nada em api/ (não implementa)"] = _nada_em_api(arquivos)

    chaves = (
        "[script] 'Atualizado em' mudou em relação à task original e traz data e motivo",
        "[script] Mantém o status 'em andamento'",
        "[script] Não acrescenta critério de aceite: os títulos ### CA-NN são os mesmos da task original",
    )
    if alvo not in arquivos:
        for chave in chaves:
            r[chave] = (False, "a task não foi gravada no caminho dela")
        return r

    texto = _ler(outputs, alvo)

    antes = _ATUALIZADO.search(original).group(1).strip()
    depois_m = _ATUALIZADO.search(texto)
    depois = depois_m.group(1).strip() if depois_m else ""
    formato = check_updated_at(outputs / alvo, texto)
    ok = bool(depois) and depois != antes and not formato and not find_placeholders(depois)
    r[chaves[0]] = (ok, f"antes: '{antes}'; depois: '{depois[:80]}'; formato: {_mensagens(formato)}")

    status = _status(texto)
    r[chaves[1]] = (status == "em andamento", f"status: {status}")

    cas_antes, cas_depois = _cas_de(original), _cas_de(texto)
    r[chaves[2]] = (cas_depois == cas_antes, f"original: {cas_antes}; gravada: {cas_depois}")
    return r

# endregion

_CENARIOS = {1: _eval_1, 2: _eval_2, 3: _eval_3, 4: _eval_4, 5: _eval_5}


def check(eval_id: int, outputs: Path) -> Resultado:
    cenario = _CENARIOS.get(eval_id)
    return cenario(outputs) if cenario else {}
