"""Aplica os critérios determinísticos ([script]) de uma skill em todas as execuções de uma iteração.

Contrato (ver references/schemas.md, "checks.py"):
- no evals.json / eval_metadata.json, critério conferido por script começa com "[script] ";
- a skill testada tem `evals/checks.py` com a função
      check(eval_id: int, outputs: Path) -> dict[str, tuple[bool, str]]
  que devolve, para cada critério [script] daquele cenário (texto exato, com o prefixo),
  (passou?, evidência).

Para cada <iteração>/eval-*/<configuração>/run-*/, este script roda o check sobre `outputs/`,
junta o resultado ao grading.json (substitui entradas com o mesmo texto, cria o arquivo se faltar)
e recalcula o `summary`. Rode DEPOIS dos avaliadores LLM, que ignoram os critérios [script].

Uso (a partir da pasta da oficina-de-skills):
    python3 -m scripts.apply_checks <pasta da skill testada> <workspace>/iteration-N
"""

import argparse
import importlib.util
import json
import sys
from pathlib import Path

PREFIXO = "[script] "


def _carregar_check(skill_dir: Path):
    caminho = skill_dir / "evals" / "checks.py"
    if not caminho.exists():
        raise SystemExit(f"'{caminho}' não existe: a skill não tem critérios determinísticos.")
    spec = importlib.util.spec_from_file_location("skill_checks", caminho)
    modulo = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(caminho.parent))  # deixa o checks.py importar módulos vizinhos
    spec.loader.exec_module(modulo)
    if not hasattr(modulo, "check"):
        raise SystemExit(f"'{caminho}' não define check(eval_id, outputs).")
    return modulo.check


def _resumo(expectations: list[dict]) -> dict:
    total = len(expectations)
    passou = sum(1 for e in expectations if e.get("passed"))
    return {
        "passed": passou,
        "failed": total - passou,
        "total": total,
        "pass_rate": round(passou / total, 4) if total else 0.0,
    }


def aplicar(skill_dir: Path, iteracao: Path) -> int:
    check = _carregar_check(skill_dir)
    execucoes = 0

    for eval_dir in sorted(iteracao.glob("eval-*")):
        metadata_file = eval_dir / "eval_metadata.json"
        if not metadata_file.exists():
            print(f"Aviso: sem eval_metadata.json em {eval_dir}; pulado.")
            continue
        metadata = json.loads(metadata_file.read_text(encoding="utf-8"))
        esperados = [a for a in metadata.get("assertions", []) if a.startswith(PREFIXO)]
        if not esperados:
            continue

        for run_dir in sorted(eval_dir.glob("*/run-*")):
            resultados = check(metadata["eval_id"], run_dir / "outputs")

            grading_file = run_dir / "grading.json"
            grading = json.loads(grading_file.read_text(encoding="utf-8")) if grading_file.exists() else {}
            # Mantém só os critérios LLM que o cenário ainda tem: uma linha de base reaproveitada traz o
            # grading de critérios antigos (renomeados, separados ou que viraram [script]), que distorceriam
            # o summary. As entradas [script] são refeitas logo abaixo.
            atuais_llm = {a for a in metadata.get("assertions", []) if not a.startswith(PREFIXO)}
            expectations = [e for e in grading.get("expectations", []) if e["text"] in atuais_llm]

            for texto in esperados:
                if texto in resultados:
                    passou, evidencia = resultados[texto]
                else:
                    passou, evidencia = False, "checks.py não avaliou este critério (texto diferente do evals.json?)"
                expectations.append({"text": texto, "passed": bool(passou), "evidence": evidencia})

            grading["expectations"] = expectations
            grading["summary"] = _resumo(expectations)
            grading_file.write_text(json.dumps(grading, ensure_ascii=False, indent=2), encoding="utf-8")
            execucoes += 1

    return execucoes


def main() -> None:
    parser = argparse.ArgumentParser(description="Aplica os critérios [script] de uma skill numa iteração.")
    parser.add_argument("skill_dir", type=Path, help="Pasta da skill testada (com evals/checks.py)")
    parser.add_argument("iteracao", type=Path, help="Pasta <workspace>/iteration-N")
    args = parser.parse_args()

    n = aplicar(args.skill_dir, args.iteracao)
    print(f"Critérios [script] aplicados em {n} execução(ões).")


if __name__ == "__main__":
    main()
