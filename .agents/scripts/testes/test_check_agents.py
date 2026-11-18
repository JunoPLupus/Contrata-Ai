"""Testes do check_agents: cada checagem com um caso que passa e um que falha, numa árvore de projeto falsa."""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import check_agents as ca  # noqa: E402

TABELA_OK = """# AGENTS

## Skills

| Situação | Skill |
|---|---|
| Fazer specs | [`spec`](.agents/skills/spec/SKILL.md) |

## Outra
"""


class ProjetoFalso(unittest.TestCase):
    """Base: cria uma raiz temporária com .agents/skills/spec/SKILL.md e api/; não tem testes próprios."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.raiz = Path(self._tmp.name)
        self.escrever(".agents/skills/spec/SKILL.md", "# spec\n")
        self.escrever("api/docs/Rotas.md", "# rotas\n")

    def tearDown(self):
        self._tmp.cleanup()

    def escrever(self, relativo: str, texto: str) -> Path:
        caminho = self.raiz / relativo
        caminho.parent.mkdir(parents=True, exist_ok=True)
        caminho.write_text(texto, encoding="utf-8")
        return caminho


class ColetaTest(ProjetoFalso):
    """Quais .md entram na checagem."""

    def test_inclui_agents_md_e_md_de_agents(self):
        """AGENTS.md e um guia de .agents/ entram."""
        self.escrever("AGENTS.md", "x")
        guia = self.escrever(".agents/docs/guides/g.md", "x")
        coletados = ca.collect_md(self.raiz)
        self.assertIn(self.raiz / "AGENTS.md", coletados)
        self.assertIn(guia, coletados)

    def test_exclui_workspace_testes_e_files(self):
        """*-workspace/, scripts/testes/ e evals/files/ ficam de fora (exemplos quebrados de propósito)."""
        fora = [
            self.escrever(".agents/skills/spec-workspace/iteration-1/a.md", "x"),
            self.escrever(".agents/skills/spec/scripts/testes/b/spec.md", "x"),
            self.escrever(".agents/skills/spec/evals/files/c.md", "x"),
        ]
        coletados = ca.collect_md(self.raiz)
        for arquivo in fora:
            self.assertNotIn(arquivo, coletados)


class RefsTest(ProjetoFalso):
    """Checagem 1: links relativos e caminhos citados."""

    def test_link_e_caminho_existentes_passam(self):
        """Link relativo e caminho a partir da raiz que existem não geram achado."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "[spec](../../skills/spec/SKILL.md) e api/docs/Rotas.md\n")
        self.assertEqual(ca.check_refs(arquivo, arquivo.read_text(), self.raiz), [])

    def test_link_quebrado_e_erro(self):
        """Link relativo para arquivo que não existe vira erro na linha do link."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "ok\n[x](../nada.md)\n")
        achados = ca.check_refs(arquivo, arquivo.read_text(), self.raiz)
        self.assertEqual([(f.severidade, f.linha_inicio) for f in achados], [("erro", 2)])
        self.assertIn("nada.md", achados[0].mensagem)

    def test_caminho_da_raiz_inexistente_e_erro(self):
        """Caminho que começa por pasta da raiz (api/) e não existe vira erro."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "veja `api/docs/Sumiu.md`\n")
        achados = ca.check_refs(arquivo, arquivo.read_text(), self.raiz)
        self.assertEqual(len(achados), 1)
        self.assertIn("caminho: não existe: api/docs/Sumiu.md", achados[0].mensagem)

    def test_caminho_relativo_ao_arquivo_inexistente_e_erro(self):
        """'../x.md' é conferido a partir da pasta do arquivo."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "veja ../nada/x.md\n")
        self.assertEqual(len(ca.check_refs(arquivo, arquivo.read_text(), self.raiz)), 1)

    def test_colchete_do_link_nao_entra_no_caminho(self):
        """Em '[../SKILL.md](../SKILL.md)' o '[' não faz o caminho existente parecer quebrado."""
        arquivo = self.escrever(".agents/skills/spec/references/r.md", "[../SKILL.md](../SKILL.md)\n")
        self.assertEqual(ca.check_refs(arquivo, arquivo.read_text(), self.raiz), [])

    def test_caminho_no_texto_do_link_e_conferido(self):
        """'[api/x.md](destino-ok)': o '[' sai e o caminho do texto, se não existe, é erro (link ok à parte)."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "[api/docs/Sumiu.md](../../../api/docs/Rotas.md)\n")
        achados = ca.check_refs(arquivo, arquivo.read_text(), self.raiz)
        self.assertEqual([f.mensagem for f in achados], ["caminho: não existe: api/docs/Sumiu.md"])

    def test_caminho_ambiguo_e_ignorado(self):
        """Caminho genérico que não começa por pasta da raiz nem por './' ('evals/checks.py') não é conferido."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "cada skill tem evals/checks.py\n")
        self.assertEqual(ca.check_refs(arquivo, arquivo.read_text(), self.raiz), [])

    def test_modelo_nao_e_conferido(self):
        """Modelos apontam para onde a cópia vai morar ('../spec.md'): nada é conferido neles."""
        arquivo = self.escrever(".agents/docs/templates/task.md", "[spec](../spec.md) e ../design.md\n")
        self.assertEqual(ca.check_refs(arquivo, arquivo.read_text(), self.raiz), [])

    def test_origem_confere_link_mas_nao_caminho(self):
        """ORIGEM.md cita arquivos do repositório de origem (não conferidos), mas o link quebrado é erro."""
        arquivo = self.escrever(".agents/skills/spec/ORIGEM.md", "api/de/la.md\n[x](nada.md)\n")
        achados = ca.check_refs(arquivo, arquivo.read_text(), self.raiz)
        self.assertEqual([f.linha_inicio for f in achados], [2])


class TabelaSkillsTest(ProjetoFalso):
    """Checagem 2: tabela de skills do AGENTS.md × pastas com SKILL.md."""

    def checar(self, texto: str):
        arquivo = self.escrever("AGENTS.md", texto)
        return ca.check_skill_table(arquivo, texto, self.raiz)

    def test_tabela_completa_passa(self):
        """Toda skill com linha e toda linha apontando para SKILL.md real: sem achado."""
        self.assertEqual(self.checar(TABELA_OK), [])

    def test_skill_sem_linha_e_erro(self):
        """Pasta com SKILL.md que não aparece na tabela vira erro."""
        self.escrever(".agents/skills/task/SKILL.md", "# task\n")
        achados = self.checar(TABELA_OK)
        self.assertEqual(len(achados), 1)
        self.assertIn("task/SKILL.md sem linha", achados[0].mensagem)

    def test_linha_para_skill_inexistente_e_erro(self):
        """Linha da tabela cujo link não leva a um SKILL.md existente vira erro na linha dela."""
        texto = TABELA_OK.replace("| Fazer specs", "| Fechar | [`fim`](.agents/skills/fim/SKILL.md) |\n| Fazer specs")
        achados = self.checar(texto)
        self.assertEqual(len(achados), 1)
        self.assertIn("'fim'", achados[0].mensagem)
        self.assertEqual(achados[0].linha_inicio, 7)

    def test_linha_fora_da_secao_nao_conta(self):
        """Linha de skill fora de '## Skills' não cobre a skill: ela continua sem linha."""
        texto = TABELA_OK.replace("| Fazer specs | [`spec`](.agents/skills/spec/SKILL.md) |\n", "")
        texto += "| x | [`spec`](.agents/skills/spec/SKILL.md) |\n"
        self.assertEqual(len(self.checar(texto)), 1)

    def test_sem_secao_e_erro(self):
        """AGENTS.md sem '## Skills' vira erro."""
        achados = self.checar("# AGENTS\n")
        self.assertIn("'## Skills' não encontrada", achados[0].mensagem)


class ComandosTest(ProjetoFalso):
    """Checagem 3: comandos python3 citados apontam para algo real."""

    def setUp(self):
        super().setUp()
        self.escrever(".agents/skills/spec/scripts/validate_spec.py", "")
        self.escrever(".agents/skills/spec/scripts/testes/test_x.py", "")

    def checar(self, relativo: str, texto: str):
        arquivo = self.escrever(relativo, texto)
        return ca.check_python_commands(arquivo, texto, self.raiz)

    def test_script_existente_passa(self):
        """Script e pasta de discover que existem não geram achado."""
        texto = ("rtk python3 .agents/skills/spec/scripts/validate_spec.py <pasta>\n"
                 "rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes\n")
        self.assertEqual(self.checar(".agents/docs/guides/g.md", texto), [])

    def test_script_inexistente_e_erro(self):
        """Script que não existe vira erro na linha do comando."""
        achados = self.checar(".agents/docs/guides/g.md", "x\nrtk python3 .agents/skills/spec/scripts/sumiu.py\n")
        self.assertEqual([(f.linha_inicio, f.severidade) for f in achados], [(2, "erro")])

    def test_pasta_de_discover_inexistente_e_erro(self):
        """'-m unittest discover -s' com pasta que não existe vira erro."""
        achados = self.checar(".agents/docs/guides/g.md", "python3 -m unittest discover -s .agents/skills/x/testes\n")
        self.assertEqual(len(achados), 1)

    def test_pasta_desta_skill_resolve_na_skill(self):
        """'<pasta-desta-skill>' vale a pasta da skill do arquivo: existe passa, não existe é erro."""
        ok = "python3 <pasta-desta-skill>/scripts/validate_spec.py\n"
        self.assertEqual(self.checar(".agents/skills/spec/SKILL.md", ok), [])
        ruim = "python3 <pasta-desta-skill>/scripts/sumiu.py\n"
        self.assertEqual(len(self.checar(".agents/skills/spec/SKILL.md", ruim)), 1)

    def test_outro_placeholder_e_ignorado(self):
        """Caminho com outro <placeholder> não dá para conferir e não gera achado, nem dentro de uma skill."""
        self.assertEqual(self.checar(".agents/skills/spec/SKILL.md", "python3 <qualquer>/x.py\n"), [])


class SecoesModelosTest(ProjetoFalso):
    """Checagem 4: seções que os validadores esperam existem nos modelos."""

    ESPERADAS = {"task.md": ("1. Vínculo com a spec", "5. Fechamento")}

    def test_modelo_com_as_secoes_passa(self):
        """Título com sufixo ('(task de spec)') casa pelo começo."""
        self.escrever(".agents/docs/templates/task.md",
                      "# Task\n## 1. Vínculo com a spec (task de spec)\nx\n## 5. Fechamento\nx\n")
        self.assertEqual(ca.check_template_sections(self.raiz, self.ESPERADAS), [])

    def test_secao_faltando_e_erro(self):
        """Seção esperada ausente vira erro com o título."""
        self.escrever(".agents/docs/templates/task.md", "# Task\n## 1. Vínculo com a spec\nx\n## 5. Encerramento\n")
        achados = ca.check_template_sections(self.raiz, self.ESPERADAS)
        self.assertEqual(len(achados), 1)
        self.assertIn("'## 5. Fechamento'", achados[0].mensagem)

    def test_secao_so_em_codigo_nao_conta(self):
        """Título dentro de bloco de código (exemplo) não vale como seção."""
        self.escrever(".agents/docs/templates/task.md",
                      "# Task\n## 1. Vínculo com a spec\n```\n## 5. Fechamento\n```\n")
        self.assertEqual(len(ca.check_template_sections(self.raiz, self.ESPERADAS)), 1)

    def test_modelo_inexistente_e_erro(self):
        """Modelo citado pelos validadores e ausente da pasta vira erro."""
        achados = ca.check_template_sections(self.raiz, self.ESPERADAS)
        self.assertIn("modelo: arquivo não existe", achados[0].mensagem)

    def test_le_as_secoes_dos_validadores_reais(self):
        """As seções vêm dos validadores do repositório (fonte única), não de uma lista copiada."""
        esperadas = ca.load_expected_sections(Path(__file__).resolve().parents[3])
        self.assertIn("6. Tasks", esperadas["design.md"])
        self.assertIn("4. Critérios de aceite", esperadas["spec.md"])
        self.assertIn("1. Vínculo com a spec", esperadas["task.md"])
        self.assertIn("5. Fechamento", esperadas["task.md"])


class SkillsCitadasTest(ProjetoFalso):
    """Checagem 5: skill citada que não existe é pendência (aviso), não erro."""

    def checar(self, texto: str):
        arquivo = self.escrever(".agents/docs/guides/g.md", texto)
        return ca.check_cited_skills(arquivo, texto, self.raiz)

    def test_skill_existente_passa(self):
        """Skill com pasta não gera achado, em qualquer forma de citação."""
        self.assertEqual(self.checar("use a skill `spec`; skills de `spec`; .agents/skills/spec/SKILL.md\n"), [])

    def test_skill_inexistente_e_aviso(self):
        """Skill sem pasta vira aviso de pendência, nas três formas."""
        achados = self.checar("skill `encerramento`\nskill de `adr`\n.agents/skills/fluxo/SKILL.md\n")
        self.assertEqual([f.severidade for f in achados], ["aviso"] * 3)
        self.assertEqual([f.linha_inicio for f in achados], [1, 2, 3])
        self.assertIn("'encerramento'", achados[0].mensagem)

    def test_palavra_comum_apos_skill_nao_conta(self):
        """'skill nova' (sem crases) não é citação de skill."""
        self.assertEqual(self.checar("(skill nova) ou skill existente\n"), [])


class ExecucaoTest(ProjetoFalso):
    """run, exit_code e formato da saída."""

    def test_so_avisos_sai_com_zero(self):
        """Pendências (avisos) não falham a checagem."""
        self.escrever("AGENTS.md", TABELA_OK + "\nskill `encerramento`\n")
        achados = ca.run(self.raiz, esperadas={})
        self.assertEqual([f.severidade for f in achados], ["aviso"])
        self.assertEqual(ca.exit_code(achados), 0)

    def test_erro_sai_com_um(self):
        """Qualquer erro (aqui, link quebrado num guia) faz o exit ser 1."""
        self.escrever("AGENTS.md", TABELA_OK)
        self.escrever(".agents/docs/guides/g.md", "[x](nada.md)\n")
        achados = ca.run(self.raiz, esperadas={})
        self.assertEqual(ca.exit_code(achados), 1)

    def test_formato_com_caminho_relativo(self):
        """Saída 'arquivo:linha [SEVERIDADE] mensagem', com o caminho relativo à raiz."""
        achado = ca.erro(self.raiz / ".agents/skills/spec/SKILL.md", 3, "msg")
        self.assertEqual(ca.format_finding(achado, self.raiz), ".agents/skills/spec/SKILL.md:3 [ERRO] msg")


if __name__ == "__main__":
    unittest.main()
