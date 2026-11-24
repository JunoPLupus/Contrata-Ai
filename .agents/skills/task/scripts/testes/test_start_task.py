"""Testes do start_task.py (o "iniciar"), com git real: um repositório temporário com remoto `git init --bare`.

Cada recusa confere que nada mudou: o arquivo da task, a spec, a branch atual, a lista de branches e o HEAD. A
governança é injetada (o teste não depende do repositório real). Rodar a partir da raiz do projeto:

    python3 -m unittest discover -s .agents/skills/task/scripts/testes -v
"""

import importlib.util
import shutil
import subprocess
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

TESTES = Path(__file__).resolve().parent
SCRIPT = TESTES.parent / "start_task.py"
EVALS_FILES = TESTES.parents[1] / "evals" / "files"

_SPEC = importlib.util.spec_from_file_location("start_task", SCRIPT)
st = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(st)
Finding = st.Finding

sys.path.insert(0, str(TESTES))
from governanca import read_base  # noqa: E402  (o start_task já pôs a pasta da governança no sys.path)
from test_validate_task import AVULSA_OK, TASK_SPEC_OK  # noqa: E402

HOJE = date(2026, 11, 23)
AVULSA = ".agents/docs/tasks/2026-11-18-restringir-perfil-cliente.md"
PASTA_SPEC = ".agents/docs/specs/2026-11-15-notificacoes"
TASK_SPEC = f"{PASTA_SPEC}/tasks/02-rotas.md"
# Caminhos citados em "Ler antes de começar" das fixtures (o validador confere que existem).
LER_ANTES = (
    "api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts",
    "api/src/http/controllers/usuario/cliente/cliente.controller.ts",
)
SPEC_ABERTA = TASK_SPEC_OK.replace("- **Status:** `bloqueada`", "- **Status:** `aberta`")


def git(repo: Path, *args: str) -> str:
    processo = subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True)
    if processo.returncode != 0:
        raise AssertionError(f"git {' '.join(args)} falhou: {processo.stderr}")
    return processo.stdout.strip()


class _Repo(unittest.TestCase):
    """Repositório na `main` com remoto local, a task avulsa, a de spec (02) e a spec `aprovada`."""

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp)
        self.remoto = self.tmp / "remoto.git"
        self.repo = self.tmp / "repo"
        git(self.tmp, "init", "--bare", "-b", "main", str(self.remoto))
        git(self.tmp, "init", "-b", "main", str(self.repo))
        self._identidade(self.repo)
        for caminho in LER_ANTES:
            self.escrever(caminho, "// fixture\n")
        self.escrever(AVULSA, AVULSA_OK)
        (self.repo / PASTA_SPEC / "tasks").mkdir(parents=True)
        shutil.copy(EVALS_FILES / "spec-notificacoes-aprovada.md", self.repo / PASTA_SPEC / "spec.md")
        shutil.copy(EVALS_FILES / "design-notificacoes-aprovado.md", self.repo / PASTA_SPEC / "design.md")
        self.escrever(TASK_SPEC, SPEC_ABERTA)
        self.commit("estado inicial")
        git(self.repo, "remote", "add", "origin", str(self.remoto))
        git(self.repo, "push", "-u", "origin", "main")
        self.chamadas_governanca: list[tuple[str, str]] = []
        self.achados: list[Finding] = []

    # region Ajudantes

    @staticmethod
    def _identidade(repo: Path) -> None:
        git(repo, "config", "user.name", "Teste")
        git(repo, "config", "user.email", "teste@example.com")
        git(repo, "config", "commit.gpgsign", "false")

    def escrever(self, relativo: str, texto: str) -> Path:
        caminho = self.repo / relativo
        caminho.parent.mkdir(parents=True, exist_ok=True)
        caminho.write_text(texto, encoding="utf-8")
        return caminho

    def ler(self, relativo: str) -> str:
        return (self.repo / relativo).read_text(encoding="utf-8")

    def commit(self, mensagem: str) -> None:
        git(self.repo, "add", "-A")
        git(self.repo, "commit", "-q", "-m", mensagem)

    def commit_no_remoto(self, mensagem: str = "commit de outra máquina") -> str:
        """Um clone à parte commita e faz push: a `main` do remoto fica à frente da local. Devolve o SHA."""
        outro = self.tmp / "outro"
        git(self.tmp, "clone", "-q", str(self.remoto), str(outro))
        self._identidade(outro)
        (outro / "novo.txt").write_text(mensagem, encoding="utf-8")
        git(outro, "add", "-A")
        git(outro, "commit", "-q", "-m", mensagem)
        git(outro, "push", "-q", "origin", "main")
        return git(outro, "rev-parse", "HEAD")

    def governanca(self, raiz: Path) -> list[Finding]:
        """Falsa: registra a branch e o HEAD do momento em que rodou e devolve os achados do teste."""
        self.chamadas_governanca.append((git(raiz, "branch", "--show-current"), git(raiz, "rev-parse", "HEAD")))
        return self.achados

    def iniciar(self, relativo: str = AVULSA) -> tuple[int, str]:
        codigo, linhas = st.start(self.repo / relativo, self.repo, hoje=HOJE, governanca=self.governanca)
        return codigo, "\n".join(linhas)

    def estado(self) -> tuple:
        """O que uma recusa não pode mudar."""
        return (self.ler(AVULSA), self.ler(TASK_SPEC), self.ler(f"{PASTA_SPEC}/spec.md"),
                git(self.repo, "branch", "--show-current"), git(self.repo, "branch", "--list"),
                git(self.repo, "rev-parse", "HEAD"))

    def assertRecusaSemMudar(self, relativo: str = AVULSA) -> str:
        antes = self.estado()
        codigo, saida = self.iniciar(relativo)
        self.assertEqual(codigo, 1, saida)
        self.assertIn("Iniciar recusado", saida)
        self.assertEqual(self.estado(), antes)
        self.assertEqual(self.chamadas_governanca, [])  # nem a governança rodou
        return saida

    # endregion


class CaminhoFelizTest(_Repo):
    def test_caminho_feliz(self):
        """iniciar no caminho feliz avança a main, cria a branch e marca a task em andamento com a entrada no Andamento (CA-05)"""
        # Campo Branch com o texto antigo do create_task: o iniciar regrava só com o nome.
        self.escrever(AVULSA, AVULSA_OK.replace("`fix/juno/restringir-perfil-cliente`",
                                                "`fix/juno/restringir-perfil-cliente` (sugerida; criada pelo Juno)"))
        self.commit("task com o campo Branch antigo")
        git(self.repo, "push", "-q", "origin", "main")
        sha_remoto = self.commit_no_remoto()
        codigo, saida = self.iniciar()
        self.assertEqual(codigo, 0, saida)

        self.assertEqual(git(self.repo, "branch", "--show-current"), "fix/juno/restringir-perfil-cliente")
        self.assertEqual(git(self.repo, "rev-parse", "HEAD"), sha_remoto)   # branch sai da main atualizada
        self.assertEqual(git(self.repo, "rev-parse", "main"), sha_remoto)   # a main avançou (fast-forward)
        self.assertEqual(self.chamadas_governanca, [("main", sha_remoto)])  # governança na main atualizada

        task = self.ler(AVULSA)
        self.assertIn("- **Status:** `em andamento`\n", task)
        self.assertIn("- **Branch:** `fix/juno/restringir-perfil-cliente`\n", task)
        self.assertIn("- **Atualizado em:** 2026-11-23 — iniciada (aprovada pelo Juno)\n", task)
        self.assertIn("## 4. Andamento\n\n- 2026-11-23 — iniciar: aprovada pelo Juno; branch "
                      f"`fix/juno/restringir-perfil-cliente` criada a partir da `main` no commit de base "
                      f"`{sha_remoto[:8]}`.\n- 2026-11-23 — base de achados da governança: nenhum\n\n## 5.", task)
        self.assertIn("Task iniciada", saida)
        # A task iniciada continua válida, e as mudanças ficam na branch nova, não commitadas.
        self.assertEqual([f for f in st.vt.validate(self.repo / AVULSA, raiz=self.repo) if f.severidade == "erro"], [])
        self.assertEqual(git(self.repo, "status", "--porcelain"), f"M {AVULSA}")

    def test_base_no_andamento(self):
        """a base da governança vai para o Andamento e erro antigo não impede o iniciar (CA-05)"""
        self.achados = [
            Finding(self.repo / "AGENTS.md", 12, 12, "erro", "md.link-quebrado", "link: destino não existe: x.md"),
            Finding(self.repo / ".agents/skills/spec/SKILL.md", 16, 16, "aviso", "governanca.skill-pendente",
                    "pendência: skill 'adr' citada, ainda não existe"),
        ]
        codigo, saida = self.iniciar()
        self.assertEqual(codigo, 0, saida)
        self.assertIn(
            "- 2026-11-23 — base de achados da governança (2):\n\n```text\n"
            ".agents/skills/spec/SKILL.md [AVISO] governanca.skill-pendente pendência: skill 'adr' citada, ainda não existe\n"
            "AGENTS.md [ERRO] md.link-quebrado link: destino não existe: x.md\n```\n", self.ler(AVULSA))
        self.assertIn("2 achado(s) (1 erro(s) que já existiam)", saida)
        # O bloco é lido pelo read_base da governança, sem conversão (o "encerrar" compara com ele).
        bloco = self.ler(AVULSA).split("```text\n")[1].split("```")[0]
        self.assertEqual(sum(read_base(bloco).values()), 2)


class BlocoDaTaskTest(_Repo):
    def test_status_diferente_de_aberta(self):
        """task com status diferente de aberta é recusada com o status, sem mudar nada (CA-06)"""
        self.escrever(AVULSA, AVULSA_OK.replace("`aberta`", "`bloqueada`"))
        self.commit("task bloqueada")
        saida = self.assertRecusaSemMudar()
        self.assertIn("status: a task está `bloqueada`; o iniciar só começa task `aberta`", saida)

    def test_problemas_do_bloco_juntos(self):
        """problemas do mesmo bloco aparecem juntos e o bloco do repositório só roda com a task ok (CA-06)"""
        self.escrever(AVULSA, AVULSA_OK.replace("`aberta`", "`bloqueada`")
                      .replace("### Em aberto\n\nnada\n", "### Em aberto\n\n- Q1 — onde mora a regra?\n"))
        self.commit("task com dois problemas")
        git(self.repo, "switch", "-q", "-c", "outra")
        self.escrever("solto.txt", "x")
        saida = self.assertRecusaSemMudar()
        self.assertIn("2 problema(s)", saida)
        self.assertIn("status: a task está `bloqueada`", saida)
        self.assertIn("em aberto: 2026-11-18-restringir-perfil-cliente.md:", saida)
        self.assertNotIn("árvore:", saida)  # o repositório só é conferido com a task ok
        self.assertNotIn("branch:", saida)

        # Com a task ok (corrigida e commitada na `outra`), o bloco do repositório mostra os três problemas.
        self.escrever(AVULSA, AVULSA_OK)
        git(self.repo, "add", AVULSA)
        git(self.repo, "commit", "-q", "-m", "task ok")
        git(self.repo, "branch", "fix/juno/restringir-perfil-cliente")
        saida = self.assertRecusaSemMudar()
        self.assertIn("o repositório tem 3 problema(s)", saida)
        self.assertIn("árvore: mudanças pendentes (commite ou descarte antes): solto.txt", saida)
        self.assertIn("branch: o repositório está em `outra`; o iniciar parte da `main`", saida)
        self.assertIn("branch: `fix/juno/restringir-perfil-cliente` já existe", saida)

    def test_item_em_aberto(self):
        """task com item em aberto é recusada com os itens, sem mudar nada (CA-07)"""
        self.escrever(AVULSA, AVULSA_OK.replace("### Em aberto\n\nnada\n",
                                                "### Em aberto\n\n- Q1 — onde mora a regra?\n- Q2 — extrair?\n"))
        self.commit("task com itens em aberto")
        saida = self.assertRecusaSemMudar()
        linha = self.ler(AVULSA).splitlines().index("- Q1 — onde mora a regra?") + 1
        self.assertIn(f"- em aberto: 2026-11-18-restringir-perfil-cliente.md:{linha} Q1 — onde mora a regra?", saida)
        self.assertIn(f"- em aberto: 2026-11-18-restringir-perfil-cliente.md:{linha + 1} Q2 — extrair?", saida)

    def test_erro_de_validacao(self):
        """task com erro de validação é recusada com os erros, sem mudar nada (CA-08)"""
        self.escrever(AVULSA, AVULSA_OK.replace("- **Modo:** `agente implementa, Juno revisa`", "- **Modo:** `qualquer`"))
        self.commit("task inválida")
        saida = self.assertRecusaSemMudar()
        self.assertIn("- validador: 2026-11-18-restringir-perfil-cliente.md:8 [ERRO] task.modo-invalido modo: 'qualquer' inválido", saida)

    def test_aviso_do_validador_nao_recusa(self):
        """Só erro do validador recusa: aviso (ex.: 'Ler antes' sem caminho) não impede o iniciar."""
        sem_caminho = AVULSA_OK.split("### Ler antes de começar\n\n")[1].split("\n\n###")[0]
        self.escrever(AVULSA, AVULSA_OK.replace(sem_caminho, "a conversa de 2026-11-11"))
        self.commit("task com aviso")
        codigo, saida = self.iniciar()
        self.assertEqual(codigo, 0, saida)


class BlocoDoRepositorioTest(_Repo):
    def test_mudancas_pendentes(self):
        """repositório com mudanças pendentes é recusado com os arquivos, sem mudar nada (CA-09)"""
        self.escrever(LER_ANTES[0], "// mudado\n")
        self.escrever("novo.txt", "x")
        saida = self.assertRecusaSemMudar()
        self.assertIn(f"árvore: mudanças pendentes (commite ou descarte antes): {LER_ANTES[0]}, novo.txt", saida)

    def test_fora_da_main(self):
        """fora da main é recusado com a branch atual, sem mudar nada (CA-10)"""
        git(self.repo, "switch", "-q", "-c", "docs/juno/outra")
        saida = self.assertRecusaSemMudar()
        self.assertIn("branch: o repositório está em `docs/juno/outra`; o iniciar parte da `main`", saida)
        self.assertIn("1 problema(s)", saida)

    def test_branch_ja_existe(self):
        """branch da task já existente é recusada, sem mudar nada (CA-11)"""
        git(self.repo, "branch", "fix/juno/restringir-perfil-cliente")
        saida = self.assertRecusaSemMudar()
        self.assertIn("branch: `fix/juno/restringir-perfil-cliente` já existe", saida)

    def test_main_divergente(self):
        """main divergente do remoto é recusada com a mensagem do git, sem criar a branch (CA-12)"""
        self.commit_no_remoto()
        self.escrever("local.txt", "commit só local")
        self.commit("commit só local")
        saida = self.assertRecusaSemMudar()
        self.assertIn("`git pull --ff-only` falhou", saida)
        self.assertRegex(saida, r"(?i)fast-forward")  # a causa vem do próprio git

    def test_remoto_inacessivel(self):
        """remoto inacessível é recusado com a mensagem do git, sem criar a branch (CA-12)"""
        shutil.rmtree(self.remoto)
        saida = self.assertRecusaSemMudar()
        self.assertIn("`git pull --ff-only` falhou", saida)
        self.assertIn(str(self.remoto), saida)  # o git diz qual remoto não achou


class AvisoESpecTest(_Repo):
    def test_aviso_de_possivel_spec(self):
        """o aviso de possível spec aparece e não impede o iniciar (CA-13)"""
        self.escrever(AVULSA, AVULSA_OK.replace("- **Banco:** não", "- **Banco:** sim — coleção nova"))
        self.commit("task com banco")
        codigo, saida = self.iniciar()
        self.assertEqual(codigo, 0, saida)
        self.assertIn("- critério 1 (cria um agregado ou coleção nova, ou muda como os agregados se relacionam): "
                      "eixo 'Banco' com 'sim'", saida)
        self.assertIn("- critério 4 (muda o contrato da API em mais de um recurso)", saida)
        self.assertEqual(git(self.repo, "branch", "--show-current"), "fix/juno/restringir-perfil-cliente")

    def test_sem_aviso_sem_criterio(self):
        """Sem banco, sem contrato e com menos de quatro eixos "sim", o iniciar não mostra aviso."""
        self.escrever(AVULSA, AVULSA_OK.replace("- **Contrato da API:** sim — `GET /clientes/:id` passa a responder 403 para outro cliente",
                                                "- **Contrato da API:** não"))
        self.commit("task sem contrato")
        codigo, saida = self.iniciar()
        self.assertEqual(codigo, 0, saida)
        self.assertNotIn("Aviso", saida)

    def test_primeira_task_poe_a_spec_em_andamento(self):
        """a primeira task põe a spec aprovada em andamento e as seguintes não mudam a spec (CA-36)"""
        codigo, saida = self.iniciar(TASK_SPEC)
        self.assertEqual(codigo, 0, saida)
        self.assertEqual(git(self.repo, "branch", "--show-current"), "feat/juno/notificacoes-02")
        spec = self.ler(f"{PASTA_SPEC}/spec.md")
        self.assertIn("- **Status:** `em andamento`\n", spec)
        self.assertIn("- **Atualizado em:** 2026-11-23 — em andamento: primeira task iniciada (02-rotas.md)\n", spec)
        self.assertIn("spec `em andamento` (primeira task)", saida)

        # A task seguinte, com a spec já `em andamento` (commitada na main), não muda a spec.
        git(self.repo, "add", "-A")
        git(self.repo, "commit", "-q", "-m", "início da 02")
        git(self.repo, "switch", "-q", "main")
        git(self.repo, "merge", "-q", "--ff-only", "feat/juno/notificacoes-02")
        git(self.repo, "push", "-q", "origin", "main")
        self.escrever(f"{PASTA_SPEC}/tasks/03-acoes.md", SPEC_ABERTA)
        self.commit("task 03")
        git(self.repo, "push", "-q", "origin", "main")
        antes = self.ler(f"{PASTA_SPEC}/spec.md")
        codigo, saida = self.iniciar(f"{PASTA_SPEC}/tasks/03-acoes.md")
        self.assertEqual(codigo, 0, saida)
        self.assertEqual(git(self.repo, "branch", "--show-current"), "feat/juno/notificacoes-03")
        self.assertEqual(self.ler(f"{PASTA_SPEC}/spec.md"), antes)
        self.assertNotIn("spec `em andamento`", saida)

    def test_spec_fora_de_aprovada_e_em_andamento(self):
        """task de spec com a spec fora de aprovada e em andamento é recusada com o status (CA-36)"""
        spec = self.ler(f"{PASTA_SPEC}/spec.md")
        self.escrever(f"{PASTA_SPEC}/spec.md", spec.replace("- **Status:** `aprovada`", "- **Status:** `rascunho`"))
        self.commit("spec em rascunho")
        saida = self.assertRecusaSemMudar(TASK_SPEC)
        self.assertIn("spec: a spec está `rascunho`; task de spec só inicia com a spec `aprovada` ou `em andamento`", saida)


class LinhaDeComandoTest(_Repo):
    def test_cli_sem_arquivo(self):
        """Arquivo que não existe interrompe com mensagem, sem traceback."""
        processo = subprocess.run([sys.executable, str(SCRIPT), str(self.tmp / "nao-existe.md")],
                                  capture_output=True, text=True)
        self.assertNotEqual(processo.returncode, 0)
        self.assertIn("não foi encontrado", processo.stderr)
        self.assertNotIn("Traceback", processo.stderr)

    def test_nome_da_branch(self):
        """Avulsa: o nome do arquivo sem a data; de spec: o assunto da spec e o número da task."""
        self.assertEqual(st.branch_name(self.repo / AVULSA, AVULSA_OK), "fix/juno/restringir-perfil-cliente")
        self.assertEqual(st.branch_name(self.repo / TASK_SPEC, SPEC_ABERTA), "feat/juno/notificacoes-02")


if __name__ == "__main__":
    unittest.main()
