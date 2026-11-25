"""Testes do approve_spec.py (o "aprovar" da spec), numa pasta de spec montada num diretório temporário.

Cada recusa confere que nada mudou: o spec.md, o design.md e os arquivos da pasta. Rodar a partir da raiz:

    python3 -m unittest discover -s .agents/skills/spec/scripts/testes -v
"""

import shutil
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

TESTES = Path(__file__).resolve().parent
sys.path.insert(0, str(TESTES.parent))
import approve_spec  # noqa: E402  (precisa do sys.path ajustado acima)
import validate_spec  # noqa: E402

HOJE = date(2026, 11, 24)
PASTA_SPEC = ".agents/docs/specs/2026-11-15-notificacoes"


def task_spec(status: str, ficou: str = "") -> str:
    """Task de spec mínima: só o que os scripts da spec leem (status e o "Ficou para depois")."""
    return (f"# Task: x\n\n- **Status:** `{status}`\n\n## 5. Fechamento\n\n- **Testes no fim:** ok\n"
            f"- **Ficou para depois:** {ficou}\n- **Commits entregues:** x\n")


class _PastaDeSpec(unittest.TestCase):
    """Raiz temporária com a pasta da spec (spec.md e design.md da fixture com-design, sem o link quebrado)."""

    def setUp(self):
        self.raiz = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.raiz)
        self.pasta = self.raiz / PASTA_SPEC
        shutil.copytree(TESTES / "com-design", self.pasta)
        self.mudar("design.md", "- Ver [ADR inexistente](../nao-existe.md); CA-11 também.", "- Nenhum risco novo.")
        (self.pasta / "tasks").mkdir()

    # region Ajudantes

    def mudar(self, arquivo: str, antes: str, depois: str) -> None:
        caminho = self.pasta / arquivo
        texto = caminho.read_text(encoding="utf-8")
        if texto.count(antes) != 1:
            raise AssertionError(f"trecho não achado uma vez só: {antes[:60]!r}")
        caminho.write_text(texto.replace(antes, depois), encoding="utf-8")

    def ler(self, arquivo: str = "spec.md") -> str:
        return (self.pasta / arquivo).read_text(encoding="utf-8")

    def task(self, nome: str, status: str, ficou: str = "") -> None:
        (self.pasta / "tasks" / nome).write_text(task_spec(status, ficou), encoding="utf-8")

    def estado(self) -> dict[str, str]:
        """Todos os arquivos da raiz (caminho → conteúdo): uma mudança ou um movimento de pasta aparece aqui."""
        return {str(p.relative_to(self.raiz)): p.read_text(encoding="utf-8")
                for p in sorted(self.raiz.rglob("*")) if p.is_file()}

    def erros_do_validador(self, pasta: Path | None = None) -> list[str]:
        return [str(f) for f in validate_spec.validate(pasta or self.pasta, raiz=self.raiz) if f.severidade == "erro"]

    # endregion


class _Aprovar(_PastaDeSpec):
    def setUp(self):
        super().setUp()
        # A fixture está aprovada: volta para o rascunho de antes da aprovação.
        self.mudar("spec.md", "- **Status:** `aprovada`", "- **Status:** `rascunho`")
        self.mudar("spec.md", "- **Aprovada em:** 2026-11-15, pelo Juno", "- **Aprovada em:** rascunho")

    def aprovar(self) -> tuple[int, str]:
        codigo, linhas = approve_spec.approve(self.pasta, self.raiz, hoje=HOJE)
        return codigo, "\n".join(linhas)

    def assertRecusaSemMudar(self) -> str:
        antes = self.estado()
        codigo, saida = self.aprovar()
        self.assertEqual(codigo, 1, saida)
        self.assertIn(f"Aprovar recusado: a spec {PASTA_SPEC} tem ", saida)
        self.assertIn("; nada foi mudado.", saida)
        self.assertEqual(self.estado(), antes)
        return saida


class CaminhoFelizTest(_Aprovar):
    def test_aprova_spec_em_rascunho(self):
        """spec em rascunho sem erro e sem item em aberto fica aprovada, com o Atualizado em do dia e o registro da aprovação (CA-35)"""
        design = self.ler("design.md")
        codigo, saida = self.aprovar()
        self.assertEqual(codigo, 0, saida)
        spec = self.ler()
        self.assertIn("- **Status:** `aprovada`\n", spec)
        self.assertIn("- **Aprovada em:** 2026-11-24, pelo Juno\n", spec)
        self.assertIn("- **Atualizado em:** 2026-11-24 — aprovada pelo Juno\n", spec)
        self.assertIn("- **Encerrada em:** em aberto\n", spec)
        self.assertEqual(self.ler("design.md"), design)
        self.assertIn("- status `aprovada` (nenhuma task da lista iniciada)", saida)
        self.assertEqual(self.erros_do_validador(), [])  # a spec aprovada continua válida

    def test_reaprovacao(self):
        """spec reaprovada com task já iniciada fica em andamento, e sem task iniciada fica aprovada (CA-35)"""
        # Spec que voltou a rascunho num "atualizar" mantém a data antiga; tasks só abertas ou bloqueadas.
        self.mudar("spec.md", "- **Aprovada em:** rascunho", "- **Aprovada em:** 2026-11-15, pelo Juno")
        self.task("01-nucleo.md", "aberta")
        self.task("02-rotas.md", "bloqueada")
        self.task("09-fora-da-lista.md", "em andamento")  # fora da lista: não conta para a reaprovação
        codigo, saida = self.aprovar()
        self.assertEqual(codigo, 0, saida)
        self.assertIn("- **Status:** `aprovada`\n", self.ler())

        for status in ("em andamento", "concluída", "cancelada"):
            with self.subTest(status=status):
                self.mudar("spec.md", "- **Status:** `aprovada`", "- **Status:** `rascunho`")
                self.task("01-nucleo.md", status)
                codigo, saida = self.aprovar()
                self.assertEqual(codigo, 0, saida)
                self.assertIn("- **Status:** `em andamento`\n", self.ler())
                self.assertIn(f"- **Atualizado em:** 2026-11-24 — aprovada pelo Juno (reaprovação; task já iniciada: "
                              f"01 ({status}))\n", self.ler())
                self.assertIn(f"- status `em andamento` (reaprovação com task da lista já iniciada: 01 ({status}))", saida)
                self.assertEqual(self.erros_do_validador(), [])
                self.mudar("spec.md", "- **Status:** `em andamento`", "- **Status:** `aprovada`")

        # Item riscado na lista (task cancelada) também conta como iniciada.
        self.mudar("spec.md", "- **Status:** `aprovada`", "- **Status:** `rascunho`")
        self.task("01-nucleo.md", "aberta")
        self.mudar("design.md", "- [ ] [05 — Eventos de extensão de prazo](tasks/05-eventos-extensao.md) — bloqueada por: 01 — cobre CA-10",
                   "- ~~[05 — Eventos de extensão de prazo](tasks/05-eventos-extensao.md)~~ — cancelada em 2026-11-20: fora do MVP")
        codigo, saida = self.aprovar()
        self.assertEqual(codigo, 0, saida)
        self.assertIn("- **Status:** `em andamento`\n", self.ler())
        self.assertIn("05 (cancelada)", saida)


class RecusaTest(_Aprovar):
    def test_item_em_aberto(self):
        """spec com item em aberto é recusada com os itens, sem mudar nada (CA-35)"""
        self.mudar("spec.md", "### Em aberto\n\nnada\n", "### Em aberto\n\n- Limite de 50 ou 100?\n\nPrazo do TTL?\n")
        saida = self.assertRecusaSemMudar()
        linha = self.ler().splitlines().index("- Limite de 50 ou 100?") + 1
        self.assertIn(f"- em aberto: spec.md:{linha} Limite de 50 ou 100?", saida)
        self.assertIn(f"- em aberto: spec.md:{linha + 2} Prazo do TTL?", saida)
        self.assertIn("2 problema(s)", saida)

    def test_erro_de_validacao(self):
        """spec com erro de validação é recusada com os erros, sem mudar nada (CA-35)"""
        self.mudar("design.md", "(tasks/08-adr-melhor-esforco.md) — bloqueada por: 01 — cobre: nenhum",
                   "(tasks/08-adr-melhor-esforco.md) — bloqueada por: 01")
        saida = self.assertRecusaSemMudar()
        self.assertIn("- validador: design.md:76 [ERRO] spec.task-sem-cobre lista de tasks: item 08 sem 'cobre'", saida)
        self.assertIn("1 problema(s)", saida)

    def test_fora_de_rascunho(self):
        """spec fora de rascunho é recusada com o status atual, sem mudar nada (CA-35)"""
        for status in ("aprovada", "em andamento", "concluída"):
            with self.subTest(status=status):
                self.mudar("spec.md", "- **Status:** `rascunho`", f"- **Status:** `{status}`")
                self.mudar("spec.md", "- **Aprovada em:** rascunho", "- **Aprovada em:** 2026-11-15, pelo Juno")
                if status == "concluída":
                    self.mudar("spec.md", "- **Encerrada em:** em aberto", "- **Encerrada em:** 2026-11-20, pelo Juno")
                saida = self.assertRecusaSemMudar()
                self.assertIn(f"- status: a spec está `{status}`; o aprovar só aceita spec em `rascunho`", saida)
                self.assertIn("1 problema(s)", saida)  # a spec está válida: só o status recusa
                self.mudar("spec.md", f"- **Status:** `{status}`", "- **Status:** `rascunho`")
                self.mudar("spec.md", "- **Aprovada em:** 2026-11-15, pelo Juno", "- **Aprovada em:** rascunho")
                if status == "concluída":
                    self.mudar("spec.md", "- **Encerrada em:** 2026-11-20, pelo Juno", "- **Encerrada em:** em aberto")

    def test_problemas_juntos(self):
        """problemas do bloco aparecem juntos numa execução só (CA-35)"""
        self.mudar("spec.md", "- **Status:** `rascunho`", "- **Status:** `aprovada`")
        self.mudar("spec.md", "### Em aberto\n\nnada\n", "### Em aberto\n\n- Limite de 50 ou 100?\n")
        self.mudar("design.md", "(tasks/08-adr-melhor-esforco.md) — bloqueada por: 01 — cobre: nenhum",
                   "(tasks/08-adr-melhor-esforco.md) — bloqueada por: 01")
        saida = self.assertRecusaSemMudar()
        self.assertIn("- status: a spec está `aprovada`", saida)
        self.assertIn("spec.aprovada-sem-data", saida)            # status mudado à mão, sem a data
        self.assertIn("spec.aprovada-com-aberto", saida)
        self.assertIn("spec.task-sem-cobre", saida)
        self.assertIn("- em aberto: spec.md:", saida)
        self.assertIn("5 problema(s)", saida)


class LinhaDeComandoTest(_Aprovar):
    def test_cli_sem_spec(self):
        """Pasta sem spec.md interrompe com mensagem, sem traceback."""
        with self.assertRaises(SystemExit) as erro:
            approve_spec.main([str(self.raiz / "nao-existe")])
        self.assertIn("'spec.md' não foi encontrado", str(erro.exception))


if __name__ == "__main__":
    unittest.main()
