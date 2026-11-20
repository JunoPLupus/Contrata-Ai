"""Testes da governança: cada checagem com um caso que passa e um que falha, numa árvore de projeto falsa.

Rodar a partir da raiz do projeto:  rtk python3 -m unittest discover -s .agents/skills/governanca/scripts/testes
"""
import contextlib
import importlib.util
import io
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path
from unittest import mock

_SCRIPTS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_SCRIPTS.parents[2] / "scripts" / "lib"))
sys.path.insert(0, str(_SCRIPTS))
sys.path.insert(0, str(_SCRIPTS / "checagens"))
import coleta  # noqa: E402
import governanca  # noqa: E402
import instrucoes  # noqa: E402
import referencias  # noqa: E402
import registros  # noqa: E402
import skills  # noqa: E402
from md_checks import aviso, check_acceptance_criteria, erro  # noqa: E402

RAIZ_REAL = Path(__file__).resolve().parents[5]

TABELA_OK = """# AGENTS

## Skills

| Situação | Skill |
|---|---|
| Fazer specs | [`spec`](.agents/skills/spec/SKILL.md) |

## Outra
"""


def VALIDA(pasta):
    """Validador de cabeçalho falso que aceita tudo (os testes de run não tratam de cabeçalho)."""
    return True, "ok"


SEM_VALIDADORES = (lambda *a, **k: [], lambda *a, **k: [])  # validadores de task e spec que não acham nada


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
        coletados = coleta.collect_md(self.raiz)
        self.assertIn(self.raiz / "AGENTS.md", coletados)
        self.assertIn(guia, coletados)

    def test_exclui_workspace_testes_e_files(self):
        """*-workspace/, scripts/testes/ e evals/files/ ficam de fora (exemplos quebrados de propósito)."""
        fora = [
            self.escrever(".agents/skills/spec-workspace/iteration-1/a.md", "x"),
            self.escrever(".agents/skills/spec/scripts/testes/b/spec.md", "x"),
            self.escrever(".agents/skills/spec/evals/files/c.md", "x"),
        ]
        coletados = coleta.collect_md(self.raiz)
        for arquivo in fora:
            self.assertNotIn(arquivo, coletados)


class RefsTest(ProjetoFalso):
    """Checagem 1: links relativos e caminhos citados."""

    def test_link_e_caminho_existentes_passam(self):
        """Link relativo e caminho a partir da raiz que existem não geram achado."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "[spec](../../skills/spec/SKILL.md) e api/docs/Rotas.md\n")
        self.assertEqual(referencias.check_refs(arquivo, arquivo.read_text(), self.raiz), [])

    def test_link_quebrado_e_erro(self):
        """Link relativo para arquivo que não existe vira erro na linha do link."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "ok\n[x](../nada.md)\n")
        achados = referencias.check_refs(arquivo, arquivo.read_text(), self.raiz)
        self.assertEqual([(f.severidade, f.linha_inicio) for f in achados], [("erro", 2)])
        self.assertIn("nada.md", achados[0].mensagem)

    def test_caminho_da_raiz_inexistente_e_erro(self):
        """Caminho que começa por pasta da raiz (api/) e não existe vira erro."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "veja `api/docs/Sumiu.md`\n")
        achados = referencias.check_refs(arquivo, arquivo.read_text(), self.raiz)
        self.assertEqual(len(achados), 1)
        self.assertIn("caminho: não existe: api/docs/Sumiu.md", achados[0].mensagem)

    def test_caminho_relativo_ao_arquivo_inexistente_e_erro(self):
        """'../x.md' é conferido a partir da pasta do arquivo."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "veja ../nada/x.md\n")
        self.assertEqual(len(referencias.check_refs(arquivo, arquivo.read_text(), self.raiz)), 1)

    def test_colchete_do_link_nao_entra_no_caminho(self):
        """Em '[../SKILL.md](../SKILL.md)' o '[' não faz o caminho existente parecer quebrado."""
        arquivo = self.escrever(".agents/skills/spec/references/r.md", "[../SKILL.md](../SKILL.md)\n")
        self.assertEqual(referencias.check_refs(arquivo, arquivo.read_text(), self.raiz), [])

    def test_caminho_no_texto_do_link_e_conferido(self):
        """'[api/x.md](destino-ok)': o '[' sai e o caminho do texto, se não existe, é erro (link ok à parte)."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "[api/docs/Sumiu.md](../../../api/docs/Rotas.md)\n")
        achados = referencias.check_refs(arquivo, arquivo.read_text(), self.raiz)
        self.assertEqual([f.mensagem for f in achados], ["caminho: não existe: api/docs/Sumiu.md"])

    def test_caminho_ambiguo_e_ignorado(self):
        """Caminho genérico que não começa por pasta da raiz nem por './' ('evals/checks.py') não é conferido."""
        arquivo = self.escrever(".agents/docs/guides/g.md", "cada skill tem evals/checks.py\n")
        self.assertEqual(referencias.check_refs(arquivo, arquivo.read_text(), self.raiz), [])

    def test_modelo_nao_e_conferido(self):
        """Modelos apontam para onde a cópia vai morar ('../spec.md'): nada é conferido neles."""
        arquivo = self.escrever(".agents/docs/templates/task.md", "[spec](../spec.md) e ../design.md\n")
        self.assertEqual(referencias.check_refs(arquivo, arquivo.read_text(), self.raiz), [])

    def test_origem_confere_link_mas_nao_caminho(self):
        """ORIGEM.md cita arquivos do repositório de origem (não conferidos), mas o link quebrado é erro."""
        arquivo = self.escrever(".agents/skills/spec/ORIGEM.md", "api/de/la.md\n[x](nada.md)\n")
        achados = referencias.check_refs(arquivo, arquivo.read_text(), self.raiz)
        self.assertEqual([f.linha_inicio for f in achados], [2])


class TabelaSkillsTest(ProjetoFalso):
    """Checagem 2: tabela de skills do AGENTS.md × pastas com SKILL.md."""

    def checar(self, texto: str):
        arquivo = self.escrever("AGENTS.md", texto)
        return skills.check_skill_table(arquivo, texto, self.raiz)

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
        return referencias.check_python_commands(arquivo, texto, self.raiz)

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
        self.assertEqual(skills.check_template_sections(self.raiz, self.ESPERADAS), [])

    def test_secao_faltando_e_erro(self):
        """Seção esperada ausente vira erro com o título."""
        self.escrever(".agents/docs/templates/task.md", "# Task\n## 1. Vínculo com a spec\nx\n## 5. Encerramento\n")
        achados = skills.check_template_sections(self.raiz, self.ESPERADAS)
        self.assertEqual(len(achados), 1)
        self.assertIn("'## 5. Fechamento'", achados[0].mensagem)

    def test_secao_so_em_codigo_nao_conta(self):
        """Título dentro de bloco de código (exemplo) não vale como seção."""
        self.escrever(".agents/docs/templates/task.md",
                      "# Task\n## 1. Vínculo com a spec\n```\n## 5. Fechamento\n```\n")
        self.assertEqual(len(skills.check_template_sections(self.raiz, self.ESPERADAS)), 1)

    def test_modelo_inexistente_e_erro(self):
        """Modelo citado pelos validadores e ausente da pasta vira erro."""
        achados = skills.check_template_sections(self.raiz, self.ESPERADAS)
        self.assertIn("modelo: arquivo não existe", achados[0].mensagem)

    def test_le_as_secoes_dos_validadores_reais(self):
        """As seções vêm dos validadores do repositório (fonte única), não de uma lista copiada."""
        esperadas = skills.load_expected_sections(RAIZ_REAL)
        self.assertIn("6. Tasks", esperadas["design.md"])
        self.assertIn("4. Critérios de aceite", esperadas["spec.md"])
        self.assertIn("1. Vínculo com a spec", esperadas["task.md"])
        self.assertIn("5. Fechamento", esperadas["task.md"])


class SkillsCitadasTest(ProjetoFalso):
    """Checagem 5: skill citada que não existe é pendência (aviso), não erro."""

    def checar(self, texto: str):
        arquivo = self.escrever(".agents/docs/guides/g.md", texto)
        return referencias.check_cited_skills(arquivo, texto, self.raiz)

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


class CabecalhoSkillsTest(ProjetoFalso):
    """Checagem 6: cabeçalho YAML das skills, pelo quick_validate da oficina."""

    def test_cabecalho_valido_passa(self):
        """Validador que aceita a skill: sem achado."""
        self.assertEqual(skills.check_skill_headers(self.raiz, VALIDA), [])

    def test_cabecalho_invalido_e_erro_na_skill_certa(self):
        """Só a skill recusada vira erro, na linha 1 do SKILL.md dela, com a mensagem do validador."""
        self.escrever(".agents/skills/task/SKILL.md", "x")
        recusa_task = lambda pasta: (pasta.name != "task", "YAML inválido")
        achados = skills.check_skill_headers(self.raiz, recusa_task)
        self.assertEqual([(f.arquivo.parent.name, f.linha_inicio, f.severidade) for f in achados], [("task", 1, "erro")])
        self.assertIn("cabeçalho: YAML inválido", achados[0].mensagem)

    def test_sem_pyyaml_e_um_aviso(self):
        """Sem validador (falta pyyaml): um aviso só, não erro nem um por skill."""
        self.escrever(".agents/skills/task/SKILL.md", "x")
        achados = skills.check_skill_headers(self.raiz, None)
        self.assertEqual([f.severidade for f in achados], ["aviso"])
        self.assertIn("pyyaml", achados[0].mensagem)

    def test_sem_pyyaml_o_carregamento_devolve_none(self):
        """Se o import do yaml falha, load_skill_validator devolve None em vez de quebrar o script."""
        raiz_real = RAIZ_REAL
        original = sys.modules.get("yaml")
        sys.modules["yaml"] = None  # faz o 'import yaml' falhar
        try:
            self.assertIsNone(skills.load_skill_validator(raiz_real))
        finally:
            if original is None:
                del sys.modules["yaml"]
            else:
                sys.modules["yaml"] = original

    @unittest.skipUnless(importlib.util.find_spec("yaml"), "pyyaml não instalado")
    def test_validador_real_pega_dois_pontos_na_description(self):
        """Com o quick_validate real: ': ' numa description sem aspas quebra o YAML (caso da rodada 3)."""
        validar = skills.load_skill_validator(RAIZ_REAL)
        self.escrever(".agents/skills/spec/SKILL.md", "---\nname: spec\ndescription: Faz specs.\n---\n# Spec\n")
        self.escrever(".agents/skills/task/SKILL.md", "---\nname: task\ndescription: Fecha (skill x, futura: ainda não existe).\n---\n")
        achados = skills.check_skill_headers(self.raiz, validar)
        self.assertEqual([f.arquivo.parent.name for f in achados], ["task"])
        self.assertIn("Invalid YAML", achados[0].mensagem)


class ExecucaoTest(ProjetoFalso):
    """run, exit_code e formato da saída."""

    def test_so_avisos_sai_com_zero(self):
        """Pendências (avisos) não falham a checagem."""
        self.escrever("AGENTS.md", TABELA_OK + "\nskill `encerramento`\n")
        achados = governanca.run(self.raiz, esperadas={}, validar=VALIDA, validadores=SEM_VALIDADORES)
        self.assertEqual([f.severidade for f in achados], ["aviso"])
        self.assertEqual(governanca.exit_code(achados), 0)

    def test_erro_sai_com_um(self):
        """Qualquer erro (aqui, link quebrado num guia) faz o exit ser 1."""
        self.escrever("AGENTS.md", TABELA_OK)
        self.escrever(".agents/docs/guides/g.md", "[x](nada.md)\n")
        achados = governanca.run(self.raiz, esperadas={}, validar=VALIDA, validadores=SEM_VALIDADORES)
        self.assertEqual(governanca.exit_code(achados), 1)

    def test_cabecalho_invalido_entra_no_run(self):
        """run aplica o validador de cabeçalho: skill recusada faz o exit ser 1."""
        self.escrever("AGENTS.md", TABELA_OK)
        achados = governanca.run(self.raiz, esperadas={}, validar=lambda pasta: (False, "quebrado"), validadores=SEM_VALIDADORES)
        self.assertEqual(governanca.exit_code(achados), 1)

    def test_formato_com_caminho_relativo(self):
        """Saída 'arquivo:linha [SEVERIDADE] código mensagem', com o caminho relativo à raiz."""
        achado = erro(self.raiz / ".agents/skills/spec/SKILL.md", 3, "md.x", "msg")
        self.assertEqual(governanca.format_finding(achado, self.raiz), ".agents/skills/spec/SKILL.md:3 [ERRO] md.x msg")

    def test_saida_ordenada_por_arquivo_com_linha_em_branco(self):
        """Saída ordenada por arquivo e linha (não erros antes de avisos), com linha em branco entre arquivos."""
        a, b = self.raiz / "a.md", self.raiz / "b.md"
        achados = [erro(b, 2, "md.x", "dois"), aviso(a, 9, "md.y", "nove"), erro(a, 1, "md.x", "um")]
        self.assertEqual(governanca.format_report(achados, self.raiz), (
            "a.md:1 [ERRO] md.x um\n"
            "a.md:9 [AVISO] md.y nove\n"
            "\n"
            "b.md:2 [ERRO] md.x dois\n"
            "\n"
            "2 erro(s), 1 aviso(s)"
        ))

    def test_saida_sem_achados_so_tem_o_resumo(self):
        """Sem achados, só a linha do resumo."""
        self.assertEqual(governanca.format_report([], self.raiz), "0 erro(s), 0 aviso(s)")

TASK_VIVA = """# Task: x

- **Status:** `{status}`
- **Branch:** {branch}

veja `.agents/scripts/sumiu.py` e a skill `fantasma`
"""


def task(status: str, branch: str = "`docs/juno/x`") -> str:
    return TASK_VIVA.format(status=status, branch=branch)


class RegistrosFechadosTest(ProjetoFalso):
    """Tasks e specs saem das checagens de instrução: o conteúdo é dos validadores (vivas) ou de ninguém."""

    def rodar(self):
        self.escrever("AGENTS.md", TABELA_OK)
        return governanca.run(self.raiz, esperadas={}, validar=VALIDA, validadores=SEM_VALIDADORES)

    def test_task_concluida_que_cita_arquivo_que_nao_existe_mais(self):
        """task concluída em done/ que cita arquivo que não existe mais não é acusada (CA-04)"""
        self.escrever(".agents/docs/tasks/done/2026-11-18-x.md", task("concluída"))
        self.assertEqual(self.rodar(), [])

    def test_task_de_spec_e_spec_fora_das_instrucoes(self):
        """Task e spec, vivas ou não, não passam pelas checagens de instrução (links, caminhos, skills citadas)."""
        self.escrever(".agents/docs/tasks/2026-11-18-x.md", task("aberta"))
        self.escrever(".agents/docs/specs/2026-11-18-s/spec.md", "- **Status:** `aprovada`\n\n[t](tasks/01-x.md)\n")
        self.escrever(".agents/docs/specs/2026-11-18-s/design.md", "[t](tasks/01-x.md)\n")
        coletados = coleta.instructions(self.raiz)
        self.assertFalse([c for c in coletados if "docs/tasks" in str(c) or "docs/specs" in str(c)])
        self.assertEqual(self.rodar(), [])

    def test_guia_continua_conferido(self):
        """Fora de tasks e specs, a mesma citação continua acusada (a exclusão não vaza para as instruções)."""
        self.escrever(".agents/docs/guides/g.md", task("concluída"))
        mensagens = [f.mensagem for f in self.rodar()]
        self.assertIn("caminho: não existe: .agents/scripts/sumiu.py", mensagens)


class LugarStatusTest(ProjetoFalso):
    """Status × pasta e task em andamento sem branch."""

    def achados(self):
        return registros.check_place_status(self.raiz)

    def test_lugares_certos_passam(self):
        """Fechadas em done/, vivas fora, spec concluída em specs/done/: sem achado."""
        self.escrever(".agents/docs/tasks/done/a.md", task("concluída"))
        self.escrever(".agents/docs/tasks/done/b.md", task("cancelada"))
        self.escrever(".agents/docs/tasks/c.md", task("aberta"))
        self.escrever(".agents/docs/tasks/d.md", task("em andamento"))
        self.escrever(".agents/docs/specs/done/2026-11-01-s/spec.md", "- **Status:** `concluída`\n")
        self.escrever(".agents/docs/specs/2026-11-02-t/spec.md", "- **Status:** `em andamento`\n")
        self.escrever(".agents/docs/specs/2026-11-02-t/tasks/01-x.md", task("em andamento"))
        self.assertEqual(self.achados(), [])

    def test_status_que_nao_bate_com_a_pasta(self):
        """status que não bate com a pasta é acusado com o arquivo (CA-23)"""
        casos = {
            ".agents/docs/tasks/done/a.md": (task("em andamento"), "task em done/ com status `em andamento`"),
            ".agents/docs/tasks/b.md": (task("concluída"), "task avulsa `concluída` fora de done/"),
            ".agents/docs/tasks/c.md": (task("cancelada"), "task avulsa `cancelada` fora de done/"),
            ".agents/docs/specs/done/2026-11-01-s/spec.md": ("- **Status:** `aprovada`\n",
                                                             "spec em specs/done/ com status `aprovada`"),
            ".agents/docs/tasks/d.md": (task("em andamento", "<nome da branch>"), "task `em andamento` sem branch"),
            ".agents/docs/specs/2026-11-02-t/tasks/01-x.md": (task("em andamento", "(a criar)"),
                                                              "task `em andamento` sem branch"),
        }
        self.escrever(".agents/docs/specs/2026-11-02-t/spec.md", "- **Status:** `em andamento`\n")
        for relativo, (texto, _) in casos.items():
            self.escrever(relativo, texto)
        achados = {f.arquivo.relative_to(self.raiz).as_posix(): f for f in self.achados()}
        self.assertEqual(set(achados), set(casos))
        for relativo, (_, esperado) in casos.items():
            with self.subTest(arquivo=relativo):
                self.assertIn(esperado, achados[relativo].mensagem)
                self.assertEqual(achados[relativo].severidade, "erro")

    def test_spec_concluida_ainda_na_pasta_de_abertas_nao_e_acusada(self):
        """Spec concluída fora de specs/done/ não é caso do CA-23 (o encerramento da spec vem depois)."""
        self.escrever(".agents/docs/specs/2026-11-02-t/spec.md", "- **Status:** `concluída`\n")
        self.assertEqual(self.achados(), [])


class DuplicatasTest(ProjetoFalso):
    """A mesma task ou spec entre as abertas e entre as concluídas."""

    def test_mesmo_arquivo_em_tasks_e_done(self):
        """o mesmo arquivo de task em tasks/ e em done/ é acusado com os dois caminhos (CA-24)"""
        self.escrever(".agents/docs/tasks/2026-11-18-x.md", task("aberta"))
        self.escrever(".agents/docs/tasks/done/2026-11-18-x.md", task("aberta"))
        achados = registros.check_duplicates(self.raiz)
        self.assertEqual(len(achados), 1)
        self.assertIn(".agents/docs/tasks/2026-11-18-x.md", achados[0].mensagem)
        self.assertIn(".agents/docs/tasks/done/2026-11-18-x.md", achados[0].mensagem)

    def test_mesma_spec_em_specs_e_done(self):
        """A mesma pasta de spec em specs/ e em specs/done/ é acusada com as duas pastas."""
        self.escrever(".agents/docs/specs/2026-11-01-s/spec.md", "- **Status:** `aprovada`\n")
        self.escrever(".agents/docs/specs/done/2026-11-01-s/spec.md", "- **Status:** `concluída`\n")
        achados = registros.check_duplicates(self.raiz)
        self.assertEqual(len(achados), 1)
        self.assertIn("specs/2026-11-01-s/", achados[0].mensagem)
        self.assertIn("specs/done/2026-11-01-s/", achados[0].mensagem)

    def test_nomes_diferentes_passam(self):
        """Nomes diferentes entre abertas e concluídas não são duplicata."""
        self.escrever(".agents/docs/tasks/2026-11-18-x.md", task("aberta"))
        self.escrever(".agents/docs/tasks/done/2026-11-18-y.md", task("concluída"))
        self.assertEqual(registros.check_duplicates(self.raiz), [])


class ValidadoresDasVivasTest(ProjetoFalso):
    """As vivas passam pelo validador da skill dona; a governança só junta."""

    def test_mesma_mensagem_do_validador(self):
        """erro de conteúdo de task viva sai com a mensagem do validador (CA-25)"""
        validar_task, validar_spec = registros.load_validators(RAIZ_REAL)
        viva = self.escrever(".agents/docs/tasks/2026-11-18-x.md", task("aberta"))
        self.escrever(".agents/docs/tasks/done/2026-11-17-y.md", task("concluída"))
        self.escrever(".agents/docs/specs/2026-11-01-s/spec.md", "- **Status:** `aprovada`\n<motivo>\n")
        pela_governanca = registros.check_live_records(self.raiz, validar_task, validar_spec)
        direto = [*validar_spec(self.raiz / ".agents/docs/specs/2026-11-01-s", raiz=self.raiz),
                  *validar_task(viva, raiz=self.raiz)]
        self.assertTrue(direto)
        self.assertEqual([str(f) for f in pela_governanca], [str(f) for f in direto])

    def test_so_as_vivas_sao_validadas(self):
        """O validador é chamado para cada task e spec viva, e para nenhuma fechada."""
        chamados = []
        validar_task = lambda arquivo, raiz: chamados.append(arquivo.name) or [erro(arquivo, 1, "task.nova", "regra nova")]
        validar_spec = lambda pasta, raiz: chamados.append(pasta.name) or []
        for status in ("aberta", "bloqueada", "em andamento"):
            self.escrever(f".agents/docs/tasks/{status.replace(' ', '-')}.md", task(status))
        self.escrever(".agents/docs/tasks/done/fechada.md", task("concluída"))
        self.escrever(".agents/docs/specs/2026-11-01-viva/spec.md", "- **Status:** `rascunho`\n")
        self.escrever(".agents/docs/specs/2026-11-01-viva/tasks/01-x.md", task("aberta"))
        self.escrever(".agents/docs/specs/2026-11-01-viva/tasks/02-y.md", task("concluída"))
        self.escrever(".agents/docs/specs/done/2026-10-01-velha/spec.md", "- **Status:** `concluída`\n")
        achados = registros.check_live_records(self.raiz, validar_task, validar_spec)
        self.assertEqual(sorted(chamados), ["01-x.md", "2026-11-01-viva", "aberta.md", "bloqueada.md", "em-andamento.md"])
        self.assertEqual({f.mensagem for f in achados}, {"regra nova"})


class RtkTest(unittest.TestCase):
    """Comando sem rtk em bloco bash/sh."""

    ARQUIVO = Path("SKILL.md")

    def achados(self, texto: str):
        return instrucoes.check_rtk(self.ARQUIVO, texto)

    def test_comando_sem_rtk(self):
        """comando sem rtk em bloco bash é acusado com a linha (CA-26)"""
        texto = "x\n\n```bash\nrtk python3 a.py\npython3 b.py\n```\n"
        achados = self.achados(texto)
        self.assertEqual([(f.linha_inicio, f.severidade) for f in achados], [(5, "erro")])
        self.assertIn("python3 b.py", achados[0].mensagem)

    def test_bloco_indentado_e_sh(self):
        """Bloco dentro de lista (indentado) e bloco sh também são conferidos."""
        texto = "1. passo:\n   ```sh\n   npm test\n   ```\n"
        self.assertEqual([f.linha_inicio for f in self.achados(texto)], [3])

    def test_excecao_marcada_no_bloco(self):
        """Bloco com '# sem rtk: motivo' é a exceção documentada (processo longo ou interativo)."""
        texto = "```bash\n# sem rtk: servidor, fica rodando\nnohup python3 x.py &\n```\n"
        self.assertEqual(self.achados(texto), [])

    def test_marca_sem_motivo_nao_vale(self):
        """'# sem rtk:' sem motivo não libera o bloco."""
        texto = "```bash\n# sem rtk:\nnpm run dev\n```\n"
        self.assertEqual(len(self.achados(texto)), 1)

    def test_comentario_vazio_e_continuacao_nao_sao_comandos(self):
        """Comentário, linha vazia e continuação depois de '\\' não são acusados."""
        texto = "```bash\n# comentário\n\nrtk python3 x.py \\\n  --flag \\\n  arg\n```\n"
        self.assertEqual(self.achados(texto), [])

    def test_fora_de_bloco_bash_nao_conta(self):
        """Código em linha e bloco sem linguagem (exemplo de texto) ficam de fora."""
        texto = "rode `npm test`\n\n```\nnpm test\n```\n\n```text\ngit log\n```\n"
        self.assertEqual(self.achados(texto), [])


class PlaceholderCanonicoTest(ProjetoFalso):
    """Placeholder esquecido nas instruções que o agente segue."""

    def test_placeholder_em_guia_sim_em_modelo_e_codigo_nao(self):
        """placeholder esquecido numa skill ou guia é acusado; no modelo e em código não (CA-27)"""
        self.escrever("AGENTS.md", TABELA_OK)
        self.escrever(".agents/docs/guides/g.md", "ok\npreencha <título> e `<em código>`\n")
        self.escrever(".agents/skills/spec/SKILL.md", "# spec\nAtualizado em AAAA-MM-DD\n")
        self.escrever(".agents/docs/templates/task.md", "# Task: <título>\n<!-- comentário -->\n")
        achados = governanca.run(self.raiz, esperadas={}, validar=VALIDA, validadores=SEM_VALIDADORES)
        resumo = sorted((f.arquivo.relative_to(self.raiz).as_posix(), f.linha_inicio, f.mensagem) for f in achados)
        self.assertEqual(resumo, [
            (".agents/docs/guides/g.md", 2, "placeholder: <título>"),
            (".agents/skills/spec/SKILL.md", 2, "data: AAAA-MM-DD"),
        ])

    def test_canonicos_sao_instrucoes_sem_modelos(self):
        """Documentos canônicos: AGENTS.md, README, guias e .md das skills; modelos, tasks e specs fora."""
        dentro = [self.escrever(p, "x") for p in ("AGENTS.md", ".agents/README.md", ".agents/docs/guides/g.md",
                                                  ".agents/skills/spec/references/r.md")]
        fora = [self.escrever(p, "x") for p in (".agents/docs/templates/task.md", ".agents/docs/tasks/t.md",
                                                ".agents/docs/specs/2026-11-01-s/spec.md")]
        canonicos = coleta.canonical_docs(self.raiz)
        for arquivo in dentro:
            self.assertIn(arquivo, canonicos)
        for arquivo in fora:
            self.assertNotIn(arquivo, canonicos)


class CodigoDaRegraTest(unittest.TestCase):
    """Todo achado tem o código da regra; a mensagem não cita número de linha."""

    def test_erro_sem_codigo_e_recusado(self):
        """erro() e aviso() sem o código não montam o achado."""
        with self.assertRaises(TypeError):
            erro(Path("a.md"), 1, "só a mensagem")
        with self.assertRaises(TypeError):
            aviso(Path("a.md"), 1, "só a mensagem")

    def test_codigo_fora_do_formato_e_recusado(self):
        """O código segue '<dono>.<regra>', em minúsculas com hífen."""
        for codigo in ("sem-dono", "Task.secao", "task.Secao_Vazia", "task.", "md.x y"):
            with self.subTest(codigo=codigo), self.assertRaises(ValueError):
                erro(Path("a.md"), 1, codigo, "msg")
        self.assertEqual(erro(Path("a.md"), 1, "task.subsecao-vazia", "msg").codigo, "task.subsecao-vazia")

    def test_ca_repetido_nao_cita_a_linha(self):
        """A mensagem do CA repetido não cita a linha do primeiro (mudaria a cada edição acima dele)."""
        texto = "### CA-01: a\n- **Dado** x\n- **Quando** y\n- **Então** z\n\n" * 2
        repetidos = [f for f in check_acceptance_criteria(Path("spec.md"), texto) if f.codigo == "md.criterio-repetido"]
        self.assertEqual([(f.linha_inicio, f.mensagem) for f in repetidos], [(6, "critério: CA-01 repetido")])


class BaseDeAchadosTest(ProjetoFalso):
    """Base salva antes da mudança e comparação depois: novos, antigos e corrigidos."""

    def achado(self, nome: str, linha: int, codigo: str = "md.link-quebrado", mensagem: str = "link: x",
               severidade=erro):
        return severidade(self.raiz / nome, linha, codigo, mensagem)

    def base(self, *achados) -> Counter:
        return governanca.read_base(governanca.format_base(list(achados), self.raiz))

    def test_base_sem_numero_de_linha(self):
        """A base tem uma linha por achado, com caminho relativo e sem número de linha; repetidos repetem."""
        texto = governanca.format_base([
            self.achado("b.md", 7), self.achado("a.md", 3, "md.y", "outra", aviso), self.achado("b.md", 9),
        ], self.raiz)
        self.assertEqual(texto, (
            "a.md [AVISO] md.y outra\n"
            "b.md [ERRO] md.link-quebrado link: x\n"
            "b.md [ERRO] md.link-quebrado link: x\n"
        ))

    def test_linha_fora_do_formato_e_recusada_com_o_numero(self):
        """Base editada à mão fora do formato é recusada, com o número da linha (não compara errado)."""
        with self.assertRaisesRegex(ValueError, "linha 2 da base"):
            governanca.read_base("a.md [ERRO] md.x msg\na.md:3 erro sem colchetes\n")

    def test_tres_grupos_e_so_os_novos_falham(self):
        """a comparação separa erros novos, antigos e corrigidos, e só os novos falham (CA-28)"""
        base = self.base(self.achado("a.md", 3), self.achado("b.md", 5))
        antigo_em_outra_linha, novo = self.achado("a.md", 40), self.achado("c.md", 1)
        comparacao = governanca.compare(base, [novo, antigo_em_outra_linha], self.raiz)
        self.assertEqual(comparacao.erros_novos, [novo])
        self.assertEqual(comparacao.antigos, [antigo_em_outra_linha])
        self.assertEqual(comparacao.corrigidos, [("b.md", "erro", "md.link-quebrado", "link: x")])
        self.assertEqual(governanca.comparison_exit_code(comparacao), 1)

        so_antigos = governanca.compare(base, [antigo_em_outra_linha], self.raiz)
        self.assertEqual(so_antigos.novos, [])
        self.assertEqual(governanca.comparison_exit_code(so_antigos), 0)

    def test_codigo_faz_parte_da_identidade(self):
        """Mesma mensagem com outro código é outro achado: um novo e um corrigido."""
        base = self.base(self.achado("a.md", 3, "md.x"))
        comparacao = governanca.compare(base, [self.achado("a.md", 3, "md.y")], self.raiz)
        self.assertEqual(len(comparacao.erros_novos), 1)
        self.assertEqual(len(comparacao.corrigidos), 1)

    def test_repetidos_contam_pela_quantidade(self):
        """Dois achados iguais na base e um agora: um antigo e um corrigido; três agora: um novo."""
        base = self.base(self.achado("a.md", 3), self.achado("a.md", 8))
        um = governanca.compare(base, [self.achado("a.md", 3)], self.raiz)
        self.assertEqual((len(um.antigos), len(um.corrigidos), len(um.novos)), (1, 1, 0))
        tres = governanca.compare(base, [self.achado("a.md", n) for n in (3, 8, 12)], self.raiz)
        self.assertEqual((len(tres.antigos), len(tres.corrigidos), [f.linha_inicio for f in tres.novos]), (2, 0, [12]))

    def test_aviso_novo_e_informado_e_nao_falha(self):
        """Aviso novo vai para o grupo próprio e não faz a comparação falhar."""
        comparacao = governanca.compare(Counter(), [self.achado("a.md", 1, "md.y", "pendência", aviso)], self.raiz)
        self.assertEqual(len(comparacao.avisos_novos), 1)
        self.assertEqual(comparacao.erros_novos, [])
        self.assertEqual(governanca.comparison_exit_code(comparacao), 0)

    def test_formato_da_comparacao(self):
        """Só os grupos com achados, na ordem novos → avisos novos → já existiam → corrigidos, e o resumo."""
        base = self.base(self.achado("a.md", 3), self.achado("b.md", 5))
        comparacao = governanca.compare(base, [self.achado("a.md", 4), self.achado("c.md", 1)], self.raiz)
        self.assertEqual(governanca.format_comparison(comparacao, self.raiz), (
            "Erros novos (bloqueiam):\n"
            "c.md:1 [ERRO] md.link-quebrado link: x\n"
            "\n"
            "Já existiam antes da mudança (só informados):\n"
            "a.md:4 [ERRO] md.link-quebrado link: x\n"
            "\n"
            "Corrigidos:\n"
            "b.md [ERRO] md.link-quebrado link: x\n"
            "\n"
            "1 erro(s) novo(s), 0 aviso(s) novo(s), 1 já existiam, 1 corrigido(s)"
        ))


class BaseEmArquivoTest(ProjetoFalso):
    """--salvar-base e --comparar de ponta a ponta, num projeto falso (o caminho da oficina de skills)."""

    def setUp(self):
        super().setUp()
        self.escrever("AGENTS.md", TABELA_OK)
        rodar = governanca.run
        for alvo, valor in (("get_project_root", lambda: self.raiz),
                            ("run", lambda raiz: rodar(raiz, esperadas={}, validar=VALIDA, validadores=SEM_VALIDADORES))):
            patcher = mock.patch.object(governanca, alvo, valor)
            patcher.start()
            self.addCleanup(patcher.stop)
        self.arquivo_base = self.raiz / ".agents/skills/spec-workspace/base-de-achados.txt"

    def main(self, *argv) -> tuple[int, str]:
        saida = io.StringIO()
        with contextlib.redirect_stdout(saida):
            codigo = governanca.main(list(argv))
        return codigo, saida.getvalue()

    def test_erro_antigo_corrigido_aparece_entre_os_corrigidos(self):
        """base salva em arquivo: erro antigo corrigido aparece entre os corrigidos e não falha (CA-29)"""
        guia = self.escrever(".agents/docs/guides/g.md", "[x](nada.md)\n")
        codigo, saida = self.main("--salvar-base", str(self.arquivo_base))
        self.assertEqual(codigo, 0)  # salvar não falha pelos erros que já existem
        self.assertIn("Base salva em", saida)
        self.assertEqual(self.arquivo_base.read_text(encoding="utf-8"),
                         ".agents/docs/guides/g.md [ERRO] md.link-quebrado link: destino não existe: nada.md\n")

        guia.write_text("sem link\n", encoding="utf-8")
        codigo, saida = self.main("--comparar", str(self.arquivo_base))
        self.assertEqual(codigo, 0)
        self.assertIn("Corrigidos:\n.agents/docs/guides/g.md [ERRO] md.link-quebrado link: destino não existe: nada.md", saida)
        self.assertNotIn("Erros novos", saida)

    def test_erro_novo_falha_e_o_antigo_so_e_informado(self):
        """Com um erro novo, --comparar sai com 1; o erro antigo continua só informado."""
        self.escrever(".agents/docs/guides/g.md", "[x](nada.md)\n")
        self.main("--salvar-base", str(self.arquivo_base))
        self.escrever(".agents/docs/guides/h.md", "[y](sumiu.md)\n")
        codigo, saida = self.main("--comparar", str(self.arquivo_base))
        self.assertEqual(codigo, 1)
        self.assertIn("Erros novos (bloqueiam):\n.agents/docs/guides/h.md:1 [ERRO]", saida)
        self.assertIn("Já existiam antes da mudança (só informados):\n.agents/docs/guides/g.md:1 [ERRO]", saida)

    def test_comparar_sem_base_e_recusado(self):
        """--comparar sem o arquivo da base para com a orientação de salvar antes."""
        with self.assertRaises(SystemExit) as saida:
            self.main("--comparar", str(self.arquivo_base))
        self.assertIn("--salvar-base", str(saida.exception.code))


class PontoDeEntradaTest(unittest.TestCase):
    """No repositório real: a governança substitui o verificador antigo em todo lugar."""

    def test_nenhuma_instrucao_cita_o_verificador_antigo(self):
        """nenhuma instrução cita o verificador antigo (CA-30)"""
        arquivos = [md for md in coleta.instructions(RAIZ_REAL) if md.name != "ORIGEM.md"]
        arquivos += sorted((RAIZ_REAL / ".github" / "workflows").glob("*.yml"))
        citam = [str(a.relative_to(RAIZ_REAL)) for a in arquivos if "check_agents" in a.read_text(encoding="utf-8")]
        self.assertEqual(citam, [])
        self.assertFalse((RAIZ_REAL / ".agents" / "scripts" / "check_agents.py").exists())

    def test_ci_chama_a_governanca(self):
        """O workflow das instruções roda o script da governança, sem filtro."""
        workflow = (RAIZ_REAL / ".github" / "workflows" / "agents-checks.yml").read_text(encoding="utf-8")
        self.assertIn("run: python3 .agents/skills/governanca/scripts/governanca.py\n", workflow)


if __name__ == "__main__":
    unittest.main()
