"""Testes do validate_spec.py contra as pastas-fixture desta pasta.

Rodar a partir da raiz do projeto:  python3 -m unittest discover -s <esta pasta> -v
"""

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

TESTES = Path(__file__).resolve().parent
SCRIPT = TESTES.parent / "validate_spec.py"


def validar(pasta: str | Path) -> tuple[int, str]:
    r = subprocess.run([sys.executable, str(SCRIPT), str(TESTES / pasta)], capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


def trocar(texto: str, antes: str, depois: str) -> str:
    """Troca um trecho que precisa existir uma vez só (a fixture mudou? o teste falha aqui, não em silêncio)."""
    if texto.count(antes) != 1:
        raise AssertionError(f"trecho não achado uma vez só: {antes[:60]!r}")
    return texto.replace(antes, depois)


class _ComCopia(unittest.TestCase):
    """Cópia temporária de uma pasta-fixture, para variar spec.md e design.md em cada teste."""

    FIXTURE = "com-design"

    def setUp(self):
        self.pasta = Path(tempfile.mkdtemp()) / "spec"
        self.addCleanup(shutil.rmtree, self.pasta.parent)
        shutil.copytree(TESTES / self.FIXTURE, self.pasta)
        # Sem o link quebrado e o CA inexistente da fixture: cada teste mostra só o que varia.
        self.mudar("design.md", "- Ver [ADR inexistente](../nao-existe.md); CA-11 também.", "- Nenhum risco novo.")

    def mudar(self, arquivo: str, antes: str, depois: str) -> None:
        caminho = self.pasta / arquivo
        caminho.write_text(trocar(caminho.read_text(encoding="utf-8"), antes, depois), encoding="utf-8")

    def validar(self) -> tuple[int, str]:
        return validar(self.pasta)


class ValidateSpecTest(unittest.TestCase):
    """Regras do validate_spec.py, uma pasta-fixture por regra."""

    def test_spec_aprovada_limpa_passa(self):
        """Spec aprovada e completa sai sem problema e com código 0."""
        codigo, saida = validar("so-spec")
        self.assertEqual(codigo, 0, saida)
        self.assertIn("Nenhum problema encontrado.", saida)

    def test_pasta_sem_spec_falha(self):
        """Pasta sem spec.md interrompe com mensagem."""
        codigo, saida = validar("sem-spec")
        self.assertNotEqual(codigo, 0)
        self.assertIn("'spec.md' não foi encontrado", saida)

    def test_codigo_e_comparacao_nao_sao_placeholder(self):
        """<tipo> em código e "x < 5" não são placeholder; AAAA-MM-DD fora de código é."""
        codigo, saida = validar("falsos-positivos")
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:11 [ERRO] md.placeholder data: AAAA-MM-DD", saida)
        for falso in ("<void>", "<Solicitacao>", "< 5"):
            self.assertNotIn(falso, saida)

    def test_aprovada_com_item_em_aberto(self):
        """spec aprovada com 'Em aberto' diferente de 'nada' é acusada com os itens (CA-32)"""
        codigo, saida = validar("aprovada-com-aberto")
        self.assertEqual(codigo, 1)
        # Os dois itens, escritos de jeitos diferentes (com "bloqueia: design" e em parágrafo solto), sem marcador exato.
        self.assertIn("spec.md:103 [ERRO] spec.aprovada-com-aberto em aberto: spec `aprovada` com item em aberto "
                      "(resolva ou volte a `rascunho`): Notificar também por email? — bloqueia: design", saida)
        self.assertIn("spec.md:105 [ERRO] spec.aprovada-com-aberto em aberto: spec `aprovada` com item em aberto "
                      "(resolva ou volte a `rascunho`): Prazo do TTL: 30 ou 90 dias?", saida)
        # Sem cabeçalho: os achados primeiro e, no fim, o resumo (como na governança).
        self.assertNotIn("problema(s) encontrado(s)", saida)
        self.assertTrue(saida.splitlines()[0].startswith("spec.md:"), saida)
        self.assertEqual(saida.strip().splitlines()[-1], "2 erro(s), 0 aviso(s)")

    def test_secao_ausente_e_vazia(self):
        """Seção obrigatória ausente e seção vazia são erro."""
        codigo, saida = validar("secoes-ausente-e-vazia")
        self.assertEqual(codigo, 1)
        self.assertIn("seção: obrigatória ausente: ## 2. Escopo", saida)
        self.assertIn("seção: vazia: ## 3. Decisões de produto", saida)
        self.assertIn("spec.md:76 [ERRO] spec.subsecao-ausente subseção: obrigatória ausente: ### Em aberto "
                      "(## 3. Decisões de produto)", saida)

    def test_criterios_com_problemas(self):
        """Critério sem Quando, repetido ou fora do formato é erro; lacuna na sequência é aviso."""
        codigo, saida = validar("criterios-com-problemas")
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:107 [ERRO] md.criterio-sem-passo critério: CA-01 sem Quando", saida)
        self.assertIn("critério: CA-02 repetido", saida)
        self.assertIn("critério: ID 'CA-5' fora do formato CA-NN", saida)
        self.assertIn("[AVISO] md.criterio-lacuna critério: sequência com lacuna (CA-03, CA-05)", saida)

    def test_status_com_lista_do_modelo_e_atualizado_sem_motivo(self):
        """Status com a lista do modelo e "Atualizado em" sem motivo são erro."""
        codigo, saida = validar("metadados-com-problemas")
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:7 [ERRO] md.status-opcoes-do-modelo status: lista de opções do modelo; escolha um valor", saida)
        self.assertIn("spec.md:9 [ERRO] md.atualizado-formato atualizado em: use 'AAAA-MM-DD — motivo'", saida)

    def test_design_cita_ca_inexistente_e_link_quebrado(self):
        """design.md citando CA inexistente e link quebrado é erro; link para tasks/ ainda não criada não."""
        codigo, saida = validar("com-design")
        self.assertEqual(codigo, 1)
        self.assertIn("design.md:60 [ERRO] md.criterio-inexistente critério: CA-11 citado mas não existe no spec.md", saida)
        self.assertIn("design.md:60 [ERRO] md.link-quebrado link: destino não existe: ../nao-existe.md", saida)
        self.assertNotIn("tasks/", saida)  # task ainda não criada não é link quebrado
        self.assertNotIn("spec.md:", saida)  # a spec da pasta está limpa


class SubsecoesTest(_ComCopia):
    """Subseções fixas do spec.md e do design.md (CA-31)."""

    def test_copia_limpa_passa(self):
        """A cópia da fixture com spec e design, sem o link quebrado, não tem achado."""
        codigo, saida = self.validar()
        self.assertEqual(codigo, 0, saida)

    def test_subsecao_ausente_ou_vazia(self):
        """subseção obrigatória ausente ou vazia no spec.md ou no design.md é acusada com o nome dela (CA-31)"""
        self.mudar("spec.md", "### Fica fora\n", "")
        self.mudar("spec.md", "### Problema\n\nCliente e prestador só ficam sabendo do que aconteceu com solicitações, orçamentos,\n"
                   "contratos e avaliações abrindo cada tela. Os requisitos pedem aviso em vários pontos, e nada disso existe.\n",
                   "### Problema\n\n")
        self.mudar("design.md", "### Fechadas\n", "")
        self.mudar("design.md", "### Em aberto\n\nnada\n", "### Em aberto\n\n")
        codigo, saida = self.validar()
        self.assertEqual(codigo, 1)
        self.assertIn("spec.md:42 [ERRO] spec.subsecao-ausente subseção: obrigatória ausente: ### Fica fora (## 2. Escopo)", saida)
        self.assertIn("spec.md:23 [ERRO] spec.subsecao-vazia subseção: vazia: ### Problema", saida)
        self.assertIn("design.md:19 [ERRO] spec.subsecao-ausente subseção: obrigatória ausente: ### Fechadas "
                      "(## 1. Decisões técnicas)", saida)
        self.assertIn("design.md:30 [ERRO] spec.subsecao-vazia subseção: vazia: ### Em aberto", saida)
        self.assertIn("4 erro(s), 0 aviso(s)", saida)

    def test_nao_se_aplica_vale(self):
        """subseção que diz só 'não se aplica' não é acusada (CA-31)"""
        self.mudar("spec.md", "- Tempo real (websocket): o front consulta a API.\n", "")
        corpo_fica_fora = (self.pasta / "spec.md").read_text(encoding="utf-8").split("### Fica fora\n\n", 1)[1].split("\n\n## ", 1)[0]
        self.mudar("spec.md", corpo_fica_fora, "não se aplica")
        self.mudar("design.md", "### ADR novo?\n\nsim:", "### ADR novo?\n\nnão se aplica\n\nNada:")
        codigo, saida = self.validar()
        self.assertEqual(codigo, 0, saida)

    def test_eixo_do_impacto_do_design(self):
        """O Impacto do design.md cobra os seis eixos da task ("sim — o quê" ou "não")."""
        self.mudar("design.md", "- **Front:** não — consome as rotas depois, fora desta spec\n", "")
        self.mudar("design.md", "- **Banco:** sim — coleção `notificacoes` com os índices e o TTL acima", "- **Banco:** sim")
        codigo, saida = self.validar()
        self.assertEqual(codigo, 1)
        self.assertIn("spec.impacto-eixo-ausente impacto: eixo 'Front' ausente", saida)
        self.assertIn("spec.impacto-sim-sem-o-que impacto: eixo 'Banco' com 'sim' sem dizer o quê", saida)


class EmAbertoTest(_ComCopia):
    """'Em aberto' do spec.md a partir da aprovação (CA-32)."""

    def test_rascunho_pode_ter_item_em_aberto(self):
        """Em `rascunho`, item em aberto não é erro; em `em andamento`, é."""
        self.mudar("spec.md", "### Em aberto\n\nnada\n", "### Em aberto\n\n- Limite de 50 ou 100?\n")
        self.mudar("spec.md", "- **Status:** `aprovada`", "- **Status:** `rascunho`")
        codigo, saida = self.validar()
        self.assertEqual(codigo, 0, saida)
        self.mudar("spec.md", "- **Status:** `rascunho`", "- **Status:** `em andamento`")
        codigo, saida = self.validar()
        self.assertIn("spec.aprovada-com-aberto em aberto: spec `em andamento` com item em aberto", saida)

    def test_marcador_antigo_fora_do_em_aberto_nao_trava(self):
        """O texto "bloqueia: aprovação" citado fora do 'Em aberto' (numa tabela) não trava a spec aprovada."""
        self.mudar("spec.md", "| Contrato concluído | as duas partes | UC21 |",
                   "| Contrato concluído (bloqueia: aprovação) | as duas partes | UC21 |")
        codigo, saida = self.validar()
        self.assertEqual(codigo, 0, saida)


class ListaDeTasksTest(_ComCopia):
    """Itens da lista de tasks do design.md (CA-33)."""

    def test_item_sem_bloqueada_por_ou_sem_cobre(self):
        """item da lista de tasks sem 'bloqueada por' ou sem 'cobre' é acusado com a linha (CA-33)"""
        self.mudar("design.md", "(tasks/04-eventos-contrato.md) — bloqueada por: 01 — cobre CA-10",
                   "(tasks/04-eventos-contrato.md) — cobre CA-10")
        self.mudar("design.md", "(tasks/08-adr-melhor-esforco.md) — bloqueada por: 01 — cobre: nenhum",
                   "(tasks/08-adr-melhor-esforco.md) — bloqueada por: 01")
        codigo, saida = self.validar()
        self.assertEqual(codigo, 1)
        self.assertIn("design.md:72 [ERRO] spec.task-sem-bloqueada-por lista de tasks: item 04 sem 'bloqueada por'", saida)
        self.assertIn("design.md:76 [ERRO] spec.task-sem-cobre lista de tasks: item 08 sem 'cobre'", saida)
        self.assertNotIn("item 07", saida)  # "cobre: nenhum" vale

    def test_item_riscado_fica_de_fora(self):
        """Task cancelada, riscada na lista sem "bloqueada por" nem "cobre" (exemplo da skill), não é acusada."""
        self.mudar("design.md", "- [ ] [05 — Eventos de extensão de prazo](tasks/05-eventos-extensao.md) — bloqueada por: 01 — cobre CA-10",
                   "- ~~[05 — Eventos de extensão de prazo](tasks/05-eventos-extensao.md)~~ — cancelada em 2026-11-20: fora do MVP")
        codigo, saida = self.validar()
        self.assertEqual(codigo, 0, saida)

    def test_item_que_quebra_linha_e_item_sem_link(self):
        """Item que quebra linha é lido inteiro; item sem link também é item; nota abaixo da lista não conta."""
        self.mudar("design.md", "— bloqueada por: 01 — cobre CA-04 a CA-08",
                   "— bloqueada por: 01 —\n  cobre CA-04 a CA-08")
        self.mudar("design.md", "[06 — Evento de avaliação recebida](tasks/06-evento-avaliacao.md) — bloqueada por: 01",
                   "06 — Evento de avaliação recebida — bloqueada por: 01")
        design = self.pasta / "design.md"
        design.write_text(design.read_text(encoding="utf-8") + "\nNotas para abrir as tasks:\n\n- **04:** sem bloqueada por nem cobre.\n",
                          encoding="utf-8")
        codigo, saida = self.validar()
        self.assertEqual(codigo, 0, saida)
        self.mudar("design.md", "06 — Evento de avaliação recebida — bloqueada por: 01 — cobre CA-10",
                   "06 — Evento de avaliação recebida — bloqueada por: 01")
        codigo, saida = self.validar()
        self.assertIn("spec.task-sem-cobre lista de tasks: item 06 sem 'cobre'", saida)


if __name__ == "__main__":
    unittest.main()
