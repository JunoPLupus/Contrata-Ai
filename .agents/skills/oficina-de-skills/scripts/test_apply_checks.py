"""Testes do apply_checks.py com uma skill e uma iteração falsas (em pasta temporária).

Rodar a partir da pasta da oficina-de-skills:  python3 -m unittest scripts.test_apply_checks -v
"""

import json
import tempfile
import unittest
from pathlib import Path

from scripts.apply_checks import aplicar

CHECKS = '''
from pathlib import Path
def check(eval_id, outputs: Path):
    ok = (outputs / "spec.md").exists()
    return {"[script] Grava spec.md": (ok, "existe" if ok else "não existe")}
'''


class ApplyChecksTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "skill" / "evals").mkdir(parents=True)
        (self.tmp / "skill" / "evals" / "checks.py").write_text(CHECKS, encoding="utf-8")
        self.it = self.tmp / "it"
        self.run = self.it / "eval-x" / "with_skill" / "run-1"
        (self.run / "outputs").mkdir(parents=True)
        metadata = {"eval_id": 1, "assertions": ["Pergunta antes", "[script] Grava spec.md", "[script] Sem check"]}
        (self.it / "eval-x" / "eval_metadata.json").write_text(json.dumps(metadata), encoding="utf-8")

    def _grading(self) -> dict:
        return json.loads((self.run / "grading.json").read_text(encoding="utf-8"))

    def _textos(self) -> dict[str, bool]:
        return {e["text"]: e["passed"] for e in self._grading()["expectations"]}

    def test_junta_ao_grading_do_llm_e_recalcula_o_resumo(self):
        (self.run / "outputs" / "spec.md").write_text("x", encoding="utf-8")
        llm = {"expectations": [{"text": "Pergunta antes", "passed": True, "evidence": "ok"}],
               "summary": {"passed": 1, "failed": 0, "total": 1, "pass_rate": 1.0}, "timing": {"total_duration_seconds": 3}}
        (self.run / "grading.json").write_text(json.dumps(llm), encoding="utf-8")

        aplicar(self.tmp / "skill", self.it)

        self.assertEqual(self._textos(), {"Pergunta antes": True, "[script] Grava spec.md": True, "[script] Sem check": False})
        self.assertEqual(self._grading()["summary"], {"passed": 2, "failed": 1, "total": 3, "pass_rate": 0.6667})
        self.assertIn("timing", self._grading())  # o resto do grading é preservado

    def test_cria_o_grading_quando_falta(self):
        aplicar(self.tmp / "skill", self.it)
        self.assertEqual(self._textos(), {"[script] Grava spec.md": False, "[script] Sem check": False})

    def test_criterio_script_sem_resultado_falha_com_evidencia(self):
        aplicar(self.tmp / "skill", self.it)
        sem = next(e for e in self._grading()["expectations"] if e["text"] == "[script] Sem check")
        self.assertFalse(sem["passed"])
        self.assertIn("não avaliou", sem["evidence"])

    def test_descarta_criterio_que_o_cenario_nao_tem_mais(self):
        antigo = {"expectations": [
            {"text": "Grava spec.md", "passed": False, "evidence": "versão antiga, sem prefixo"},
            {"text": "Critério removido", "passed": True, "evidence": "não existe mais"},
            {"text": "Pergunta antes", "passed": True, "evidence": "ok"},
        ]}
        (self.run / "grading.json").write_text(json.dumps(antigo), encoding="utf-8")

        aplicar(self.tmp / "skill", self.it)

        self.assertEqual(set(self._textos()), {"Pergunta antes", "[script] Grava spec.md", "[script] Sem check"})

    def test_rodar_duas_vezes_nao_duplica(self):
        aplicar(self.tmp / "skill", self.it)
        aplicar(self.tmp / "skill", self.it)
        self.assertEqual(len(self._grading()["expectations"]), 2)


if __name__ == "__main__":
    unittest.main()
