"""Testes do create_task.py.

A task de spec é criada numa cópia temporária da spec e do design dos evals. A avulsa grava no lugar real
(.agents/docs/tasks/), com uma data de 1999 que não colide com tasks reais, e é apagada no fim do teste.
Rodar a partir da raiz do projeto:  python3 -m unittest discover -s .agents/skills/task/scripts/testes -v
"""

import importlib.util
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

TESTES = Path(__file__).resolve().parent
SCRIPT = TESTES.parent / "create_task.py"
EVALS_FILES = TESTES.parents[1] / "evals" / "files"
RAIZ = next(p for p in TESTES.parents if (p / ".agents").is_dir())

_SPEC = importlib.util.spec_from_file_location("validate_task", TESTES.parent / "validate_task.py")
vt = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(vt)


def criar(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, str(SCRIPT), *args], capture_output=True, text=True)


def _regras(caminho: Path) -> list[str]:
    """Erros do validate_task que não são o conteúdo do modelo ainda por escrever (placeholder/comentário/tabela)."""
    return [
        f.mensagem for f in vt.validate(caminho)
        if f.severidade == "erro" and not f.mensagem.startswith(("placeholder", "comentario", "tabela", "alcance"))
    ]


class AvulsaTest(unittest.TestCase):
    """Criação da task avulsa no lugar real, com data de 1999 e limpeza no fim."""

    DESTINO = RAIZ / ".agents" / "docs" / "tasks" / "1999-01-02-restringir-perfil-do-cliente.md"

    def setUp(self):
        self.assertFalse(self.DESTINO.exists(), "sobra de execução anterior: apague o arquivo à mão")
        self.addCleanup(self.DESTINO.unlink, missing_ok=True)

    def test_cria_avulsa_com_metadados_e_so_a_secao_2(self):
        """Preenche título, datas, status, tipo, Modo, Spec e Bloqueada por ("não se aplica") e branch, com os ### CA-NN, o Andamento e o fechamento vazios, e passa nas regras do validate."""
        r = criar("avulsa", "Restringir perfil do cliente", "--tipo", "fix", "--titulo", "Restringir o perfil",
                  "--data", "1999-01-02")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("status `aberta`", r.stdout)

        texto = self.DESTINO.read_text(encoding="utf-8")
        self.assertTrue(texto.startswith("# Task: Restringir o perfil\n"))
        self.assertIn("- **Status:** `aberta`\n", texto)
        self.assertIn("- **Criado em:** 1999-01-02\n", texto)
        self.assertIn("- **Atualizado em:** 1999-01-02 — criação\n", texto)
        self.assertIn("- **Tipo:** `fix`\n", texto)
        self.assertIn("- **Modo:** `agente implementa, Juno revisa`\n", texto)
        self.assertIn("- **Branch:** `fix/juno/restringir-perfil-do-cliente` (sugerida; criada pelo Juno)\n", texto)
        self.assertIn("- **Spec:** não se aplica\n", texto)
        self.assertIn("- **Bloqueada por:** não se aplica\n", texto)
        self.assertIn("## 1. Contexto e critérios", texto)
        self.assertIn("### CA-01:", texto)  # a avulsa define os critérios
        self.assertNotIn("### Critérios de aceite", texto)
        self.assertIn("## 4. Andamento\n", texto)
        self.assertIn("- **Checagens não feitas:**\n", texto)  # fechamento com rótulos vazios
        fechamento = texto[texto.index("## 5. Fechamento"):]
        self.assertNotRegex(fechamento, r"^- \*\*[^*]+:\*\* <", "placeholder sobrando no fechamento")

        # O que o script preenche passa no validate; o resto é o modelo a escrever.
        self.assertEqual(_regras(self.DESTINO), [])

    def test_modo_padrao_agente(self):
        """task nova nasce com o Modo 'agente implementa, Juno revisa' (CA-20)"""
        r = criar("avulsa", "restringir perfil do cliente", "--tipo", "fix", "--data", "1999-01-02")
        self.assertEqual(r.returncode, 0, r.stderr)
        texto = self.DESTINO.read_text(encoding="utf-8")
        self.assertRegex(texto, r"(?m)^- \*\*Modo:\*\* `agente implementa, Juno revisa`$")
        self.assertEqual([f for f in vt.validate(self.DESTINO) if f.codigo.startswith("task.modo")], [])

    def test_modo_juno(self):
        """--modo juno grava 'Juno implementa, agente guia e revisa' (CA-20)"""
        r = criar("avulsa", "restringir perfil do cliente", "--tipo", "fix", "--modo", "juno", "--data", "1999-01-02")
        self.assertEqual(r.returncode, 0, r.stderr)
        texto = self.DESTINO.read_text(encoding="utf-8")
        self.assertRegex(texto, r"(?m)^- \*\*Modo:\*\* `Juno implementa, agente guia e revisa`$")
        self.assertNotIn("agente implementa, Juno revisa", texto)
        self.assertEqual([f for f in vt.validate(self.DESTINO) if f.codigo.startswith("task.modo")], [])

    def test_modo_fora_do_conjunto(self):
        """--modo só aceita agente ou juno; outro valor falha sem criar o arquivo."""
        r = criar("avulsa", "restringir perfil do cliente", "--tipo", "fix", "--modo", "humano", "--data", "1999-01-02")
        self.assertNotEqual(r.returncode, 0)
        self.assertFalse(self.DESTINO.exists())

    def test_nao_sobrescreve_task_existente(self):
        """Criar a mesma task duas vezes falha na segunda, sem sobrescrever."""
        argumentos = ("avulsa", "restringir perfil do cliente", "--tipo", "fix", "--data", "1999-01-02")
        self.assertEqual(criar(*argumentos).returncode, 0)
        segunda = criar(*argumentos)
        self.assertNotEqual(segunda.returncode, 0)
        self.assertIn("já existe", segunda.stderr)

    def test_tipo_obrigatorio_e_do_conjunto(self):
        """--tipo é obrigatório e só aceita os tipos de commit."""
        self.assertNotEqual(criar("avulsa", "x", "--data", "1999-01-02").returncode, 0)
        self.assertNotEqual(criar("avulsa", "x", "--tipo", "bug", "--data", "1999-01-02").returncode, 0)


class DeSpecTest(unittest.TestCase):
    """Criação da task de spec a partir da lista do design.md, numa cópia temporária da spec."""

    def setUp(self):
        self.pasta = Path(tempfile.mkdtemp()) / "specs" / "2026-11-15-notificacoes"
        self.addCleanup(shutil.rmtree, self.pasta.parents[1])
        self.pasta.mkdir(parents=True)
        shutil.copy(EVALS_FILES / "spec-notificacoes-aprovada.md", self.pasta / "spec.md")
        shutil.copy(EVALS_FILES / "design-notificacoes-aprovado.md", self.pasta / "design.md")

    def criar_task(self, numero: str, *extra: str) -> tuple[subprocess.CompletedProcess, str]:
        r = criar("spec", str(self.pasta), numero, "--tipo", "feat", "--data", "2026-11-18", *extra)
        arquivos = list((self.pasta / "tasks").glob(f"{numero}-*.md")) if r.returncode == 0 else []
        return r, arquivos[0].read_text(encoding="utf-8") if arquivos else ""

    def test_task_02_bloqueada_pela_01_nao_criada(self):
        """A 02 nasce `bloqueada` pela 01 ainda não criada, com título, CA, branch e arquivo vindos do design.md."""
        r, texto = self.criar_task("02")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertTrue((self.pasta / "tasks" / "02-rotas.md").exists())
        self.assertIn("Bloqueada por: 01-nucleo.md (não criada)", r.stdout)

        self.assertTrue(texto.startswith("# Task: Rotas de leitura e ações (listar, marcar, excluir lidas)\n"))
        self.assertIn("- **Status:** `bloqueada`\n", texto)
        self.assertIn("- **Bloqueada por:** 01-nucleo.md\n", texto)
        self.assertIn("- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)\n", texto)
        self.assertIn("### Critérios de aceite\n\nCA-04 a CA-08\n", texto)
        self.assertIn("- **Branch:** `feature/notificacoes` (sugerida; criada pelo Juno)\n", texto)  # a do design
        self.assertIn("- **Modo:** `agente implementa, Juno revisa`\n", texto)
        self.assertIn("## 1. Contexto e critérios", texto)
        self.assertNotRegex(texto, r"(?m)^### CA-01")  # a de spec cita os critérios do spec.md
        self.assertIn("## 5. Fechamento", texto)
        self.assertEqual(_regras(self.pasta / "tasks" / "02-rotas.md"), [])

    def test_task_de_spec_com_modo_juno(self):
        """Na task de spec, --modo juno também grava 'Juno implementa, agente guia e revisa'."""
        r, texto = self.criar_task("02", "--modo", "juno")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("- **Modo:** `Juno implementa, agente guia e revisa`\n", texto)

    def test_dependencia_concluida_ou_em_done_libera(self):
        """Dependência `concluída`, ou já movida para done/, deixa a task `aberta`."""
        tasks = self.pasta / "tasks"
        tasks.mkdir()
        (tasks / "01-nucleo.md").write_text("- **Status:** `concluída`\n", encoding="utf-8")
        _, texto = self.criar_task("02")
        self.assertIn("- **Status:** `aberta`\n", texto)

        (tasks / "01-nucleo.md").unlink()
        (tasks / "02-rotas.md").unlink()
        (tasks / "done").mkdir()
        (tasks / "done" / "01-nucleo.md").write_text("x", encoding="utf-8")
        _, texto = self.criar_task("02")
        self.assertIn("- **Status:** `aberta`\n", texto)

    def test_dependencia_em_andamento_bloqueia(self):
        """Dependência em andamento bloqueia a task, e o script diz o status dela."""
        tasks = self.pasta / "tasks"
        tasks.mkdir()
        (tasks / "01-nucleo.md").write_text("- **Status:** `em andamento`\n", encoding="utf-8")
        r, texto = self.criar_task("02")
        self.assertIn("01-nucleo.md (em andamento)", r.stdout)
        self.assertIn("- **Status:** `bloqueada`\n", texto)

    def test_sem_dependencia_e_sem_criterio(self):
        """Task sem dependência e sem critério nasce `aberta`, com "nenhuma" e "nenhum"."""
        _, texto = self.criar_task("07")
        self.assertIn("- **Status:** `aberta`\n", texto)
        self.assertIn("- **Bloqueada por:** nenhuma\n", texto)
        self.assertIn("### Critérios de aceite\n\nnenhum\n", texto)

    def test_criterios_com_dois_pontos_do_modelo_e_branch_sem_design(self):
        """Aceita "cobre:" do modelo e, sem branch no design, sugere <tipo>/juno/<assunto da spec>-NN."""
        design = self.pasta / "design.md"
        texto = design.read_text(encoding="utf-8")
        texto = re.sub(r"- \*\*Branch:\*\*.*", "- **Branch:** <nome da branch, criada pelo Juno>", texto)
        texto = texto.replace("— cobre CA-03, CA-09", "— cobre: CA-03, CA-09")
        design.write_text(texto, encoding="utf-8")
        _, task = self.criar_task("01")
        self.assertIn("### Critérios de aceite\n\nCA-03, CA-09\n", task)
        self.assertIn("- **Branch:** `feat/juno/notificacoes-01` (sugerida; criada pelo Juno)\n", task)

    def test_numero_fora_da_lista_cancelada_ou_sem_design(self):
        """Recusa número fora da lista, task riscada (cancelada) e pasta sem design.md."""
        r, _ = self.criar_task("42")
        self.assertIn("não está na lista", r.stderr)

        design = self.pasta / "design.md"
        design.write_text(design.read_text(encoding="utf-8").replace("- [ ] [05", "- ~~[05"), encoding="utf-8")
        r, _ = self.criar_task("05")
        self.assertIn("riscada (cancelada)", r.stderr)

        design.unlink()
        r, _ = self.criar_task("02")
        self.assertIn("'design.md' não encontrado", r.stderr)

    def test_nao_sobrescreve_task_existente(self):
        """Criar a mesma task de spec duas vezes falha na segunda."""
        self.criar_task("02")
        r, _ = self.criar_task("02")
        self.assertIn("já existe", r.stderr)


if __name__ == "__main__":
    unittest.main()
