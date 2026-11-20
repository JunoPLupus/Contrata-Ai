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
    """Regras do validate_spec.py, uma pasta-fixture por regra."""

    def test_spec_aprovada_limpa_passa(self):
        """Spec aprovada e completa sai sem problema e com código 0."""
        codigo, saida = validar("so-spec")
        self.assertEqual(codigo, 0, saida)
        self.assertIn("Nenhum problema encontrado.", saida)

    def test_pasta_sem_spec_falha(self):
        """Pasta sem spec.md interrompe com mensagem."""
        codigo, saida = validar("sem-spec")
        self.assertNotEqual(codigo, 0)
        self.assertIn("'spec.md' não foi encontrado", saida)

    def test_codigo_e_comparacao_nao_sao_placeholder(self):
        """<tipo> em código e "x < 5" não são placeholder; AAAA-MM-DD fora de código é."""
        codigo, saida = validar("falsos-positivos")
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:11 [ERRO] md.placeholder data: AAAA-MM-DD", saida)
        for falso in ("<void>", "<Solicitacao>", "< 5"):
            self.assertNotIn(falso, saida)

    def test_aprovada_com_bloqueio_acusa_so_o_bloqueio_da_aprovacao(self):
        """Spec aprovada acusa só o item "bloqueia: aprovação", não o que bloqueia o design."""
        codigo, saida = validar("aprovada-com-bloqueio")
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:94 [ERRO] spec.aprovada-com-bloqueio status: spec aprovada com item 'Em aberto'", saida)
        self.assertNotIn("spec.md:93", saida)  # "bloqueia: design" é permitido

    def test_secao_ausente_e_vazia(self):
        """Seção obrigatória ausente e seção vazia são erro."""
        codigo, saida = validar("secoes-ausente-e-vazia")
        self.assertEqual(codigo, 1)
        self.assertIn("seção: obrigatória ausente: ## 2. Escopo", saida)
        self.assertIn("seção: vazia: ## 3. Decisões de produto", saida)

    def test_criterios_com_problemas(self):
        """Critério sem Quando, repetido ou fora do formato é erro; lacuna na sequência é aviso."""
        codigo, saida = validar("criterios-com-problemas")
        self.assertEqual(codigo, 1)
        self.assertIn("critério: CA-01 sem Quando", saida)
        self.assertIn("critério: CA-02 repetido", saida)
        self.assertIn("critério: ID 'CA-5' fora do formato CA-NN", saida)
        self.assertIn("[AVISO] md.criterio-lacuna critério: sequência com lacuna (CA-03, CA-05)", saida)

    def test_status_com_lista_do_modelo_e_atualizado_sem_motivo(self):
        """Status com a lista do modelo e "Atualizado em" sem motivo são erro."""
        codigo, saida = validar("metadados-com-problemas")
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:7 [ERRO] md.status-opcoes-do-modelo status: lista de opções do modelo; escolha um valor", saida)
        self.assertIn("spec.md:9 [ERRO] md.atualizado-formato atualizado em: use 'AAAA-MM-DD — motivo'", saida)

    def test_design_cita_ca_inexistente_e_link_quebrado(self):
        """design.md citando CA inexistente e link quebrado é erro; link para tasks/ ainda não criada não."""
        codigo, saida = validar("com-design")
        self.assertEqual(codigo, 1)
        self.assertIn("design.md:47 [ERRO] md.criterio-inexistente critério: CA-11 citado mas não existe no spec.md", saida)
        self.assertIn("design.md:47 [ERRO] md.link-quebrado link: destino não existe: ../nao-existe.md", saida)
        self.assertNotIn("tasks/", saida)  # task ainda não criada não é link quebrado
        self.assertNotIn("spec.md:", saida)  # a spec da pasta está limpa


if __name__ == "__main__":
    unittest.main()
