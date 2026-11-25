"""Testes do finish_spec.py (o "encerrar" da spec), numa pasta de spec montada num diretório temporário.

Cada recusa confere que nada mudou: o spec.md, o design.md, as tasks e o lugar da pasta. Rodar a partir da raiz:

    python3 -m unittest discover -s .agents/skills/spec/scripts/testes -v
"""

import contextlib
import io
import sys
import unittest
from pathlib import Path

TESTES = Path(__file__).resolve().parent
sys.path.insert(0, str(TESTES))
sys.path.insert(0, str(TESTES.parent))
import finish_spec  # noqa: E402  (precisa do sys.path ajustado acima)
from test_approve_spec import HOJE, PASTA_SPEC, _PastaDeSpec  # noqa: E402

DONE = ".agents/docs/specs/done/2026-11-15-notificacoes"
TASKS = ("01-nucleo.md", "02-rotas.md", "03-eventos-orcamento.md", "04-eventos-contrato.md",
         "05-eventos-extensao.md", "06-evento-avaliacao.md", "07-requisitos-uc14.md", "08-adr-melhor-esforco.md")


class _Encerrar(_PastaDeSpec):
    """Spec `em andamento`, com todas as tasks da lista `concluída` (a 07 `cancelada`): pronta para encerrar."""

    def setUp(self):
        super().setUp()
        self.mudar("spec.md", "- **Status:** `aprovada`", "- **Status:** `em andamento`")
        for nome in TASKS:
            self.task(nome, "cancelada" if nome.startswith("07") else "concluída", "nada")

    def encerrar(self) -> tuple[int, str]:
        codigo, linhas = finish_spec.finish(self.pasta, self.raiz, hoje=HOJE)
        return codigo, "\n".join(linhas)

    def listar(self) -> tuple[int, str]:
        """O --listar pela linha de comando (main), como a skill roda."""
        saida = io.StringIO()
        with contextlib.redirect_stdout(saida):
            codigo = finish_spec.main([str(self.pasta), "--listar"])
        return codigo, saida.getvalue()

    def com_pendencias_versionadas(self) -> None:
        """Um "Ficou para depois" preenchido na 02 e uma nota abaixo da lista do design."""
        self.task("02-rotas.md", "concluída", "paginação das notificações → task avulsa.")
        design = self.pasta / "design.md"
        design.write_text(design.read_text(encoding="utf-8") + "\nNotas para abrir as tasks:\n\n"
                          "- **03:** conferir o índice do TTL.\n", encoding="utf-8")

    def assertRecusaSemMudar(self) -> str:
        antes = self.estado()
        codigo, saida = self.encerrar()
        self.assertEqual(codigo, 1, saida)
        self.assertIn(f"Encerrar spec recusado: a spec {PASTA_SPEC} tem ", saida)
        self.assertIn("; nada foi mudado.", saida)
        self.assertEqual(self.estado(), antes)
        self.assertTrue((self.pasta / "spec.md").is_file())
        self.assertFalse((self.raiz / DONE / "spec.md").exists())
        return saida


class CaminhoFelizTest(_Encerrar):
    def test_encerra_e_move(self):
        """spec em andamento com todas as tasks concluídas ou canceladas fica concluída e a pasta vai para specs/done (CA-19)"""
        # Item riscado sem arquivo também conta como cancelada.
        (self.pasta / "tasks" / "05-eventos-extensao.md").unlink()
        self.mudar("design.md", "- [ ] [05 — Eventos de extensão de prazo](tasks/05-eventos-extensao.md) — bloqueada por: 01 — cobre CA-10",
                   "- ~~[05 — Eventos de extensão de prazo](tasks/05-eventos-extensao.md)~~ — cancelada em 2026-11-20: fora do MVP")
        antes = {k.replace(PASTA_SPEC, DONE): v for k, v in self.estado().items()}
        codigo, saida = self.encerrar()
        self.assertEqual(codigo, 0, saida)

        self.assertFalse(self.pasta.exists())
        destino = self.raiz / DONE
        spec = (destino / "spec.md").read_text(encoding="utf-8")
        self.assertIn("- **Status:** `concluída`\n", spec)
        self.assertIn("- **Encerrada em:** 2026-11-24, pelo Juno\n", spec)
        self.assertIn("- **Atualizado em:** 2026-11-24 — concluída (aprovada pelo Juno)\n", spec)
        self.assertIn("- **Aprovada em:** 2026-11-15, pelo Juno\n", spec)
        # Só o spec.md mudou; o design.md e as tasks foram junto, iguais.
        depois = self.estado()
        self.assertEqual({k: v for k, v in depois.items() if not k.endswith("spec.md")},
                         {k: v for k, v in antes.items() if not k.endswith("spec.md")})
        self.assertIn(f"- pasta movida para {DONE}", saida)
        self.assertEqual(self.erros_do_validador(destino), [])  # a spec concluída continua válida

    def test_cria_done_se_faltar_e_mantem_as_outras(self):
        """specs/done/ é criada se faltar; com outra spec já lá dentro, ela continua."""
        outra = self.raiz / ".agents/docs/specs/done/2026-10-01-outra/spec.md"
        outra.parent.mkdir(parents=True)
        outra.write_text("x", encoding="utf-8")
        codigo, saida = self.encerrar()
        self.assertEqual(codigo, 0, saida)
        self.assertTrue((self.raiz / DONE / "spec.md").is_file())
        self.assertEqual(outra.read_text(encoding="utf-8"), "x")


class RecusaTest(_Encerrar):
    def test_task_pendente(self):
        """spec com task aberta, bloqueada ou em andamento não é movida, e a saída lista as tasks que faltam (CA-19)"""
        self.task("01-nucleo.md", "aberta")
        self.task("02-rotas.md", "bloqueada")
        self.task("03-eventos-orcamento.md", "em andamento")
        (self.pasta / "tasks" / "04-eventos-contrato.md").unlink()
        self.task("09-fora-da-lista.md", "aberta")
        saida = self.assertRecusaSemMudar()
        self.assertIn("5 problema(s)", saida)
        self.assertIn("- task pendente: 01 — Núcleo: entidade, model, repositório, INotificador e ILogger (`aberta`)", saida)
        self.assertIn("- task pendente: 02 — Rotas de leitura e ações (listar, marcar, excluir lidas) (`bloqueada`)", saida)
        self.assertIn("- task pendente: 03 — Eventos de solicitação e orçamento (`em andamento`)", saida)
        self.assertIn("- task pendente: 04 — Eventos de contrato (cancelado, status, concluído) (não criada)", saida)
        self.assertIn("- task pendente: 09 — 09-fora-da-lista.md (fora da lista com status `aberta`)", saida)

    def test_fora_de_em_andamento(self):
        """spec fora de em andamento é recusada com o status, sem mover a pasta (CA-19)"""
        self.mudar("spec.md", "- **Status:** `em andamento`", "- **Status:** `aprovada`")
        saida = self.assertRecusaSemMudar()
        self.assertIn("- status: a spec está `aprovada`; o encerrar só aceita spec `em andamento`", saida)
        self.assertIn("1 problema(s)", saida)

    def test_erro_de_validacao_junto_das_pendentes(self):
        """spec com erro de validação é recusada com os erros, junto das tasks pendentes, sem mover a pasta (CA-19)"""
        self.mudar("design.md", "(tasks/08-adr-melhor-esforco.md) — bloqueada por: 01 — cobre: nenhum",
                   "(tasks/08-adr-melhor-esforco.md) — bloqueada por: 01")
        self.mudar("spec.md", "- **Aprovada em:** 2026-11-15, pelo Juno", "- **Aprovada em:** rascunho")
        self.task("06-evento-avaliacao.md", "em andamento")
        saida = self.assertRecusaSemMudar()
        self.assertIn("3 problema(s)", saida)
        self.assertIn("- validador: design.md:76 [ERRO] spec.task-sem-cobre", saida)
        self.assertIn("- validador: spec.md:10 [ERRO] spec.aprovada-sem-data", saida)
        self.assertIn("- task pendente: 06 — Evento de avaliação recebida (`em andamento`)", saida)

    def test_destino_ja_existe(self):
        """destino já existente em specs/done é recusado, sem mover a pasta (CA-19)"""
        (self.raiz / DONE).mkdir(parents=True)
        saida = self.assertRecusaSemMudar()
        self.assertIn(f"- destino: {DONE} já existe", saida)
        self.assertIn("1 problema(s)", saida)


class PendenciasVersionadasTest(_Encerrar):
    def test_listar(self):
        """--listar mostra as tasks pendentes, o Ficou para depois e as notas do design, sem mudar nada (CA-39)"""
        self.com_pendencias_versionadas()
        self.task("01-nucleo.md", "em andamento", "nada")
        antes = self.estado()
        codigo, saida = self.listar()
        self.assertEqual(codigo, 0, saida)
        self.assertEqual(self.estado(), antes)
        self.assertIn("nada foi mudado", saida)
        self.assertIn("Tasks pendentes (1):\n- 01 — Núcleo: entidade, model, repositório, INotificador e ILogger "
                      "(`em andamento`)", saida)
        self.assertIn("Pendências versionadas fora das tasks (3;", saida)
        self.assertIn("- tasks/02-rotas.md:8 [Ficou para depois] paginação das notificações → task avulsa.", saida)
        linha = self.ler("design.md").splitlines().index("Notas para abrir as tasks:") + 1
        self.assertIn(f"- design.md:{linha} [nota do design] Notas para abrir as tasks:", saida)
        self.assertIn(f"- design.md:{linha + 2} [nota do design] - **03:** conferir o índice do TTL.", saida)
        self.assertNotIn("[Ficou para depois] nada", saida)

        # Sem nada pendente, o --listar diz isso (e ainda não muda nada).
        self.task("01-nucleo.md", "concluída", "nada")
        self.task("02-rotas.md", "concluída", "nenhum")
        self.mudar("design.md", "\nNotas para abrir as tasks:\n\n- **03:** conferir o índice do TTL.\n", "")
        codigo, saida = self.listar()
        self.assertEqual(codigo, 0, saida)
        self.assertIn("Tasks pendentes: nenhuma.", saida)
        self.assertIn("Pendências versionadas fora das tasks: nenhuma.", saida)
        self.assertTrue((self.pasta / "spec.md").is_file())

    def test_recusa_e_caminho_feliz_mostram(self):
        """a recusa por task pendente e o caminho feliz também mostram as pendências versionadas (CA-39)"""
        self.com_pendencias_versionadas()
        self.task("01-nucleo.md", "aberta", "nada")
        saida = self.assertRecusaSemMudar()
        self.assertIn("- task pendente: 01", saida)
        self.assertIn("- tasks/02-rotas.md:8 [Ficou para depois] paginação das notificações → task avulsa.", saida)
        self.assertIn("[nota do design] - **03:** conferir o índice do TTL.", saida)

        self.task("01-nucleo.md", "concluída", "nada")
        codigo, saida = self.encerrar()
        self.assertEqual(codigo, 0, saida)
        self.assertIn("- tasks/02-rotas.md:8 [Ficou para depois] paginação das notificações → task avulsa.", saida)
        self.assertIn("[nota do design] - **03:** conferir o índice do TTL.", saida)


if __name__ == "__main__":
    unittest.main()
