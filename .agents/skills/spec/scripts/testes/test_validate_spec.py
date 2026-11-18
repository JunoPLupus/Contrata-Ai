"""Testes do validate_spec.py contra as pastas-fixture desta pasta.

Rodar a partir da raiz do projeto:  python3 -m unittest discover -s <esta pasta> -v
"""

import subprocess
import sys
import unittest
from pathlib import Path

TESTES = Path(__file__).resolve().parent
SCRIPT = TESTES.parent / "validate_spec.py"


def validar(pasta: str) -> tuple[int, str]:
    r = subprocess.run([sys.executable, str(SCRIPT), str(TESTES / pasta)], capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


class ValidateSpecTest(unittest.TestCase):
    def test_spec_aprovada_limpa_passa(self):
        codigo, saida = validar("so-spec")
        self.assertEqual(codigo, 0, saida)
        self.assertIn("Nenhum problema encontrado.", saida)

    def test_pasta_sem_spec_falha(self):
        codigo, saida = validar("sem-spec")
        self.assertNotEqual(codigo, 0)
        self.assertIn("'spec.md' não foi encontrado", saida)

    def test_codigo_e_comparacao_nao_sao_placeholder(self):
        codigo, saida = validar("falsos-positivos")
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:11 [ERRO] data: AAAA-MM-DD", saida)
        for falso in ("<void>", "<Solicitacao>", "< 5"):
            self.assertNotIn(falso, saida)

    def test_aprovada_com_bloqueio_acusa_so_o_bloqueio_da_aprovacao(self):
        codigo, saida = validar("aprovada-com-bloqueio")
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:94 [ERRO] status: spec aprovada com item 'Em aberto'", saida)
        self.assertNotIn("spec.md:93", saida)  # "bloqueia: design" é permitido

    def test_secao_ausente_e_vazia(self):
        codigo, saida = validar("secoes-ausente-e-vazia")
        self.assertEqual(codigo, 1)
        self.assertIn("seção: obrigatória ausente: ## 2. Escopo", saida)
        self.assertIn("seção: vazia: ## 3. Decisões de produto", saida)

    def test_criterios_com_problemas(self):
        codigo, saida = validar("criterios-com-problemas")
        self.assertEqual(codigo, 1)
        self.assertIn("critério: CA-01 sem Quando", saida)
        self.assertIn("critério: CA-02 repetido", saida)
        self.assertIn("critério: ID 'CA-5' fora do formato CA-NN", saida)
        self.assertIn("[AVISO] critério: sequência com lacuna (CA-03, CA-05)", saida)

    def test_design_cita_ca_inexistente_e_link_quebrado(self):
        codigo, saida = validar("com-design")
        self.assertEqual(codigo, 1)
        self.assertIn("design.md:47 [ERRO] critério: CA-11 citado mas não existe no spec.md", saida)
        self.assertIn("design.md:47 [ERRO] link: destino não existe: ../nao-existe.md", saida)
        self.assertNotIn("tasks/", saida)  # task ainda não criada não é link quebrado
        self.assertNotIn("spec.md:", saida)  # a spec da pasta está limpa


if __name__ == "__main__":
    unittest.main()
