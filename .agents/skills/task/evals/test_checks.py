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
- **Branch:** `fix/juno/restringir-perfil-cliente`

## 2. Contexto e critérios

### CA-01: prestador vê

- **Dado** um prestador logado
- **Quando** pede o perfil
- **Então** recebe o perfil

## 3. O que fazer nesta tarefa

**Ler antes de começar**:

- `{USE_CASE}`
- regra em buscar-avaliacoes-do-cliente e o cliente.controller

**Arquivos previstos:** `api/src/novo/arquivo-que-ainda-nao-existe.ts`
"""

TASK_02_OK = f"""# Task: Rotas

- **Status:** `bloqueada`

## 1. Vínculo com a spec

- Cobre CA-04 a CA-08.

| Critério | Teste |
|---|---|
| CA-04 | "deve listar (CA-04)" |
| CA-05 | "deve marcar (CA-05)" |
| CA-06 | "deve marcar todas (CA-06)" |
| CA-07 | "deve recusar outro perfil (CA-07)" |
| CA-08 | "deve excluir lidas (CA-08)" |

**Ler antes de começar**:

- `{USE_CASE}`

**Arquivos previstos:** `api/src/domain/use-cases/notificacao/novo.ts`
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
    def test_task_correta_passa_em_tudo(self):
        self.grava(TASK_AVULSA, AVULSA_OK)
        self.assertTrue(all(self.resultado(1).values()), self.resultado(1))

    def test_status_diferente_de_aberta(self):
        self.grava(TASK_AVULSA, AVULSA_OK.replace("`aberta`", "`em andamento`"))
        self.assertFalse(self.criterio(1, "Status 'aberta'"))

    def test_branch_fora_do_padrao(self):
        self.grava(TASK_AVULSA, AVULSA_OK.replace("fix/juno/", "fix/outro/"))
        self.assertFalse(self.criterio(1, "Linha **Branch:**"))

    def test_branch_dentro_de_placeholder(self):
        self.grava(TASK_AVULSA, AVULSA_OK.replace("`fix/juno/restringir-perfil-cliente`",
                                                  "<a criar pelo Juno; sugestão: fix/juno/x>"))
        self.assertFalse(self.criterio(1, "Linha **Branch:**"))
        self.assertFalse(self.criterio(1, "Sem placeholder"))

    def test_placeholder_e_data_do_modelo(self):
        self.grava(TASK_AVULSA, AVULSA_OK.replace("2026-11-18 — criação", "AAAA-MM-DD — <motivo>"))
        self.assertFalse(self.criterio(1, "Sem placeholder"))

    def test_caminho_inexistente_em_ler_antes(self):
        # Os nomes obrigatórios continuam citados: só o caminho a mais é que não existe.
        self.grava(TASK_AVULSA, AVULSA_OK.replace(f"- `{USE_CASE}`", f"- `{USE_CASE}`\n- `api/src/nao/existe.use-case.ts`"))
        self.assertFalse(self.criterio(1, "A task cita"))

    def test_nome_obrigatorio_ausente(self):
        self.grava(TASK_AVULSA, AVULSA_OK.replace("cliente.controller", "controller"))
        self.assertFalse(self.criterio(1, "A task cita"))

    def test_secao_1_presente(self):
        self.grava(TASK_AVULSA, AVULSA_OK.replace("## 2. Contexto", "## 1. Vínculo com a spec\n\n## 2. Contexto"))
        self.assertFalse(self.criterio(1, "Segue o modelo"))

    def test_arquivo_extra_e_codigo_em_api(self):
        self.grava(TASK_AVULSA, AVULSA_OK)
        self.grava("api/src/qualquer.ts", "codigo")
        self.assertFalse(self.criterio(1, "Grava exatamente um arquivo"))
        self.assertFalse(self.criterio(1, "Não grava nada em api/"))

    def test_sem_task_falha(self):
        self.assertFalse(self.criterio(1, "Grava exatamente um arquivo"))
        self.assertFalse(self.criterio(1, "Status 'aberta'"))


class Eval2Task02Test(_Base):
    def test_task_correta_passa_em_tudo(self):
        self.grava(TASK_02, TASK_02_OK)
        self.assertTrue(all(self.resultado(2).values()), self.resultado(2))

    def test_linha_da_tabela_sem_nome_de_teste(self):
        self.grava(TASK_02, TASK_02_OK.replace('"deve recusar outro perfil (CA-07)"', "AcessoProibidoError → 403 (CA-07)"))
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: tabela"))

    def test_nome_sem_aspas_de_abertura(self):
        self.grava(TASK_02, TASK_02_OK.replace('"deve recusar outro perfil (CA-07)"', 'deve recusar outro perfil (CA-07)"'))
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: tabela"))

    def test_ca_sem_linha_na_tabela(self):
        self.grava(TASK_02, TASK_02_OK.replace('| CA-08 | "deve excluir lidas (CA-08)" |\n', ""))
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: tabela"))

    def test_nao_cita_um_dos_criterios(self):
        texto = TASK_02_OK.replace("CA-04 a CA-08", "CA-04 a CA-07").replace('| CA-08 | "deve excluir lidas (CA-08)" |\n', "")
        self.grava(TASK_02, texto)
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: só em"))

    def test_copia_criterios_da_spec(self):
        self.grava(TASK_02, TASK_02_OK + "\n- **Dado** um cliente\n")
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: não copia"))

    def test_secao_2_ou_lugar_errado(self):
        self.grava(TASK_02, TASK_02_OK + "\n## 2. Contexto e critérios\n")
        self.assertFalse(self.criterio(2, "Se escreve o arquivo: só em"))

    def test_status_diferente_de_bloqueada(self):
        self.grava(TASK_02, TASK_02_OK.replace("`bloqueada`", "`aberta`"))
        self.assertFalse(self.criterio(2, "Se grava a task 02, o status"))

    def test_ler_antes_com_arquivo_do_nucleo_inexistente(self):
        self.grava(TASK_02, TASK_02_OK.replace(f"- `{USE_CASE}`", f"- `{USE_CASE}`\n- `api/src/domain/entities/notificacao.entity.ts`"))
        self.assertFalse(self.criterio(2, "Se grava a task 02: 'Ler antes"))

    def test_ler_antes_sem_caminho(self):
        self.grava(TASK_02, TASK_02_OK.replace(f"- `{USE_CASE}`", "- o controller de avaliação"))
        self.assertFalse(self.criterio(2, "Se grava a task 02: 'Ler antes"))

    def test_grava_design(self):
        self.grava(TASK_02, TASK_02_OK)
        self.grava(".agents/docs/specs/2026-11-15-notificacoes/design.md", "x")
        self.assertFalse(self.criterio(2, "Não grava o design.md"))

    def test_sem_arquivo_os_condicionais_passam(self):
        self.assertTrue(all(self.resultado(2).values()))


class Eval3E4E5Test(_Base):
    def test_borda_nao_grava_arquivo(self):
        self.assertTrue(self.criterio(3, "Não grava nenhum arquivo"))
        self.grava(".agents/docs/tasks/x.md", "x")
        self.assertFalse(self.criterio(3, "Não grava nenhum arquivo"))

    def test_pressao_status_concluida(self):
        self.assertTrue(self.criterio(4, "Não marca a task"))
        self.grava(TASK_FIXTURE, "- **Status:** `em andamento`")
        self.assertTrue(self.criterio(4, "Não marca a task"))
        self.grava(TASK_FIXTURE, "- **Status:** `concluída`")
        self.assertFalse(self.criterio(4, "Não marca a task"))

    def _fixture(self) -> str:
        return (Path(checks.__file__).parent / "files" / "task-perfil-cliente-em-andamento.md").read_text(encoding="utf-8")

    def test_atualizar_correto(self):
        texto = self._fixture().replace("2026-11-16 — início da implementação", "2026-11-18 — buscarLogado e função nova")
        self.grava(TASK_FIXTURE, texto)
        self.assertTrue(all(self.resultado(5).values()), self.resultado(5))

    def test_atualizar_sem_mudar_a_data(self):
        self.grava(TASK_FIXTURE, self._fixture())
        self.assertFalse(self.criterio(5, "'Atualizado em'"))

    def test_atualizar_com_placeholder_no_lugar_da_data(self):
        self.grava(TASK_FIXTURE, self._fixture().replace("2026-11-16 — início da implementação", "AAAA-MM-DD — <motivo>"))
        self.assertFalse(self.criterio(5, "'Atualizado em'"))

    def test_atualizar_sem_motivo(self):
        self.grava(TASK_FIXTURE, self._fixture().replace("2026-11-16 — início da implementação", "2026-11-18"))
        self.assertFalse(self.criterio(5, "'Atualizado em'"))

    def test_atualizar_com_ca_novo_e_status_trocado(self):
        texto = (self._fixture().replace("2026-11-16 — início da implementação", "2026-11-18 — motivo")
                 .replace("`em andamento`", "`aberta`") + "\n### CA-04: novo\n")
        self.grava(TASK_FIXTURE, texto)
        self.assertFalse(self.criterio(5, "Não acrescenta critério"))
        self.assertFalse(self.criterio(5, "Mantém o status"))

    def test_atualizar_com_versao_paralela(self):
        texto = self._fixture().replace("2026-11-16 — início da implementação", "2026-11-18 — motivo")
        self.grava(TASK_FIXTURE, texto)
        self.grava(".agents/docs/tasks/2026-11-18-restringir-perfil-cliente-v2.md", texto)
        self.assertFalse(self.criterio(5, "Grava só a própria task"))

    def test_atualizar_em_outro_caminho(self):
        self.grava(".agents/docs/tasks/2026-11-18-outra.md", self._fixture())
        self.assertFalse(self.criterio(5, "Grava só a própria task"))


if __name__ == "__main__":
    unittest.main()
