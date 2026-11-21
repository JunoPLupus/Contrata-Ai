"""Testes da lib compartilhada (.agents/scripts/lib): o que os validadores de task e de spec usam juntos.

Rodar a partir da raiz do projeto:  python3 -m unittest discover -s <esta pasta> -v
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from md_checks import Finding, summary_line, task_list_items  # noqa: E402
from md_utils import mask_code  # noqa: E402


class MaskCodeTest(unittest.TestCase):
    """Bloco de código só abre com a cerca no começo da linha."""

    def test_tres_crases_no_meio_da_linha_nao_abrem_bloco(self):
        """Três crases no meio do texto não escondem os títulos seguintes até a próxima cerca."""
        texto = "Use um bloco ```text por commit.\n\n### Passos\n\n- um\n\n```text\nfeat: x\n```\n"
        mascarado = mask_code(texto)
        self.assertIn("### Passos", mascarado)
        self.assertNotIn("feat: x", mascarado)  # a cerca de verdade continua mascarada

    def test_cerca_no_comeco_da_linha_com_recuo_mascara(self):
        """Cerca no começo da linha, com ou sem recuo (dentro de lista), mascara o bloco e mantém o tamanho."""
        texto = "- item\n\n     ```bash\n     ### não é título\n     ```\n\n### Título\n"
        mascarado = mask_code(texto)
        self.assertNotIn("não é título", mascarado)
        self.assertIn("### Título", mascarado)
        self.assertEqual(len(mascarado), len(texto))
        self.assertEqual(mascarado.count("\n"), texto.count("\n"))


class SummaryLineTest(unittest.TestCase):
    def test_conta_erros_e_avisos(self):
        """A linha de resumo conta erros e avisos separados."""
        a = Path("x.md")
        findings = [Finding(a, 1, 1, "erro", "md.x", "m"), Finding(a, 2, 2, "aviso", "md.y", "m"),
                    Finding(a, 3, 3, "erro", "md.z", "m")]
        self.assertEqual(summary_line(findings), "2 erro(s), 1 aviso(s)")
        self.assertEqual(summary_line([]), "0 erro(s), 0 aviso(s)")


class TaskListItemsTest(unittest.TestCase):
    """Leitura da lista de tasks do design.md, comum ao create_task e ao validate_spec."""

    DESIGN = """# Design: X

## 6. Tasks

- [01 — Núcleo](tasks/01-nucleo.md) — bloqueada por: nenhuma — cobre: CA-01,
  CA-02
- 02 — Rotas — bloqueada por: 01, 03 — cobre: nenhum
- ~~[03 — Antiga](tasks/03-antiga.md) — bloqueada por: 01 — cobre: CA-03~~ — cancelada em 2026-11-20: motivo
- [ ] [04 — Sem cobre](tasks/04-x.md) — bloqueada por: 01

Notas:

- **05:** nota que não é item.
"""

    def test_le_itens_com_e_sem_link_inteiros(self):
        """Lê número, título, link, dependências e o cobre inteiro, mesmo quebrando linha; nota não é item."""
        itens = {i.numero: i for i in task_list_items(self.DESIGN)}
        self.assertEqual(sorted(itens), ["01", "02", "03", "04"])
        self.assertEqual((itens["01"].titulo, itens["01"].alvo, itens["01"].linha), ("Núcleo", "tasks/01-nucleo.md", 5))
        self.assertEqual((itens["01"].bloqueada_por, itens["01"].cobre), ("nenhuma", "CA-01, CA-02"))
        self.assertEqual((itens["02"].titulo, itens["02"].alvo), ("Rotas", None))
        self.assertEqual((itens["02"].bloqueada_por, itens["02"].cobre), ("01, 03", "nenhum"))
        self.assertTrue(itens["03"].riscada)
        self.assertEqual(itens["03"].cobre, "CA-03")  # sem o texto do cancelamento
        self.assertIsNone(itens["04"].cobre)


if __name__ == "__main__":
    unittest.main()
