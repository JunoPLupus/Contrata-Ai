"""Testes da lib compartilhada (.agents/scripts/lib): o que os validadores de task e de spec usam juntos.

Rodar a partir da raiz do projeto:  python3 -m unittest discover -s <esta pasta> -v
"""

import sys
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from md_checks import (  # noqa: E402
    Finding,
    add_progress_entry,
    format_spec_warning,
    open_items,
    possible_spec_criteria,
    read_metadata,
    set_metadata,
    set_updated_at,
    subsection_body,
    summary_line,
    task_list_items,
)
from md_utils import mask_code  # noqa: E402
from projeto import get_project_root, relative_to_root  # noqa: E402


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


TASK = """# Task: X

- **Status:** `aberta`
- **Atualizado em:** 2026-11-20 — Q1 decidida, com motivo
  longo que continua na linha de baixo
- **Branch:** `docs/juno/x` (sugerida; criada pelo Juno)

## 2. O que fazer nesta tarefa

### Em aberto

- Q1 — onde mora a regra?
- Q2 — repetir ou extrair?
  (continuação da Q2)

### Impacto

- **Contrato da API:** {contrato}
- **Banco:** {banco}
- **Front:** {front}
- **Permissões e segurança:** {seguranca}
- **Testes existentes que mudam de propósito:** não
- **Documentação:** não

## 4. Andamento

- 2026-11-20 — abertura.

## 5. Fechamento

- **O que foi feito:**
"""


def _task(contrato="não", banco="não", front="não", seguranca="não") -> str:
    return TASK.format(contrato=contrato, banco=banco, front=front, seguranca=seguranca)


class MetadadosEAndamentoTest(unittest.TestCase):
    """Trocar metadado e acrescentar entrada no Andamento: o comum ao iniciar e ao encerrar."""

    def test_troca_o_valor_e_as_continuacoes_do_metadado(self):
        """O valor novo substitui a linha e as continuações recuadas; o resto do texto fica igual."""
        texto = set_updated_at(_task(), date(2026, 11, 23), "iniciada")
        texto = set_metadata(texto, "Branch", "`docs/juno/x`")
        self.assertIn("- **Atualizado em:** 2026-11-23 — iniciada\n- **Branch:** `docs/juno/x`\n\n## 2.", texto)
        self.assertNotIn("longo que continua", texto)
        self.assertEqual(read_metadata(texto, "Status"), "`aberta`")
        self.assertEqual(read_metadata(_task(), "Atualizado em"),
                         "2026-11-20 — Q1 decidida, com motivo longo que continua na linha de baixo")
        with self.assertRaises(ValueError):
            set_metadata(texto, "Modo", "x")

    def test_entrada_vai_para_o_fim_do_andamento(self):
        """A entrada datada entra depois da última do Andamento e antes da seção seguinte; Andamento vazio
        também recebe; sem a seção, ValueError."""
        texto = add_progress_entry(_task(), "4. Andamento", date(2026, 11, 23), "iniciar: aprovada.\n\n```text\nx\n```")
        self.assertIn("- 2026-11-20 — abertura.\n- 2026-11-23 — iniciar: aprovada.\n\n```text\nx\n```\n\n## 5. Fechamento", texto)
        vazio = _task().replace("- 2026-11-20 — abertura.\n", "")
        self.assertIn("## 4. Andamento\n\n- 2026-11-23 — início.\n\n## 5.",
                      add_progress_entry(vazio, "4. Andamento", date(2026, 11, 23), "início."))
        no_fim = "## 4. Andamento\n"
        self.assertEqual(add_progress_entry(no_fim, "4. Andamento", date(2026, 11, 23), "x"), "## 4. Andamento\n\n- 2026-11-23 — x\n")
        with self.assertRaises(ValueError):
            add_progress_entry(_task(), "9. Nada", date(2026, 11, 23), "x")


class OpenItemsTest(unittest.TestCase):
    """Itens do "Em aberto" de qualquer seção (antes só a da spec)."""

    def test_le_os_itens_da_secao_pedida(self):
        """Lista os itens com a linha; "nada" é []; subseção ausente é None."""
        self.assertEqual(open_items(_task(), "2. O que fazer"),
                         [(12, "Q1 — onde mora a regra?"), (13, "Q2 — repetir ou extrair?")])
        nada = _task().replace("- Q1 — onde mora a regra?\n- Q2 — repetir ou extrair?\n  (continuação da Q2)\n", "nada\n")
        self.assertEqual(open_items(nada, "2. O que fazer"), [])
        self.assertIsNone(open_items(_task(), "4. Andamento"))


class RegraDosEixosTest(unittest.TestCase):
    """Aviso de possível spec pelos eixos do Impacto."""

    def _criterios(self, **eixos) -> list[int]:
        texto = _task(**eixos)
        return [n for n, _ in possible_spec_criteria(texto, *subsection_body(texto, "2. O que fazer", "Impacto"))]

    def test_regra_dos_eixos(self):
        """a regra dos eixos aponta o critério 1 com banco, o 4 com contrato e o 3 com quatro eixos sim (CA-13)"""
        sim = "sim — muda"
        self.assertEqual(self._criterios(), [])
        self.assertEqual(self._criterios(banco=sim), [1])
        self.assertEqual(self._criterios(contrato=sim), [4])
        self.assertEqual(self._criterios(front=sim, seguranca=sim), [])
        self.assertEqual(self._criterios(contrato=sim, front=sim, seguranca=sim), [4])  # três "sim" não bastam
        self.assertEqual(self._criterios(contrato=sim, banco=sim, front=sim, seguranca=sim), [1, 4, 3])
        self.assertEqual(self._criterios(banco="não, só leitura"), [])

    def test_aviso_diz_o_criterio_e_o_motivo(self):
        """O aviso cita o critério do AGENTS.md, o motivo e que o Juno decide; sem critério, nenhuma linha."""
        linhas = format_spec_warning([(1, "eixo 'Banco' com 'sim'")])
        self.assertIn("- critério 1 (cria um agregado ou coleção nova, ou muda como os agregados se relacionam): "
                      "eixo 'Banco' com 'sim'", linhas)
        self.assertIn("Juno", linhas[-1])
        self.assertEqual(format_spec_warning([]), [])



class RelativeToRootTest(unittest.TestCase):
    """Caminho relativo à raiz do projeto ou a uma raiz dada."""

    def test_raiz_do_projeto_ou_outra(self):
        """Sem raiz, relativo ao projeto; com raiz, relativo a ela; fora da raiz, o caminho original."""
        raiz = get_project_root()
        self.assertEqual(relative_to_root(raiz / "AGENTS.md"), Path("AGENTS.md"))
        outra = raiz / ".agents" / "docs"
        self.assertEqual(relative_to_root(outra / "tasks" / "x.md", outra), Path("tasks/x.md"))
        fora = Path("/tmp/fora/x.md")
        self.assertEqual(relative_to_root(fora, outra), fora)


if __name__ == "__main__":
    unittest.main()
