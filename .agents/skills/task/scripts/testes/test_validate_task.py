"""Testes do validate_task.py: um caso que passa e, para cada regra, um caso que falha.

A base é a fixture avulsa-ok.md (e uma task de spec montada em pasta temporária com a spec e o design dos
evals); cada teste muda um trecho e confere a mensagem. Rodar a partir da raiz do projeto:

    python3 -m unittest discover -s .agents/skills/task/scripts/testes -v
"""

import importlib.util
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

TESTES = Path(__file__).resolve().parent
SCRIPT = TESTES.parent / "validate_task.py"
EVALS_FILES = TESTES.parents[1] / "evals" / "files"

_SPEC = importlib.util.spec_from_file_location("validate_task", SCRIPT)
vt = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(vt)

AVULSA_OK = (TESTES / "avulsa-ok.md").read_text(encoding="utf-8")

FECHAMENTO_OK = """## 5. Fechamento

- **O que foi feito:** regra no use-case e no controller.
- **Arquivos alterados:** os previstos.
- **Decisões tomadas no caminho:** nenhuma.
- **Testes antes de começar:** unit 80 / 435 ✅.
- **Testes no fim:** unit 80 / 437 ✅; 2 mutações detectadas.
- **Evidência por critério:** CA-01 → teste "deve retornar o perfil para prestador (CA-01)" passando;
  CA-02 → teste "deve recusar outro cliente (CA-02)" passando.
- **Checagens não feitas:** nenhuma.
- **Ficou para depois:** nada.
- **Commits entregues:** `fix(cliente): Restringe o perfil do cliente`.
"""

TASK_SPEC_OK = """# Task: Rotas de leitura e ações

- **Status:** `bloqueada`
- **Criado em:** 2026-11-18
- **Atualizado em:** 2026-11-18 — criação
- **Tipo:** `feat`
- **Alcance:** `só API`
- **Branch:** `feature/notificacoes` (sugerida; criada pelo Juno)

## 1. Vínculo com a spec (task de spec)

- **Spec:** [spec.md](../spec.md) · **Design:** [design.md](../design.md)
- **Bloqueada por:** [01-nucleo.md](01-nucleo.md)
- **Critérios de aceite cobertos:** CA-04 a CA-06

## 3. O que fazer nesta tarefa

1. Rotas de listar e marcar.

**Ler antes de começar:**

- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`
- o que a 01 entregar (entidade e repositório)

**Arquivos previstos:** `api/src/http/routes/notificacao/notificacao.routes.ts` (novo)

**Não deve mudar:** rotas de cliente.

**Testes existentes que vão mudar de propósito:** nenhum.

## 4. Como validar o que foi feito

| Critério | Teste que prova |
|---|---|
| CA-04 | "deve listar (CA-04)" |
| CA-05 | "deve marcar como lida (CA-05)" |
| CA-06 | "deve marcar todas (CA-06)" |

## 5. Fechamento

- **O que foi feito:**
- **Checagens não feitas:**
"""


class _Base(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp)

    def gravar(self, texto: str, relativo: str = "tasks/2026-11-18-x.md") -> Path:
        caminho = self.tmp / relativo
        caminho.parent.mkdir(parents=True, exist_ok=True)
        caminho.write_text(texto, encoding="utf-8")
        return caminho

    def mensagens(self, texto: str, fechar: bool = False, relativo: str = "tasks/2026-11-18-x.md") -> list[str]:
        """Achados como no relatório, sem o nome do arquivo: 'linha [SEVERIDADE] mensagem'."""
        caminho = self.gravar(texto, relativo)
        return [str(f).split(":", 1)[1] for f in vt.validate(caminho, fechar=fechar)]

    def erros(self, texto: str, **kwargs) -> list[str]:
        return [m for m in self.mensagens(texto, **kwargs) if "[ERRO]" in m]

    def assertAcusa(self, trecho: str, achados: list[str]) -> None:
        self.assertTrue(any(trecho in a for a in achados), f"'{trecho}' não está em {achados}")


class AvulsaTest(_Base):
    """Regras da task avulsa, uma por teste, a partir da fixture avulsa-ok.md."""

    def test_task_completa_passa_sem_nenhum_achado(self):
        """A fixture completa não gera erro nem aviso (base de todos os outros casos)."""
        self.assertEqual(self.mensagens(AVULSA_OK), [])

    def test_cli_passa_e_falha_com_codigo_de_saida(self):
        """A linha de comando sai com 0 sem problemas e com 1 quando há erro, citando arquivo:linha."""
        ok = subprocess.run([sys.executable, str(SCRIPT), str(self.gravar(AVULSA_OK))], capture_output=True, text=True)
        self.assertEqual((ok.returncode, ok.stdout.strip()), (0, "Nenhum problema encontrado."))

        ruim = self.gravar(AVULSA_OK.replace("`aberta`", "`feito`"), "tasks/ruim.md")
        falha = subprocess.run([sys.executable, str(SCRIPT), str(ruim)], capture_output=True, text=True)
        self.assertEqual(falha.returncode, 1)
        self.assertIn("ruim.md:3 [ERRO] status: valor 'feito' inválido", falha.stdout)

    def test_cli_arquivo_inexistente(self):
        """Arquivo que não existe interrompe com mensagem, sem traceback."""
        r = subprocess.run([sys.executable, str(SCRIPT), str(self.tmp / "nao.md")], capture_output=True, text=True)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("não foi encontrado", r.stderr)

    def test_placeholder_e_comentario_do_modelo(self):
        """<placeholder> e comentário HTML do modelo que sobraram são erro."""
        texto = AVULSA_OK.replace("- **Fica fora:** front.", "- **Fica fora:** <o que não fazer>\n<!-- apagar -->")
        erros = self.erros(texto)
        self.assertAcusa("placeholder: <o que não fazer>", erros)
        self.assertAcusa("comentario: <!-- apagar -->", erros)

    def test_status_com_a_lista_do_modelo(self):
        """Status com a lista de opções do modelo (`a` | `b`) é erro: o primeiro valor não pode passar por escolhido."""
        texto = AVULSA_OK.replace("- **Status:** `aberta`", "- **Status:** `aberta` | `em andamento`")
        self.assertAcusa("3 [ERRO] status: lista de opções do modelo", self.erros(texto))

    def test_status_ausente(self):
        """Task sem a linha **Status:** é erro."""
        self.assertAcusa("status: linha **Status:** não encontrada",
                         self.erros(AVULSA_OK.replace("- **Status:** `aberta`\n", "")))

    def test_tipo_e_alcance_com_lista_ou_valor_invalido(self):
        """Alcance com a lista do modelo e tipo fora dos tipos de commit são erro."""
        texto = AVULSA_OK.replace("`só API`", "`só API` | `só front`").replace("- **Tipo:** `fix`", "- **Tipo:** `bug`")
        erros = self.erros(texto)
        self.assertAcusa("alcance: lista de opções do modelo", erros)
        self.assertAcusa("tipo: 'bug' inválido", erros)

    def test_atualizado_sem_motivo_ou_antes_da_criacao(self):
        """"Atualizado em" sem motivo, com data inválida ou anterior ao "Criado em" é erro."""
        self.assertAcusa("atualizado em: use 'AAAA-MM-DD — motivo'",
                         self.erros(AVULSA_OK.replace("2026-11-18 — criação", "2026-11-18")))
        self.assertAcusa("atualizado em: 2026-11-17 é anterior ao 'Criado em' (2026-11-18)",
                         self.erros(AVULSA_OK.replace("2026-11-18 — criação", "2026-11-17 — revisão")))
        self.assertAcusa("atualizado em: use 'AAAA-MM-DD — motivo'",
                         self.erros(AVULSA_OK.replace("2026-11-18 — criação", "2026-13-01 — data inválida")))

    def test_avulsa_com_secao_1_ou_sem_secao_2(self):
        """Avulsa usa só a seção 2: com a seção 1, ou sem a 2, é erro."""
        com_1 = AVULSA_OK.replace("## 2. Contexto", "## 1. Vínculo com a spec\n\n- x\n\n## 2. Contexto")
        self.assertAcusa("task avulsa não usa a seção '## 1. Vínculo com a spec'", self.erros(com_1))
        sem_2 = AVULSA_OK.replace("## 2. Contexto e critérios (task avulsa)", "## Contexto")
        self.assertAcusa("seção: obrigatória ausente: ## 2. Contexto e critérios", self.erros(sem_2))

    def test_secao_4_ausente(self):
        """As seções 3, 4 e 5 são obrigatórias; aqui falta a 4."""
        texto = AVULSA_OK.replace("## 4. Como validar o que foi feito", "## Validação")
        self.assertAcusa("seção: obrigatória ausente: ## 4. Como validar o que foi feito", self.erros(texto))

    def test_criterio_sem_quando_e_id_fora_do_formato(self):
        """Critério sem Quando e ID fora do formato CA-NN são erro."""
        texto = AVULSA_OK.replace("- **Quando** ele chama `GET /clientes/:id`\n", "").replace("### CA-02", "### CA-2")
        erros = self.erros(texto)
        self.assertAcusa("critério: CA-01 sem Quando", erros)
        self.assertAcusa("critério: ID 'CA-2' fora do formato CA-NN", erros)

    def test_branch_fora_do_padrao(self):
        """Branch fora de <tipo>/juno/<assunto>, ou com tipo que não é de commit, é erro."""
        self.assertAcusa("branch: use '<tipo>/juno/<assunto>'",
                         self.erros(AVULSA_OK.replace("`fix/juno/", "`fix/outro/")))
        self.assertAcusa("branch: tipo 'bugfix' fora de",
                         self.erros(AVULSA_OK.replace("`fix/juno/", "`bugfix/juno/")))

    def test_ler_antes_com_caminho_inexistente(self):
        """Caminho inexistente em "Ler antes" é erro; arquivo novo em "Arquivos previstos" não é."""
        texto = AVULSA_OK.replace("- api/src/http/", "- `api/src/nao/existe.ts`\n- api/src/http/")
        erros = self.erros(texto)
        self.assertAcusa("ler antes: caminho não existe: api/src/nao/existe.ts", erros)
        # "Arquivos previstos" pode citar arquivo novo: não é acusado.
        self.assertFalse(any("pode-ver-perfil" in e for e in erros), erros)

    def test_ler_antes_caminho_com_linha_fora_de_codigo(self):
        """Caminho com ":linha" e fora de crases também é conferido (sem isso, o caminho passaria sem checagem)."""
        texto = AVULSA_OK.replace("cliente/cliente.controller.ts:40", "cliente/nao-existe.controller.ts:40")
        self.assertAcusa("ler antes: caminho não existe: api/src/http/controllers/usuario/cliente/nao-existe.controller.ts",
                         self.erros(texto))

    def test_ler_antes_sem_caminho_e_aviso(self):
        """"Ler antes" sem nenhum caminho de arquivo é só aviso, na linha do rótulo."""
        texto = AVULSA_OK.replace(
            "- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`\n"
            "- api/src/http/controllers/usuario/cliente/cliente.controller.ts:40 (método `buscarPorId`).\n",
            "- o use-case de buscar cliente\n")
        self.assertEqual([m for m in self.mensagens(texto)], ["34 [AVISO] ler antes: nenhum caminho de arquivo citado"])

    def test_tabela_sem_nome_sem_linha_e_ca_de_fora(self):
        """Tabela critério → teste: linha sem nome, CA sem linha e CA que não é da task são erro."""
        texto = (AVULSA_OK.replace('"deve retornar o perfil para prestador (CA-01)"', "AcessoProibidoError → 403")
                 .replace("| CA-02 | `buscar", "| CA-07 | `buscar"))
        erros = self.erros(texto)
        self.assertAcusa('tabela: CA-01 sem nome de teste entre aspas terminando em "(CA-01)"', erros)
        self.assertAcusa("tabela: CA-02 sem linha na tabela", erros)
        self.assertAcusa("tabela: CA-07 não é critério desta task", erros)

    def test_tabela_com_nome_de_outro_ca(self):
        """O nome do teste precisa terminar com o (CA-NN) da própria linha, não de outro critério."""
        texto = AVULSA_OK.replace("prestador (CA-01)", "prestador (CA-02)")
        self.assertAcusa("tabela: CA-01 sem nome de teste", self.erros(texto))

    def test_task_de_documentacao_tabela_sem_nome_e_so_aviso(self):
        """Em task de alcance `documentação`, linha da tabela sem nome de teste é aviso, não erro."""
        texto = (AVULSA_OK.replace("`só API`", "`documentação`")
                 .replace('"deve retornar o perfil para prestador (CA-01)"', "cenário avulsa"))
        mensagens = self.mensagens(texto)
        self.assertEqual(self.erros(texto), [])
        self.assertAcusa("[AVISO] tabela: CA-01 sem nome de teste", mensagens)

    def test_link_quebrado(self):
        """Link relativo para arquivo que não existe é erro."""
        texto = AVULSA_OK.replace("- **Fica fora:** front.", "- **Fica fora:** front ([ver](../nao-existe.md)).")
        self.assertAcusa("link: destino não existe: ../nao-existe.md", self.erros(texto))


class FechamentoTest(_Base):
    """Regras do fechamento (seção 5), com --fechar ou status `concluída`."""

    def _fechada(self, status: str = "concluída", fechamento: str = FECHAMENTO_OK) -> str:
        inicio = AVULSA_OK.index("## 5. Fechamento")
        return AVULSA_OK[:inicio].replace("`aberta`", f"`{status}`") + fechamento

    def test_concluida_com_fechamento_completo_passa(self):
        """Task concluída com todos os rótulos preenchidos e evidência por CA não gera achado."""
        self.assertEqual(self.mensagens(self._fechada(), fechar=True), [])

    def test_fechar_com_checagens_vazias(self):
        """Ao fechar, "Checagens não feitas" vazia é erro (pode ser "nenhuma", não vazia)."""
        texto = self._fechada("em andamento").replace("- **Checagens não feitas:** nenhuma.", "- **Checagens não feitas:**")
        self.assertAcusa("fechamento: preencha 'Checagens não feitas'", self.erros(texto, fechar=True))

    def test_sem_fechar_em_andamento_nao_confere_o_fechamento(self):
        """Task em andamento sem --fechar pode ter o fechamento com rótulos vazios."""
        self.assertEqual(self.erros(AVULSA_OK.replace("`aberta`", "`em andamento`")), [])

    def test_em_andamento_com_fechamento_parcial_passa_ao_fechar(self):
        """Fechamento parcial com o que faltou em "Checagens não feitas" passa se a task continua em andamento."""
        parcial = ("## 5. Fechamento\n\n- **O que foi feito:** rota e use-case.\n- **Evidência por critério:**\n"
                   "- **Checagens não feitas:** integração (sem Docker); teste do CA-02 não existe.\n")
        self.assertEqual(self.erros(self._fechada("em andamento", parcial), fechar=True), [])

    def test_concluida_sem_flag_confere_o_fechamento(self):
        """Status `concluída` aplica as regras de fechamento mesmo sem --fechar."""
        erros = self.erros(AVULSA_OK.replace("`aberta`", "`concluída`"))
        self.assertAcusa("fechamento: 'O que foi feito' vazio com status `concluída`", erros)
        self.assertAcusa("fechamento: preencha 'Checagens não feitas'", erros)

    def test_concluida_com_rotulo_ausente(self):
        """Task concluída sem um rótulo do fechamento é erro."""
        texto = self._fechada().replace("- **Ficou para depois:** nada.\n", "")
        self.assertAcusa("fechamento: rótulo 'Ficou para depois' ausente", self.erros(texto))

    def test_concluida_sem_evidencia_de_um_criterio(self):
        """Task concluída sem evidência de um dos CA-NN é erro."""
        texto = self._fechada().replace('\n  CA-02 → teste "deve recusar outro cliente (CA-02)" passando.', "")
        self.assertAcusa("fechamento: CA-02 sem evidência com status `concluída`", self.erros(texto))

    def test_concluida_com_checagem_pendente_e_aviso(self):
        """Task concluída com checagem pendente é aviso (o agente confere se ela impede concluir)."""
        texto = self._fechada().replace("- **Checagens não feitas:** nenhuma.", "- **Checagens não feitas:** mutação manual.")
        self.assertEqual(self.erros(texto), [])
        self.assertAcusa("[AVISO] fechamento: há checagens não feitas", self.mensagens(texto))

    def test_fechar_com_status_aberta(self):
        """Fechar com status diferente de `concluída` ou `em andamento` é erro."""
        self.assertAcusa("fechamento: status 'aberta' ao fechar", self.erros(self._fechada("aberta"), fechar=True))


class TaskDeSpecTest(_Base):
    """Regras da task de spec, numa cópia temporária da spec e do design dos evals."""

    RELATIVO = "specs/2026-11-15-notificacoes/tasks/02-rotas.md"

    def setUp(self):
        super().setUp()
        pasta = self.tmp / "specs" / "2026-11-15-notificacoes"
        pasta.mkdir(parents=True)
        shutil.copy(EVALS_FILES / "spec-notificacoes-aprovada.md", pasta / "spec.md")
        shutil.copy(EVALS_FILES / "design-notificacoes-aprovado.md", pasta / "design.md")

    def erros_spec(self, texto: str) -> list[str]:
        return self.erros(texto, relativo=self.RELATIVO)

    def test_task_de_spec_completa_passa(self):
        """Task de spec completa, com a pasta da spec ao lado, não gera achado."""
        self.assertEqual(self.mensagens(TASK_SPEC_OK, relativo=self.RELATIVO), [])

    def test_tipo_vem_do_caminho(self):
        """O tipo da task vem do caminho: dentro de specs/ é de spec; fora, avulsa."""
        self.assertEqual(vt.task_type(self.tmp / self.RELATIVO), "spec")
        self.assertEqual(vt.task_type(self.tmp / "tasks" / "x.md"), "avulsa")

    def test_copia_criterios_da_spec(self):
        """Task de spec que copia Dado/Quando/Então ou define ### CA-NN é erro: o critério mora no spec.md."""
        texto = TASK_SPEC_OK.replace("## 3.", "### CA-04: listar\n\n- **Dado** um cliente\n\n## 3.")
        erros = self.erros_spec(texto)
        self.assertAcusa("task de spec cita os CA-NN do spec.md, não copia Dado / Quando / Então", erros)
        self.assertAcusa("task de spec não define '### CA-04'", erros)

    def test_com_secao_2(self):
        """Task de spec com a seção 2 é erro."""
        texto = TASK_SPEC_OK.replace("## 3.", "## 2. Contexto e critérios\n\n- x\n\n## 3.")
        self.assertAcusa("task de spec não usa a seção '## 2. Contexto e critérios'", self.erros_spec(texto))

    def test_ca_inexistente_na_spec_e_fora_do_formato(self):
        """CA citado que não existe no spec.md, ou fora do formato CA-NN, é erro."""
        texto = TASK_SPEC_OK.replace("CA-04 a CA-06", "CA-04 a CA-06, CA-99, CA-7")
        erros = self.erros_spec(texto)
        self.assertAcusa("14 [ERRO] critério: CA-99 citado mas não existe no spec.md", erros)
        self.assertAcusa("critério: 'CA-7' fora do formato CA-NN", erros)

    def test_intervalo_cobre_os_do_meio_na_tabela(self):
        """"CA-04 a CA-06" exige linha na tabela também para o CA-05."""
        texto = TASK_SPEC_OK.replace('| CA-05 | "deve marcar como lida (CA-05)" |\n', "")
        self.assertAcusa("tabela: CA-05 sem linha na tabela", self.erros_spec(texto))

    def test_branch_diferente_da_do_design(self):
        """Task de spec usa a branch do design.md quando ele tem uma."""
        texto = TASK_SPEC_OK.replace("`feature/notificacoes`", "`feat/juno/notificacoes`")
        self.assertAcusa("branch: task de spec usa a branch do design.md (feature/notificacoes)", self.erros_spec(texto))

    def test_link_para_task_irma_nao_criada_e_aceito_mas_spec_quebrada_nao(self):
        """Link para task irmã ainda não criada é aceito; link quebrado para outro arquivo não."""
        self.assertEqual(self.erros_spec(TASK_SPEC_OK), [])
        texto = TASK_SPEC_OK.replace("(../spec.md)", "(../nao-existe.md)")
        self.assertAcusa("link: destino não existe: ../nao-existe.md", self.erros_spec(texto))

    def test_sem_spec_na_pasta_pula_a_conferencia_dos_ca_e_usa_o_padrao_de_branch(self):
        """Sem spec.md na pasta, os CA não são conferidos e a branch segue o padrão <tipo>/juno/<assunto>."""
        texto = TASK_SPEC_OK.replace("CA-04 a CA-06", "CA-04 a CA-06, CA-99")
        erros = self.erros(texto, relativo="outra/specs/x/tasks/02-rotas.md")
        self.assertFalse(any("CA-99 citado" in e for e in erros), erros)
        self.assertAcusa("branch: use '<tipo>/juno/<assunto>'", erros)


if __name__ == "__main__":
    unittest.main()
