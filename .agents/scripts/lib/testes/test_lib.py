"""Testes da lib compartilhada (.agents/scripts/lib): o que os validadores de task e de spec usam juntos.

Rodar a partir da raiz do projeto:  python3 -m unittest discover -s <esta pasta> -v
"""

import shutil
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from md_checks import (  # noqa: E402
    Finding,
    add_progress_entry,
    format_spec_warning,
    open_items,
    pending_tasks,
    possible_spec_criteria,
    progress_base,
    read_metadata,
    rewrite_commit_paths,
    set_metadata,
    set_updated_at,
    strike_task_item,
    subsection_body,
    summary_line,
    task_list_items,
    versioned_leftovers,
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


DESIGN_SPEC = """# Design: X

## 6. Tasks

- [01 — Núcleo](tasks/01-nucleo.md) — bloqueada por: nenhuma — cobre: CA-01
- [02 — Rotas](tasks/02-rotas.md) — bloqueada por: 01 — cobre: CA-02,
  CA-03
- ~~[03 — Antiga](tasks/03-antiga.md) — bloqueada por: 01 — cobre: CA-04~~ — cancelada em 2026-11-20: motivo
- 04 — Ainda sem arquivo — bloqueada por: 01 — cobre: nenhum
- [05 — Link sem arquivo](tasks/05-x.md) — bloqueada por: 01 — cobre: nenhum
- [06 — Já em done](tasks/06-done.md) — bloqueada por: 01 — cobre: nenhum

Notas para abrir as tasks:

- **02:** nota que quebra
  linha e continua.
- **06:** outra nota.
"""


def _task_spec(status: str, ficou: str = "") -> str:
    return (f"# Task: x\n\n- **Status:** `{status}`\n\n## 5. Fechamento\n\n- **Testes no fim:** ok\n"
            f"- **Ficou para depois:** {ficou}\n- **Commits entregues:** x\n")


class PendenciasDaSpecTest(unittest.TestCase):
    """Pendências de uma pasta de spec: o que o finish_spec.py confere e o "encerrar" da 06 vai contar."""

    def setUp(self):
        self.pasta = Path(tempfile.mkdtemp()) / "2026-11-15-x"
        self.addCleanup(shutil.rmtree, self.pasta.parent)
        (self.pasta / "tasks" / "done").mkdir(parents=True)
        (self.pasta / "design.md").write_text(DESIGN_SPEC, encoding="utf-8")
        self.task("01-nucleo.md", "concluída")
        self.task("02-rotas.md", "em andamento")
        self.task("done/06-done.md", "concluída")

    def task(self, nome: str, status: str, ficou: str = "") -> None:
        (self.pasta / "tasks" / nome).write_text(_task_spec(status, ficou), encoding="utf-8")

    def test_pendencias_da_spec(self):
        """pendências da spec: item riscado é cancelada, item sem arquivo é pendente e task fora da lista conta (CA-19)"""
        self.task("03-antiga.md", "aberta")  # riscada na lista: cancelada, seja qual for o arquivo
        self.task("09-extra.md", "bloqueada")
        self.task("10-extra-fechada.md", "cancelada")
        pendentes = [(t.numero, t.titulo, t.motivo) for t in pending_tasks(self.pasta)]
        self.assertEqual(pendentes, [
            ("02", "Rotas", "`em andamento`"),
            ("04", "Ainda sem arquivo", "não criada"),
            ("05", "Link sem arquivo", "não criada"),
            ("09", "09-extra.md", "fora da lista com status `bloqueada`"),
        ])
        # Tudo fechado: nenhuma pendência (a 06 está em done/, a 03 riscada, a fora da lista cancelada).
        for nome in ("02-rotas.md", "05-x.md", "09-extra.md"):
            self.task(nome, "concluída")
        (self.pasta / "design.md").write_text(DESIGN_SPEC.replace("- 04 — Ainda sem arquivo", "- ~~04 — Ainda sem arquivo"),
                                              encoding="utf-8")
        self.assertEqual(pending_tasks(self.pasta), [])

    def test_pendencias_versionadas(self):
        """pendências versionadas: Ficou para depois com nada ou nenhum fica de fora, e notas do design entram com a linha (CA-39)"""
        self.task("01-nucleo.md", "concluída", "o refactor da saída → task avulsa.")
        self.task("02-rotas.md", "em andamento", "nada")
        self.task("03-antiga.md", "cancelada", "Nenhum.")
        self.task("05-x.md", "concluída", "não se aplica")
        self.task("09-extra.md", "concluída", "")
        sobras = [(s.arquivo.name, s.linha, s.origem, s.texto) for s in versioned_leftovers(self.pasta)]
        self.assertEqual(sobras, [
            ("01-nucleo.md", 8, "Ficou para depois", "o refactor da saída → task avulsa."),
            ("design.md", 13, "nota do design", "Notas para abrir as tasks:"),
            ("design.md", 15, "nota do design", "- **02:** nota que quebra linha e continua."),
            ("design.md", 17, "nota do design", "- **06:** outra nota."),
        ])


class EncerrarECancelarTest(unittest.TestCase):
    """O que o finish_task.py usa da lib: a base do Andamento, o caminho nos "Commits entregues" e o item riscado."""

    BASE = (".agents/skills/spec/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'adr' citada\n"
            "AGENTS.md [ERRO] md.link-quebrado link: destino não existe: x.md\n")

    def _andamento(self, *entradas: str) -> str:
        return "# Task: x\n\n## 4. Andamento\n\n" + "".join(entradas) + "\n## 5. Fechamento\n\n- **O que foi feito:** x\n"

    def test_base_do_andamento(self):
        """base do Andamento: o bloco text depois da entrada, 'nenhum' é base vazia e sem entrada é None"""
        iniciar = "- 2026-11-23 — iniciar: aprovada pelo Juno; branch `x` criada.\n"
        com_bloco = self._andamento(iniciar, f"- 2026-11-23 — base de achados da governança (2):\n\n```text\n{self.BASE}```\n",
                                    "- 2026-11-24 — testes antes da primeira edição: ok.\n")
        self.assertEqual(progress_base(com_bloco, "4. Andamento"), self.BASE)
        self.assertEqual(progress_base(self._andamento(iniciar, "- 2026-11-23 — base de achados da governança: nenhum\n"),
                                       "4. Andamento"), "")
        self.assertIsNone(progress_base(self._andamento(iniciar), "4. Andamento"))
        # A entrada sem o bloco logo abaixo não é base (não dá para comparar).
        self.assertIsNone(progress_base(self._andamento("- 2026-11-23 — base de achados da governança (2):\n\nperdi o bloco\n"),
                                        "4. Andamento"))
        # Com duas entradas (a task iniciada de novo), vale a última.
        duas = self._andamento(f"- 2026-11-23 — base de achados da governança (2):\n\n```text\n{self.BASE}```\n",
                               "- 2026-11-24 — base de achados da governança: nenhum\n")
        self.assertEqual(progress_base(duas, "4. Andamento"), "")
        # A base citada fora do Andamento (no fechamento, por exemplo) não conta.
        fora = self._andamento(iniciar) + "- 2026-11-23 — base de achados da governança: nenhum\n"
        self.assertIsNone(progress_base(fora, "4. Andamento"))

    FECHAMENTO = """## 5. Fechamento

- **O que foi feito:** ver `.agents/docs/tasks/2026-11-18-x.md`.
- **Commits entregues:**

  ```text
  fix(x): Faz x

  Task: 2026-11-18-x.md
  ```

  Arquivos:
  - `api/x.ts`
  - `.agents/docs/tasks/2026-11-18-x.md` (fechamento)

  ```text
  docs(x): Fecha a task

  - .agents/docs/tasks/2026-11-18-x.md
  ```

  Arquivos:

  - .agents/docs/tasks/2026-11-18-x.md
  - `.agents/docs/tasks/2026-11-18-x.md.bak`

  Texto solto com .agents/docs/tasks/2026-11-18-x.md
"""

    def test_reescreve_o_caminho_nos_commits_entregues(self):
        """caminho nos Commits entregues: só os itens das listas Arquivos que são o caminho mudam"""
        antigo, novo = ".agents/docs/tasks/2026-11-18-x.md", ".agents/docs/tasks/done/2026-11-18-x.md"
        texto, trocas = rewrite_commit_paths(self.FECHAMENTO, "5. Fechamento", antigo, novo)
        self.assertEqual(trocas, 2)
        self.assertIn(f"  - `{novo}` (fechamento)\n", texto)
        self.assertIn(f"\n  - {novo}\n", texto)
        # Fora das listas "Arquivos:" (outro rótulo, a mensagem do commit, texto solto) e outro arquivo: não mudam.
        self.assertIn(f"- **O que foi feito:** ver `{antigo}`.", texto)
        self.assertIn(f"  - {antigo}\n  ```", texto)
        self.assertIn(f"`{antigo}.bak`", texto)
        self.assertIn(f"Texto solto com {antigo}", texto)
        self.assertEqual(rewrite_commit_paths("# x\n\n## 5. Fechamento\n\n- **O que foi feito:** x\n",
                                              "5. Fechamento", antigo, novo)[1], 0)

    DESIGN = """# Design: X

## 6. Tasks

- [ ] [01 — Núcleo](tasks/01-nucleo.md) — bloqueada por: nenhuma — cobre: CA-01,
  CA-02
- [02 — Rotas](tasks/02-rotas.md) — bloqueada por: 01 — cobre: CA-03
- ~~[03 — Antiga](tasks/03-antiga.md) — bloqueada por: 01 — cobre: CA-04~~ — cancelada em 2026-11-20: motivo

## 7. Depois
"""

    def test_risca_o_item_inteiro_com_data_e_motivo(self):
        """item riscado: o item inteiro fica entre ~~, numa linha, com a data e o motivo; o resto não muda"""
        texto = strike_task_item(self.DESIGN, "01", date(2026, 11, 25), "ficou fora do MVP")
        self.assertIn("- [ ] ~~[01 — Núcleo](tasks/01-nucleo.md) — bloqueada por: nenhuma — cobre: CA-01, CA-02~~"
                      " — cancelada em 2026-11-25: ficou fora do MVP\n- [02 — Rotas]", texto)
        itens = {i.numero: i for i in task_list_items(texto)}
        self.assertTrue(itens["01"].riscada)
        self.assertEqual((itens["01"].alvo, itens["01"].cobre), ("tasks/01-nucleo.md", "CA-01, CA-02"))
        self.assertFalse(itens["02"].riscada)
        self.assertEqual(texto.replace(texto.split("\n")[4] + "\n", ""),
                         self.DESIGN.replace("- [ ] [01 — Núcleo](tasks/01-nucleo.md) — bloqueada por: nenhuma — cobre: CA-01,\n  CA-02\n", ""))
        sem_caixa = strike_task_item(self.DESIGN, "02", date(2026, 11, 25), "motivo")
        self.assertIn("\n- ~~[02 — Rotas](tasks/02-rotas.md) — bloqueada por: 01 — cobre: CA-03~~ — cancelada em "
                      "2026-11-25: motivo\n", sem_caixa)

    def test_item_ausente_ou_ja_riscado(self):
        """item riscado: sem o item, ou com ele já riscado, é ValueError"""
        with self.assertRaisesRegex(ValueError, "item 09 não encontrado"):
            strike_task_item(self.DESIGN, "09", date(2026, 11, 25), "x")
        with self.assertRaisesRegex(ValueError, "item 03 já está riscado"):
            strike_task_item(self.DESIGN, "03", date(2026, 11, 25), "x")


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
