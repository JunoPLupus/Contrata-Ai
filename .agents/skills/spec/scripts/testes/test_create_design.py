"""Testes do create_design.py, numa cópia temporária das pastas-fixture.

Rodar a partir da raiz do projeto:  python3 -m unittest discover -s <esta pasta> -v
"""

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

TESTES = Path(__file__).resolve().parent
SCRIPT = TESTES.parent / "create_design.py"


class CreateDesignTest(unittest.TestCase):
    """Criação do design.md a partir de uma spec aprovada e sem nada em aberto."""

    def setUp(self):
        self.pasta = Path(tempfile.mkdtemp()) / "2026-11-15-notificacoes"
        self.addCleanup(shutil.rmtree, self.pasta.parent)
        shutil.copytree(TESTES / "so-spec", self.pasta)

    def criar(self) -> subprocess.CompletedProcess:
        return subprocess.run([sys.executable, str(SCRIPT), str(self.pasta), "--data", "2026-11-20"],
                              capture_output=True, text=True)

    def mudar_spec(self, antes: str, depois: str) -> None:
        spec = self.pasta / "spec.md"
        texto = spec.read_text(encoding="utf-8")
        self.assertEqual(texto.count(antes), 1, antes)
        spec.write_text(texto.replace(antes, depois), encoding="utf-8")

    def test_spec_aprovada_sem_nada_em_aberto_cria(self):
        """Spec aprovada com 'Em aberto' igual a 'nada' ganha o design.md, no modelo novo (sem Branch)."""
        r = self.criar()
        self.assertEqual(r.returncode, 0, r.stderr)
        design = (self.pasta / "design.md").read_text(encoding="utf-8")
        self.assertTrue(design.startswith("# Design: Notificações in-app\n"))
        self.assertNotIn("**Branch:**", design)
        self.assertIn("### Em aberto", design)

    def test_recusa_spec_com_item_em_aberto(self):
        """create_design recusa spec com algo em aberto e lista os itens (CA-32)"""
        self.mudar_spec("### Em aberto\n\nnada\n",
                        "### Em aberto\n\n- Notificar também por email?\n\nPrazo do TTL: 30 ou 90 dias?\n")
        r = self.criar()
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("A spec tem item em aberto; resolva antes de criar o design:\n"
                      "- spec.md:103 Notificar também por email?\n"
                      "- spec.md:105 Prazo do TTL: 30 ou 90 dias?", r.stderr)
        self.assertFalse((self.pasta / "design.md").exists())

    def test_recusa_spec_nao_aprovada(self):
        """Spec em rascunho continua recusada, sem criar o design.md."""
        self.mudar_spec("- **Status:** `aprovada`", "- **Status:** `rascunho`")
        r = self.criar()
        self.assertIn("precisa estar 'aprovada'", r.stderr)
        self.assertFalse((self.pasta / "design.md").exists())


if __name__ == "__main__":
    unittest.main()
