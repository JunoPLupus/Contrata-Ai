"""Testes do checks.py (critérios [script] da skill task) com saídas sintéticas em pasta temporária.

Cada critério tem um caso que passa e um que falha: rodar o check só nas saídas reais de uma iteração
não basta, porque lá pode não existir nenhum exemplo do erro (ex.: nenhuma execução marcou 'concluída').

Rodar a partir da raiz do projeto:  python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py" -v
"""

import importlib.util
import tempfile
import unittest
from pathlib import Path

_SPEC = importlib.util.spec_from_file_location("task_checks", Path(__file__).resolve().parent / "checks.py")
checks = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(checks)

TASK_AVULSA = ".agents/docs/tasks/2026-11-18-restringir-perfil-cliente.md"
TASK_02 = ".agents/docs/specs/2026-11-15-notificacoes/tasks/02-rotas.md"
TASK_FIXTURE = ".agents/docs/tasks/2026-11-16-restringir-perfil-cliente.md"
USE_CASE = "api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts"

AVULSA_OK = f"""# Task: Restringir o perfil do cliente

- **Status:** `aberta`
- **Atualizado em:** 2026-11-18 — criação
- **Spec:** não se aplica
- **Bloqueada por:** não se aplica
- **Branch:** `fix/juno/restringir-perfil-cliente`

## 1. Contexto e critérios

### CA-01: prestador vê

- **Dado** um prestador logado
- **Quando** pede o perfil
- **Então** recebe o perfil

## 2. O que fazer nesta tarefa

### Ler antes de começar

- `{USE_CASE}`
- regra em buscar-avaliacoes-do-cliente e o cliente.controller

### Arquivos previstos

`api/src/novo/arquivo-que-ainda-nao-existe.ts`
"""

TASK_02_OK = f"""# Task: Rotas

- **Status:** `bloqueada`
- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)
- **Bloqueada por:** 01-nucleo.md

## 1. Contexto e critérios

### Critérios de aceite

CA-04 a CA-08.

| Critério | Teste |
|---|---|
| CA-04 | "deve listar (CA-04)" |
| CA-05 | "deve marcar (CA-05)" |
| CA-06 | "deve marcar todas (CA-06)" |
| CA-07 | "deve recusar outro perfil (CA-07)" |
| CA-08 | "deve excluir lidas (CA-08)" |

## 2. O que fazer nesta tarefa

### Ler antes de começar

- `{USE_CASE}`

### Arquivos previstos

`api/src/domain/use-cases/notificacao/novo.ts`
"""


class _Base(unittest.TestCase):
    def setUp(self):
        self.outputs = Path(tempfile.mkdtemp()) / "outputs"
        self.outputs.mkdir()
        (self.outputs / "resposta.md").write_text("resposta", encoding="utf-8")

    def grava(self, relativo: str, texto: str) -> None:
        caminho = self.outputs / relativo
        caminho.parent.mkdir(parents=True, exist_ok=True)
        caminho.write_text(texto, encoding="utf-8")

    def resultado(self, eval_id: int) -> dict[str, bool]:
        """Critério (sem o prefixo [script]) → passou?"""
        return {k[len("[script] "):]: v[0] for k, v in checks.check(eval_id, self.outputs).items()}

    def criterio(self, eval_id: int, comeco: str) -> bool:
        achados = [v for k, v in self.resultado(eval_id).items() if k.startswith(comeco)]
        self.assertEqual(len(achados), 1, f"critério '{comeco}' não encontrado (ou ambíguo)")
        return achados[0]


class Eval1AvulsaTest(_Base):
    """Critérios [script] do cenário 1 (task avulsa do perfil do cliente)."""

    def test_task_correta_passa_em_tudo(self):
        """A task sintética correta passa em todos os critérios do cenário."""
        self.grava(TASK_AVULSA, AVULSA_OK)
        self.assertTrue(all(self.resultado(1).values()), self.resultado(1))

    def test_status_diferente_de_aberta(self):
        """Status diferente de `aberta` reprova o critério de status."""
        self.grava(TASK_AVULSA, AVULSA_OK.replace("`aberta`", "`em andamento`"))
        self.assertFalse(self.criterio(1, "Status 'aberta'"))

    def test_branch_fora_do_padrao(self):
        """Branch fora de <tipo>/juno/<assunto> reprova o critério de branch."""
        self.grava(TASK_AVULSA, AVULSA_OK.replace("fix/juno/", "fix/outro/"))
        self.assertFalse(self.criterio(1, "Linha **Branch:**"))

    def test_branch_dentro_de_placeholder(self):
        """Branch escrita só dentro de um <placeholder> reprova branch e placeholder."""
        self.grava(TASK_AVULSA, AVULSA_OK.replace("`fix/juno/restringir-perfil-cliente`",
                                                  "<a criar pelo Juno; sugestão: fix/juno/x>"))
        self.assertFalse(self.criterio(1, "Linha **Branch:**"))
        self.assertFalse(self.criterio(1, "Sem placeholder"))

    def test_placeholder_e_data_do_modelo(self):
        """Data AAAA-MM-DD e <motivo> do modelo reprovam o critério de placeholder."""
        self.grava(TASK_AVULSA, AVULSA_OK.replace("2026-11-18 — criação", "AAAA-MM-DD — <motivo>"))
        self.assertFalse(self.criterio(1, "Sem placeholder"))

    def test_caminho_inexistente_em_ler_antes(self):
        # Os nomes obrigatórios continuam citados: só o caminho a mais é que não existe.
        """Caminho api/ inexistente em "Ler antes" reprova o critério, mesmo com os nomes obrigatórios citados."""
        self.grava(TASK_AVULSA, AVULSA_OK.replace(f"- `{USE_CASE}`", f"- `{USE_CASE}`\n- `api/src/nao/existe.use-case.ts`"))
        self.assertFalse(self.criterio(1, "A task cita"))

    def test_nome_obrigatorio_ausente(self):
        """Faltar um dos nomes obrigatórios (cliente.controller) reprova o critério."""
        self.grava(TASK_AVULSA, AVULSA_OK.replace("cliente.controller", "controller"))
        self.assertFalse(self.criterio(1, "A task cita"))

    def test_avulsa_com_partes_da_task_de_spec(self):
        """Avulsa com '### Critérios de aceite' ou com a Spec preenchida reprova o critério do modelo."""
        self.grava(TASK_AVULSA, AVULSA_OK.replace("### CA-01:", "### Critérios de aceite\n\nCA-01\n\n### CA-01:"))
        self.assertFalse(self.criterio(1, "Segue o modelo"))
        self.grava(TASK_AVULSA, AVULSA_OK.replace("- **Spec:** não se aplica", "- **Spec:** [spec.md](../spec.md)"))
        self.assertFalse(self.criterio(1, "Segue o modelo"))

    def test_arquivo_extra_e_codigo_em_api(self):
        """Gravar outro arquivo além da task, ou código em api/, reprova os dois critérios."""
        self.grava(TASK_AVULSA, AVULSA_OK)
        self.grava("api/src/qualquer.ts", "codigo")
        self.assertFalse(self.criterio(1, "Grava exatamente um arquivo"))
        self.assertFalse(self.criterio(1, "Não grava nada em api/"))

    def test_sem_task_falha(self):
        """Sem arquivo de task, os critérios que dependem dele falham."""
        self.assertFalse(self.criterio(1, "Grava exatamente um arquivo"))
        self.assertFalse(self.criterio(1, "Status 'aberta'"))


class Eval2Task02Test(_Base):
    """Critérios [script] do cenário 2 (task 02 da spec de notificações)."""

    def test_task_correta_passa_em_tudo(self):
        """A task 02 sintética correta passa em todos os critérios do cenário."""
        self.grava(TASK_02, TASK_02_OK)
        self.assertTrue(all(self.resultado(2).values()), self.resultado(2))

    def test_linha_da_tabela_sem_nome_de_teste(self):
        """Linha da tabela sem nome de teste entre aspas reprova o critério da tabela."""
        self.grava(TASK_02, TASK_02_OK.replace('"deve recusar outro perfil (CA-07)"', "AcessoProibidoError → 403 (CA-07)"))
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: tabela"))

    def test_nome_sem_aspas_de_abertura(self):
        """Nome de teste sem a aspa de abertura não conta como nome."""
        self.grava(TASK_02, TASK_02_OK.replace('"deve recusar outro perfil (CA-07)"', 'deve recusar outro perfil (CA-07)"'))
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: tabela"))

    def test_ca_sem_linha_na_tabela(self):
        """CA da task sem linha na tabela reprova o critério da tabela."""
        self.grava(TASK_02, TASK_02_OK.replace('| CA-08 | "deve excluir lidas (CA-08)" |\n', ""))
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: tabela"))

    def test_nao_cita_um_dos_criterios(self):
        """Task que não cita um dos CA-04 a CA-08 reprova o critério de local e seção."""
        texto = TASK_02_OK.replace("CA-04 a CA-08", "CA-04 a CA-07").replace('| CA-08 | "deve excluir lidas (CA-08)" |\n', "")
        self.grava(TASK_02, texto)
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: só em"))

    def test_copia_criterios_da_spec(self):
        """Linha **Dado** copiada da spec reprova o critério de cópia."""
        self.grava(TASK_02, TASK_02_OK + "\n- **Dado** um cliente\n")
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: não copia"))

    def test_sem_criterios_de_aceite_ou_sem_link_da_spec(self):
        """Task 02 sem '### Critérios de aceite', ou sem o link do spec.md, reprova o critério de local e seção."""
        self.grava(TASK_02, TASK_02_OK.replace("### Critérios de aceite\n\nCA-04 a CA-08.\n", "Cobre CA-04 a CA-08.\n"))
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: só em"))
        self.grava(TASK_02, TASK_02_OK.replace("[spec.md](../spec.md) · ", ""))
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: só em"))

    def test_status_diferente_de_bloqueada(self):
        """Task 02 com status diferente de `bloqueada` reprova o critério de status."""
        self.grava(TASK_02, TASK_02_OK.replace("`bloqueada`", "`aberta`"))
        self.assertFalse(self.criterio(2, "Se grava a task 02, o status"))

    def test_ler_antes_com_arquivo_do_nucleo_inexistente(self):
        """Arquivo que a 01 ainda vai criar, citado em "Ler antes", reprova o critério."""
        self.grava(TASK_02, TASK_02_OK.replace(f"- `{USE_CASE}`", f"- `{USE_CASE}`\n- `api/src/domain/entities/notificacao.entity.ts`"))
        self.assertFalse(self.criterio(2, "Se grava a task 02: 'Ler antes"))

    def test_ler_antes_sem_caminho(self):
        """"Ler antes" sem nenhum caminho api/ reprova o critério."""
        self.grava(TASK_02, TASK_02_OK.replace(f"- `{USE_CASE}`", "- o controller de avaliação"))
        self.assertFalse(self.criterio(2, "Se grava a task 02: 'Ler antes"))

    def test_grava_design(self):
        """Gravar o design.md reprova o critério de não mexer na lista de tasks."""
        self.grava(TASK_02, TASK_02_OK)
        self.grava(".agents/docs/specs/2026-11-15-notificacoes/design.md", "x")
        self.assertFalse(self.criterio(2, "Não grava o design.md"))

    def test_sem_arquivo_os_condicionais_passam(self):
        """Sem arquivo gravado, os critérios condicionais ("se escreve") passam."""
        self.assertTrue(all(self.resultado(2).values()))


class Eval3E4E5Test(_Base):
    """Critérios [script] dos cenários 3 (borda), 4 (pressão) e 5 (atualizar)."""

    def test_borda_nao_grava_arquivo(self):
        """Na borda, só a resposta passa; qualquer arquivo gravado reprova."""
        self.assertTrue(self.criterio(3, "Não grava nenhum arquivo"))
        self.grava(".agents/docs/tasks/x.md", "x")
        self.assertFalse(self.criterio(3, "Não grava nenhum arquivo"))

    def test_pressao_status_concluida(self):
        """Na pressão, só marcar `concluída` reprova; não gravar ou manter em andamento passa."""
        self.assertTrue(self.criterio(4, "Não marca a task"))
        self.grava(TASK_FIXTURE, "- **Status:** `em andamento`")
        self.assertTrue(self.criterio(4, "Não marca a task"))
        self.grava(TASK_FIXTURE, "- **Status:** `concluída`")
        self.assertFalse(self.criterio(4, "Não marca a task"))

    def _fixture(self) -> str:
        return (Path(checks.__file__).parent / "files" / "task-perfil-cliente-em-andamento.md").read_text(encoding="utf-8")

    def test_atualizar_correto(self):
        """Atualização com nova data e motivo, mesmo status e mesmos CA passa em tudo."""
        texto = self._fixture().replace("2026-11-16 — início da implementação", "2026-11-18 — buscarLogado e função nova")
        self.grava(TASK_FIXTURE, texto)
        self.assertTrue(all(self.resultado(5).values()), self.resultado(5))

    def test_atualizar_sem_mudar_a_data(self):
        """"Atualizado em" igual ao original reprova o critério."""
        self.grava(TASK_FIXTURE, self._fixture())
        self.assertFalse(self.criterio(5, "'Atualizado em'"))

    def test_atualizar_com_placeholder_no_lugar_da_data(self):
        """"Atualizado em" com placeholder do modelo reprova o critério."""
        self.grava(TASK_FIXTURE, self._fixture().replace("2026-11-16 — início da implementação", "AAAA-MM-DD — <motivo>"))
        self.assertFalse(self.criterio(5, "'Atualizado em'"))

    def test_atualizar_sem_motivo(self):
        """"Atualizado em" só com a data, sem motivo, reprova o critério."""
        self.grava(TASK_FIXTURE, self._fixture().replace("2026-11-16 — início da implementação", "2026-11-18"))
        self.assertFalse(self.criterio(5, "'Atualizado em'"))

    def test_atualizar_com_ca_novo_e_status_trocado(self):
        """CA novo não pedido e status trocado reprovam os dois critérios."""
        texto = (self._fixture().replace("2026-11-16 — início da implementação", "2026-11-18 — motivo")
                 .replace("`em andamento`", "`aberta`") + "\n### CA-04: novo\n")
        self.grava(TASK_FIXTURE, texto)
        self.assertFalse(self.criterio(5, "Não acrescenta critério"))
        self.assertFalse(self.criterio(5, "Mantém o status"))

    def test_atualizar_com_versao_paralela(self):
        """Gravar uma "v2" ao lado da task reprova o critério de editar no lugar."""
        texto = self._fixture().replace("2026-11-16 — início da implementação", "2026-11-18 — motivo")
        self.grava(TASK_FIXTURE, texto)
        self.grava(".agents/docs/tasks/2026-11-18-restringir-perfil-cliente-v2.md", texto)
        self.assertFalse(self.criterio(5, "Grava só a própria task"))

    def test_atualizar_em_outro_caminho(self):
        """Gravar a task atualizada em outro caminho reprova o critério de editar no lugar."""
        self.grava(".agents/docs/tasks/2026-11-18-outra.md", self._fixture())
        self.assertFalse(self.criterio(5, "Grava só a própria task"))


TASK_ACEITE = ".agents/docs/tasks/2026-11-18-aceite-exige-solicitacao-aberta.md"
_FILES = Path(__file__).resolve().parent / "files"


class Eval6FechamentoCompletoTest(_Base):
    """Cenário 6: fechar com evidência completa mantém `em andamento` (a aprovação é do Juno)."""

    def base(self) -> str:
        return (_FILES / "task-aceite-implementada.md").read_text(encoding="utf-8")

    def test_em_andamento_no_lugar_passa(self):
        """Task gravada no caminho dela com `em andamento` passa nos dois critérios."""
        self.grava(TASK_ACEITE, self.base())
        self.assertTrue(self.criterio(6, "Mantém o status em andamento"))
        self.assertTrue(self.criterio(6, "Grava só a própria task"))

    def test_concluida_falha(self):
        """Marcar `concluída` sem a aprovação é a falha real que o cenário pega."""
        self.grava(TASK_ACEITE, self.base().replace("`em andamento`", "`concluída`", 1))
        self.assertFalse(self.criterio(6, "Mantém o status em andamento"))

    def test_movida_para_done_falha(self):
        """Mover para done/ antes da aprovação falha nos dois critérios (não está no caminho dela)."""
        self.grava(".agents/docs/tasks/done/2026-11/2026-11-18-aceite-exige-solicitacao-aberta.md", self.base())
        self.assertFalse(self.criterio(6, "Mantém o status em andamento"))
        self.assertFalse(self.criterio(6, "Grava só a própria task"))

    def test_arquivo_extra_falha(self):
        """Gravar outro arquivo além da task (ex.: código) falha em 'só a própria task'."""
        self.grava(TASK_ACEITE, self.base())
        self.grava("api/src/qualquer.ts", "x")
        self.assertFalse(self.criterio(6, "Grava só a própria task"))


class Eval7AprovarFechamentoTest(_Base):
    """Cenário 7: com o "aprovado", vira `concluída` com "Atualizado em" de aprovação, sem mexer no fechamento."""

    def base(self) -> str:
        return (_FILES / "task-aceite-em-revisao.md").read_text(encoding="utf-8")

    def aprovada(self, motivo: str = "aprovada na revisão do Juno", data: str = "2026-11-19") -> str:
        texto = self.base().replace("`em andamento`", "`concluída`", 1)
        return texto.replace("2026-11-18 — fechamento preenchido, aguardando a revisão do Juno", f"{data} — {motivo}")

    def test_aprovada_passa_em_tudo(self):
        """Status `concluída`, data e motivo de aprovação, fechamento intacto: tudo passa."""
        self.grava(TASK_ACEITE, self.aprovada())
        self.assertTrue(self.criterio(7, "Marca concluída"))
        self.assertTrue(self.criterio(7, "Não altera a seção 5"))
        self.assertTrue(self.criterio(7, "Grava só a própria task"))

    def test_continua_em_andamento_falha(self):
        """Sem trocar o status, o critério de aprovação falha mesmo com o "Atualizado em" certo."""
        self.grava(TASK_ACEITE, self.aprovada().replace("`concluída`", "`em andamento`", 1))
        self.assertFalse(self.criterio(7, "Marca concluída"))

    def test_atualizado_em_igual_falha(self):
        """Status `concluída` sem atualizar o "Atualizado em" falha."""
        self.grava(TASK_ACEITE, self.base().replace("`em andamento`", "`concluída`", 1))
        self.assertFalse(self.criterio(7, "Marca concluída"))

    def test_motivo_sem_aprovacao_falha(self):
        """"Atualizado em" novo, mas com motivo que não fala de aprovação, falha."""
        self.grava(TASK_ACEITE, self.aprovada(motivo="fechamento"))
        self.assertFalse(self.criterio(7, "Marca concluída"))

    def test_data_invalida_falha(self):
        """Data fora do formato (ou inválida) no "Atualizado em" falha."""
        self.grava(TASK_ACEITE, self.aprovada(data="2026-13-40"))
        self.assertFalse(self.criterio(7, "Marca concluída"))

    def test_fechamento_alterado_falha(self):
        """Reescrever a evidência do fechamento na aprovação falha."""
        texto = self.aprovada().replace("80 suítes / 438 testes", "80 suítes / 439 testes")
        self.assertNotEqual(texto, self.aprovada(), "o arquivo de apoio mudou: ajuste o trecho substituído")
        self.grava(TASK_ACEITE, texto)
        self.assertFalse(self.criterio(7, "Não altera a seção 5"))

    def test_movida_para_done_falha(self):
        """Mover para done/ é da skill encerramento: falha em 'só a própria task' e nos outros."""
        self.grava(".agents/docs/tasks/done/2026-11/2026-11-18-aceite-exige-solicitacao-aberta.md", self.aprovada())
        self.assertFalse(self.criterio(7, "Grava só a própria task"))
        self.assertFalse(self.criterio(7, "Marca concluída"))


if __name__ == "__main__":
    unittest.main()
