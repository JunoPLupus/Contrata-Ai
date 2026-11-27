"""Testes do finish_task.py (o "encerrar" e o "cancelar" da task), numa raiz temporária.

A governança e a branch ativa são injetadas (o teste não depende do repositório real nem de git). Cada recusa
confere que nada mudou: a task avulsa, a de spec, o design e o lugar dos arquivos. Rodar a partir da raiz do
projeto:

    python3 -m unittest discover -s .agents/skills/task/scripts/testes -v
"""

import contextlib
import importlib.util
import io
import shutil
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

TESTES = Path(__file__).resolve().parent
SCRIPT = TESTES.parent / "finish_task.py"
EVALS_FILES = TESTES.parents[1] / "evals" / "files"

_SPEC = importlib.util.spec_from_file_location("finish_task", SCRIPT)
ft = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(ft)
Finding = ft.Finding

sys.path.insert(0, str(TESTES))
from test_validate_task import AVULSA_OK, FECHAMENTO_OK, TASK_SPEC_OK  # noqa: E402

HOJE = date(2026, 11, 25)
AVULSA = ".agents/docs/tasks/2026-11-18-restringir-perfil-cliente.md"
AVULSA_DONE = ".agents/docs/tasks/done/2026-11-18-restringir-perfil-cliente.md"
PASTA_SPEC = ".agents/docs/specs/2026-11-15-notificacoes"
TASK_SPEC = f"{PASTA_SPEC}/tasks/02-rotas.md"
DESIGN = f"{PASTA_SPEC}/design.md"
BRANCH_AVULSA = "fix/juno/restringir-perfil-cliente"
BRANCH_SPEC = "feat/juno/notificacoes-02"
LER_ANTES = (
    "api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts",
    "api/src/http/controllers/usuario/cliente/cliente.controller.ts",
)
# As outras tasks da lista do design de notificações (a 02 é a dos testes).
OUTRAS = ("01-nucleo.md", "03-eventos-orcamento.md", "04-eventos-contrato.md", "05-eventos-extensao.md",
          "06-evento-avaliacao.md", "07-requisitos-uc14.md", "08-adr-melhor-esforco.md")

LINHA_AVISO = ".agents/skills/spec/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'adr' citada, ainda não existe"
LINHA_ERRO = "AGENTS.md [ERRO] md.link-quebrado link: destino não existe: x.md"
ANDAMENTO_COM_BASE = f"""## 4. Andamento

- 2026-11-23 — iniciar: aprovada pelo Juno; branch `{{branch}}` criada a partir da `main` no commit de base `abcd1234`.
- 2026-11-23 — base de achados da governança (2):

```text
{LINHA_AVISO}
{LINHA_ERRO}
```

- 2026-11-24 — implementação; testes verdes.

"""
ANDAMENTO_NENHUM = """## 4. Andamento

- 2026-11-23 — iniciar: aprovada pelo Juno; branch `{branch}` criada a partir da `main` no commit de base `abcd1234`.
- 2026-11-23 — base de achados da governança: nenhum

"""
FECHAMENTO_AVULSA = FECHAMENTO_OK.replace(".agents/docs/tasks/2026-11-18-x.md", AVULSA)
FECHAMENTO_SPEC = """## 5. Fechamento

- **O que foi feito:** rotas.
- **Arquivos alterados:** os previstos.
- **Decisões tomadas no caminho:** nenhuma.
- **Testes antes de começar:** ok.
- **Testes no fim:** ok.
- **Evidência por critério:** CA-04 → "deve listar (CA-04)" passando; CA-05 → "deve marcar como lida (CA-05)"
  passando; CA-06 → "deve marcar todas (CA-06)" passando.
- **Checagens não feitas:** nenhuma.
- **Ficou para depois:** nada.
- **Commits entregues:**

  ```text
  feat(notificacao): Adiciona as rotas

  Task: 2026-11-15-notificacoes/tasks/02-rotas.md
  ```

  Arquivos:
  - `api/src/http/routes/notificacao/notificacao.routes.ts`
  - `.agents/docs/specs/2026-11-15-notificacoes/tasks/02-rotas.md`
"""


def avulsa(status: str = "em andamento", andamento: str = ANDAMENTO_COM_BASE, fechamento: str = FECHAMENTO_AVULSA) -> str:
    inicio = AVULSA_OK.index("## 4. Andamento")
    return (AVULSA_OK[:inicio].replace("`aberta`", f"`{status}`")
            + andamento.replace("{branch}", BRANCH_AVULSA) + fechamento)


def task_spec(status: str = "em andamento", andamento: str = ANDAMENTO_COM_BASE, fechamento: str = FECHAMENTO_SPEC) -> str:
    inicio = TASK_SPEC_OK.index("## 4. Andamento")
    return (TASK_SPEC_OK[:inicio].replace("`bloqueada`", f"`{status}`")
            + andamento.replace("{branch}", BRANCH_SPEC) + fechamento)


def outra_task(status: str) -> str:
    return f"# Task: outra\n\n- **Status:** `{status}`\n"


class _Raiz(unittest.TestCase):
    """Raiz temporária com a avulsa e a task 02 da spec de notificações `em andamento`, a spec, o design e as
    outras tasks da lista ainda `aberta`."""

    def setUp(self):
        self.raiz = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.raiz)
        for caminho in LER_ANTES:
            self.escrever(caminho, "// fixture\n")
        self.escrever(AVULSA, avulsa())
        shutil.copy(EVALS_FILES / "spec-notificacoes-aprovada.md", self.escrever(f"{PASTA_SPEC}/spec.md", ""))
        shutil.copy(EVALS_FILES / "design-notificacoes-aprovado.md", self.escrever(DESIGN, ""))
        self.escrever(TASK_SPEC, task_spec())
        for nome in OUTRAS:
            self.escrever(f"{PASTA_SPEC}/tasks/{nome}", outra_task("aberta"))
        self.achados = [self.finding(LINHA_AVISO), self.finding(LINHA_ERRO)]
        self.ativa = BRANCH_AVULSA
        self.chamadas_governanca = 0

    # region Ajudantes

    def escrever(self, relativo: str, texto: str) -> Path:
        caminho = self.raiz / relativo
        caminho.parent.mkdir(parents=True, exist_ok=True)
        caminho.write_text(texto, encoding="utf-8")
        return caminho

    def ler(self, relativo: str) -> str:
        return (self.raiz / relativo).read_text(encoding="utf-8")

    def finding(self, linha: str) -> Finding:
        """O achado que a linha da base descreve (arquivo, severidade, código e mensagem)."""
        arquivo, resto = linha.split(" [", 1)
        severidade, resto = resto.split("] ", 1)
        codigo, mensagem = resto.split(" ", 1)
        return Finding(self.raiz / arquivo, 1, 1, severidade.lower(), codigo, mensagem)

    def governanca(self, raiz: Path) -> list[Finding]:
        self.chamadas_governanca += 1
        return self.achados

    def encerrar(self, relativo: str = AVULSA) -> tuple[int, str]:
        codigo, linhas = ft.finish(self.raiz / relativo, self.raiz, hoje=HOJE, governanca=self.governanca,
                                   branch_ativa=lambda raiz: self.ativa)
        return codigo, "\n".join(linhas)

    def cancelar(self, relativo: str = AVULSA, motivo: str = "ficou fora do MVP") -> tuple[int, str]:
        codigo, linhas = ft.cancel(self.raiz / relativo, self.raiz, motivo, hoje=HOJE)
        return codigo, "\n".join(linhas)

    def estado(self) -> dict[str, str]:
        """Todos os arquivos da raiz com o conteúdo: o lugar e o texto de cada um."""
        return {p.relative_to(self.raiz).as_posix(): p.read_text(encoding="utf-8")
                for p in sorted(self.raiz.rglob("*")) if p.is_file()}

    def assertRecusa(self, acao, relativo: str, recusa: str, **kwargs) -> str:
        antes = self.estado()
        codigo, saida = acao(relativo, **kwargs)
        self.assertEqual(codigo, 1, saida)
        self.assertIn(f"{recusa} recusado", saida)
        self.assertIn("nada foi mudado", saida)
        self.assertEqual(self.estado(), antes)
        return saida

    def assertEncerrarRecusa(self, relativo: str = AVULSA) -> str:
        return self.assertRecusa(self.encerrar, relativo, "Encerrar")

    def assertCancelarRecusa(self, relativo: str = AVULSA, **kwargs) -> str:
        return self.assertRecusa(self.cancelar, relativo, "Cancelar", **kwargs)

    def fechar_as_outras(self, status: str = "concluída", exceto: tuple[str, ...] = ()) -> None:
        for nome in OUTRAS:
            if nome not in exceto:
                self.escrever(f"{PASTA_SPEC}/tasks/{nome}", outra_task(status))

    # endregion


class EncerrarCaminhoFelizTest(_Raiz):
    def test_avulsa_encerrada(self):
        """avulsa encerrada fica concluída, com Atualizado em e Andamento, vai para tasks/done e tem o caminho reescrito nos Commits entregues (CA-16)"""
        codigo, saida = self.encerrar()
        self.assertEqual(codigo, 0, saida)
        self.assertFalse((self.raiz / AVULSA).exists())
        task = self.ler(AVULSA_DONE)
        self.assertIn("- **Status:** `concluída`\n", task)
        self.assertIn("- **Atualizado em:** 2026-11-25 — concluída (aprovada pelo Juno)\n", task)
        self.assertIn("- 2026-11-24 — implementação; testes verdes.\n- 2026-11-25 — encerrada: aprovada pelo Juno; "
                      "governança sem erro novo (2 antigos).\n\n## 5. Fechamento", task)
        self.assertIn(f"  Arquivos:\n  - `{AVULSA_DONE}`\n", task)
        self.assertNotIn(f"`{AVULSA}`", task)
        self.assertIn("Task encerrada", saida)
        self.assertIn(f"1 item(ns) de \"Arquivos:\" agora com {AVULSA_DONE}", saida)
        self.assertIn(f"movida para {AVULSA_DONE}", saida)
        self.assertIn("Já existiam antes da mudança (só informados):", saida)
        self.assertIn("0 erro(s) novo(s), 0 aviso(s) novo(s), 2 já existiam, 0 corrigido(s)", saida)
        self.assertNotIn("Última pendência", saida)  # avulsa não tem spec
        # A task encerrada continua válida no lugar novo, com o fechamento completo.
        self.assertEqual([str(f) for f in ft.vt.validate(self.raiz / AVULSA_DONE, raiz=self.raiz)
                          if f.severidade == "erro"], [])

    def test_task_de_spec_encerrada(self):
        """task de spec encerrada fica concluída e continua na pasta da spec (CA-16)"""
        self.ativa = BRANCH_SPEC
        design = self.ler(DESIGN)
        codigo, saida = self.encerrar(TASK_SPEC)
        self.assertEqual(codigo, 0, saida)
        task = self.ler(TASK_SPEC)
        self.assertIn("- **Status:** `concluída`\n", task)
        self.assertIn("- **Atualizado em:** 2026-11-25 — concluída (aprovada pelo Juno)\n", task)
        self.assertIn("- 2026-11-25 — encerrada: aprovada pelo Juno; governança sem erro novo (2 antigos).\n", task)
        self.assertIn(f"  - `{TASK_SPEC}`\n", task)  # o caminho não muda: a task não sai do lugar
        self.assertFalse((self.raiz / PASTA_SPEC / "tasks" / "done").exists())
        self.assertEqual(self.ler(DESIGN), design)
        self.assertIn(f"continua na pasta da spec: {TASK_SPEC}", saida)


class EncerrarRecusaTest(_Raiz):
    def test_status_diferente_de_em_andamento(self):
        """task fora de em andamento é recusada com o status, sem mudar nada (CA-15)"""
        for status in ("aberta", "bloqueada", "concluída", "cancelada"):
            with self.subTest(status=status):
                self.escrever(AVULSA, avulsa(status))
                saida = self.assertEncerrarRecusa()
                self.assertIn(f"status: a task está `{status}`; o encerrar só aceita task `em andamento`", saida)

    def test_fechamento_com_erro_do_validador(self):
        """fechamento com erro do validador é recusado com os erros, sem mudar nada (CA-15)"""
        # Rótulo vazio e critério sem evidência só são erro com `concluída`: o validador olha o texto já encerrado.
        incompleto = (FECHAMENTO_AVULSA.replace("- **Arquivos alterados:** os previstos.", "- **Arquivos alterados:**")
                      .replace('\n  CA-02 → teste "deve recusar outro cliente (CA-02)" passando.', ""))
        self.escrever(AVULSA, avulsa(fechamento=incompleto))
        saida = self.assertEncerrarRecusa()
        self.assertIn("validador:", saida)
        self.assertIn("fechamento: 'Arquivos alterados' vazio com status `concluída`", saida)
        self.assertIn("fechamento: CA-02 sem evidência com status `concluída`", saida)

    def test_erro_novo_da_governanca(self):
        """erro novo da governança em relação à base recusa só com os novos, sem mudar nada (CA-15)"""
        self.achados += [self.finding("AGENTS.md [ERRO] md.link-quebrado link: destino não existe: novo.md"),
                         self.finding(".agents/skills/task/SKILL.md [AVISO] governanca.skill-pendente pendência: nova")]
        saida = self.assertEncerrarRecusa()
        self.assertIn("1 problema(s)", saida)
        self.assertIn("governança, erro novo: AGENTS.md:1 [ERRO] md.link-quebrado link: destino não existe: novo.md", saida)
        self.assertNotIn("x.md", saida)       # o erro antigo não aparece como problema
        self.assertNotIn("pendência: nova", saida)  # aviso novo não bloqueia

    def test_erro_antigo_nao_recusa(self):
        """erro que já estava na base só é informado: o encerrar segue (CA-15)"""
        codigo, saida = self.encerrar()
        self.assertEqual(codigo, 0, saida)
        self.assertIn(LINHA_ERRO.replace("AGENTS.md ", "AGENTS.md:1 "), saida)

    def test_sem_base_no_andamento(self):
        """task sem base de achados no Andamento é recusada; base 'nenhum' vale (CA-15)"""
        sem_base = "## 4. Andamento\n\n- 2026-11-24 — implementação; testes verdes.\n\n"
        self.escrever(AVULSA, avulsa(andamento=sem_base))
        saida = self.assertEncerrarRecusa()
        self.assertIn("base: sem base de achados da governança no Andamento", saida)
        self.assertEqual(self.chamadas_governanca, 0)

        # Base "nenhum": base vazia válida; sem achado agora, nada é novo.
        self.escrever(AVULSA, avulsa(andamento=ANDAMENTO_NENHUM))
        self.achados = []
        codigo, saida = self.encerrar()
        self.assertEqual(codigo, 0, saida)
        self.assertIn("governança sem erro novo (0 antigos)", self.ler(AVULSA_DONE))

    def test_base_nenhum_com_erro_agora_e_novo(self):
        """com a base 'nenhum', todo erro de agora é novo (CA-15)"""
        self.escrever(AVULSA, avulsa(andamento=ANDAMENTO_NENHUM))
        saida = self.assertEncerrarRecusa()
        self.assertIn("governança, erro novo: AGENTS.md:1 [ERRO] md.link-quebrado", saida)
        self.assertNotIn("base: sem base", saida)

    def test_branch_ativa_diferente(self):
        """branch ativa diferente da branch da task é recusada, sem mudar nada (CA-15)"""
        self.ativa = "main"
        saida = self.assertEncerrarRecusa()
        self.assertIn(f"branch: branch ativa `main`; a task é da `{BRANCH_AVULSA}`", saida)

    def test_destino_existente(self):
        """avulsa com o destino em tasks/done já existente é recusada, sem mudar nada (CA-15)"""
        self.escrever(AVULSA_DONE, "outra task com o mesmo nome\n")
        saida = self.assertEncerrarRecusa()
        self.assertIn(f"destino: {AVULSA_DONE} já existe", saida)

    def test_problemas_do_bloco_juntos(self):
        """problemas do bloco aparecem juntos numa execução só (CA-15)"""
        self.escrever(AVULSA, avulsa("aberta", fechamento=FECHAMENTO_AVULSA.replace(
            "- **Arquivos alterados:** os previstos.", "- **Arquivos alterados:**")))
        self.escrever(AVULSA_DONE, "x\n")
        self.achados.append(self.finding("AGENTS.md [ERRO] md.link-quebrado link: destino não existe: novo.md"))
        self.ativa = "outra"
        saida = self.assertEncerrarRecusa()
        self.assertIn("5 problema(s)", saida)
        for trecho in ("status: a task está `aberta`", "governança, erro novo:", "validador:", "branch: branch ativa `outra`",
                       "destino:"):
            self.assertIn(trecho, saida)


class UltimaPendenciaTest(_Raiz):
    def setUp(self):
        super().setUp()
        self.ativa = BRANCH_SPEC

    def test_encerrar_ultima_pendencia(self):
        """encerrar a última pendência da spec avisa que a spec pode ser encerrada; com outra pendência, nenhum aviso (CA-37)"""
        self.fechar_as_outras(exceto=("05-eventos-extensao.md",))
        codigo, saida = self.encerrar(TASK_SPEC)
        self.assertEqual(codigo, 0, saida)
        self.assertNotIn("Última pendência", saida)  # a 05 ainda está aberta

        self.escrever(TASK_SPEC, task_spec())
        self.fechar_as_outras()
        self.escrever(f"{PASTA_SPEC}/tasks/05-eventos-extensao.md", outra_task("cancelada"))
        codigo, saida = self.encerrar(TASK_SPEC)
        self.assertEqual(codigo, 0, saida)
        self.assertIn("Última pendência da spec: nenhuma outra task ficou aberta. A spec pode ser encerrada agora", saida)
        self.assertIn("seção 7 da skill `spec`", saida)
        self.assertIn("Na branch desta task.", saida)

    def test_task_fora_da_lista_conta(self):
        """task fora da lista do design ainda aberta impede o aviso de última pendência (CA-37)"""
        self.fechar_as_outras()
        self.escrever(f"{PASTA_SPEC}/tasks/09-extra.md", outra_task("aberta"))
        codigo, saida = self.encerrar(TASK_SPEC)
        self.assertEqual(codigo, 0, saida)
        self.assertNotIn("Última pendência", saida)


class CancelarTest(_Raiz):
    def test_cancelar_avulsa(self):
        """avulsa aberta, bloqueada ou em andamento cancelada com motivo fica cancelada, com o motivo no Andamento, e vai para tasks/done (CA-34)"""
        for status in ft.STATUS_PARA_CANCELAR:
            with self.subTest(status=status):
                if (self.raiz / AVULSA_DONE).exists():
                    (self.raiz / AVULSA_DONE).unlink()
                self.escrever(AVULSA, avulsa(status))
                codigo, saida = self.cancelar(motivo="  o perfil   vai mudar  ")
                self.assertEqual(codigo, 0, saida)
                self.assertFalse((self.raiz / AVULSA).exists())
                task = self.ler(AVULSA_DONE)
                self.assertIn("- **Status:** `cancelada`\n", task)
                self.assertIn("- **Atualizado em:** 2026-11-25 — cancelada pelo Juno: o perfil vai mudar\n", task)
                self.assertIn("- 2026-11-25 — cancelada pelo Juno: o perfil vai mudar\n\n## 5. Fechamento", task)
                self.assertIn(f"movida para {AVULSA_DONE}", saida)
                self.assertNotIn("Última pendência", saida)

    def test_cancelar_recusas(self):
        """cancelar sem motivo ou com status concluída é recusado, sem mudar nada (CA-34)"""
        saida = self.assertCancelarRecusa(motivo="   ")
        self.assertIn("motivo: vazio", saida)
        for status in ("concluída", "cancelada"):
            with self.subTest(status=status):
                self.escrever(AVULSA, avulsa(status))
                saida = self.assertCancelarRecusa()
                self.assertIn(f"status: a task está `{status}`; o cancelar só aceita task `aberta` ou `bloqueada` ou "
                              "`em andamento`", saida)

    def test_cancelar_recusas_de_destino_e_item(self):
        """cancelar com o destino existente, ou task de spec sem o item na lista, é recusado com os problemas juntos (CA-34)"""
        self.escrever(AVULSA_DONE, "x\n")
        self.escrever(AVULSA, avulsa("concluída"))
        saida = self.assertCancelarRecusa(motivo="")
        self.assertIn("3 problema(s)", saida)
        self.assertIn(f"destino: {AVULSA_DONE} já existe", saida)

        self.escrever(DESIGN, self.ler(DESIGN).replace("- [ ] [02 — Rotas", "- [ ] [12 — Rotas"))
        saida = self.assertCancelarRecusa(TASK_SPEC)
        self.assertIn("design: item 02 não encontrado", saida)

        # Design sem a linha "Atualizado em": recusa também, sem riscar nada.
        self.escrever(DESIGN, (EVALS_FILES / "design-notificacoes-aprovado.md").read_text(encoding="utf-8")
                      .replace("- **Atualizado em:** 2026-11-15 — aprovação\n", ""))
        saida = self.assertCancelarRecusa(TASK_SPEC)
        self.assertIn("design: linha **Atualizado em:** não encontrada", saida)

    def test_cancelar_task_de_spec(self):
        """task de spec cancelada fica na pasta, cancelada, e o item da lista do design fica riscado com data e motivo (CA-38)"""
        self.escrever(TASK_SPEC, task_spec("aberta", andamento="## 4. Andamento\n\n"))
        codigo, saida = self.cancelar(TASK_SPEC, motivo="rotas viraram outra spec")
        self.assertEqual(codigo, 0, saida)
        task = self.ler(TASK_SPEC)
        self.assertIn("- **Status:** `cancelada`\n", task)
        self.assertIn("## 4. Andamento\n\n- 2026-11-25 — cancelada pelo Juno: rotas viraram outra spec\n", task)
        self.assertFalse((self.raiz / PASTA_SPEC / "tasks" / "done").exists())
        design = self.ler(DESIGN)
        self.assertIn("- [ ] ~~[02 — Rotas de leitura e ações (listar, marcar, excluir lidas)](tasks/02-rotas.md) — "
                      "bloqueada por: 01 — cobre CA-04 a CA-08~~ — cancelada em 2026-11-25: rotas viraram outra spec\n",
                      design)
        self.assertIn("- [ ] [01 — Núcleo", design)  # os outros itens não mudam
        self.assertIn("- **Atualizado em:** 2026-11-25 — task 02 cancelada: rotas viraram outra spec\n", design)
        self.assertIn("item 02 riscado", saida)
        self.assertNotIn("Última pendência", saida)  # as outras ainda estão abertas

    def test_cancelar_ultima_pendencia(self):
        """cancelar a última pendência da spec avisa o encerramento da spec e o commit na main sem branch (CA-38)"""
        self.fechar_as_outras()
        self.escrever(TASK_SPEC, task_spec("bloqueada", andamento="## 4. Andamento\n\n"))
        codigo, saida = self.cancelar(TASK_SPEC)
        self.assertEqual(codigo, 0, saida)
        self.assertIn("Última pendência da spec: nenhuma outra task ficou aberta", saida)
        self.assertIn("A task não tinha branch (cancelada antes de iniciar): o commit vai para a `main`.", saida)

        # Em andamento (com branch): o aviso aponta a branch da task.
        self.escrever(DESIGN, (EVALS_FILES / "design-notificacoes-aprovado.md").read_text(encoding="utf-8"))
        self.escrever(TASK_SPEC, task_spec())
        codigo, saida = self.cancelar(TASK_SPEC)
        self.assertEqual(codigo, 0, saida)
        self.assertIn("Na branch desta task.", saida)


class MainTest(_Raiz):
    def test_main_le_os_argumentos(self):
        """main: sem --cancelar encerra; com --cancelar cancela com o motivo"""
        chamadas = []
        originais = (ft.finish, ft.cancel, ft.get_project_root)
        self.addCleanup(lambda: setattr(ft, "finish", originais[0]) or setattr(ft, "cancel", originais[1])
                        or setattr(ft, "get_project_root", originais[2]))
        ft.finish = lambda arquivo, raiz: chamadas.append(("encerrar", arquivo.name)) or (0, ["ok"])
        ft.cancel = lambda arquivo, raiz, motivo: chamadas.append(("cancelar", arquivo.name, motivo)) or (1, ["não"])
        ft.get_project_root = lambda: self.raiz
        saida = io.StringIO()
        with contextlib.redirect_stdout(saida):
            self.assertEqual(ft.main([str(self.raiz / AVULSA)]), 0)
            self.assertEqual(ft.main([str(self.raiz / AVULSA), "--cancelar", "motivo"]), 1)
        self.assertEqual(saida.getvalue(), "ok\nnão\n")
        self.assertEqual(chamadas, [("encerrar", Path(AVULSA).name), ("cancelar", Path(AVULSA).name, "motivo")])


if __name__ == "__main__":
    unittest.main()
