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

ANDAMENTO_OK = """## 4. Andamento

- 2026-11-18 — início da implementação; unit 80 / 435 ✅.
- 2026-11-19 — regra no use-case e no controller; 2 mutações detectadas.

"""

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
- **Commits entregues:**

  ```text
  fix(cliente): Restringe o perfil do cliente

  - só prestador logado ou o próprio cliente veem o perfil.

  Task: 2026-11-18-x.md
  ```

  Arquivos:
  - `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`
  - `api/src/http/controllers/usuario/cliente/cliente.controller.ts`

  ```text
  docs(cliente): Fecha a task de restringir o perfil do cliente

  - fechamento preenchido.

  Task: 2026-11-18-x.md
  ```

  Arquivos:
  - `.agents/docs/tasks/2026-11-18-x.md`
"""

TASK_SPEC_OK = """# Task: Rotas de leitura e ações

- **Status:** `bloqueada`
- **Criado em:** 2026-11-18
- **Atualizado em:** 2026-11-18 — criação
- **Tipo:** `feat`
- **Alcance:** `só API`
- **Modo:** `Juno implementa, agente guia e revisa`
- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)
- **Bloqueada por:** [01-nucleo.md](01-nucleo.md)
- **Branch:** `feat/juno/notificacoes-02` (sugerida; criada pelo Juno)

## 1. Contexto e critérios

### Problema

Ninguém vê as notificações que a API já grava.

### Objetivo

Listar, marcar como lida e excluir as lidas, só as do próprio usuário.

### Referências

não se aplica

### Critérios de aceite

CA-04 a CA-06

## 2. O que fazer nesta tarefa

### Fica fora

não se aplica

### Decisões

nenhuma

### Em aberto

nada

### Passos

1. Rotas de listar e marcar.

### Ler antes de começar

- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`
- o que a 01 entregar (entidade e repositório)

### Arquivos previstos

`api/src/http/routes/notificacao/notificacao.routes.ts` (novo)

### Não deve mudar

Rotas de cliente.

### Impacto

- **Contrato da API:** sim — rotas novas de notificação
- **Banco:** não
- **Front:** não, o front entra noutra spec
- **Permissões e segurança:** sim — só o dono lista as próprias notificações
- **Testes existentes que mudam de propósito:** não
- **Documentação:** sim — Swagger das rotas novas

## 3. Como validar o que foi feito

| Critério | Teste que prova |
|---|---|
| CA-04 | "deve listar (CA-04)" |
| CA-05 | "deve marcar como lida (CA-05)" |
| CA-06 | "deve marcar todas (CA-06)" |

## 4. Andamento

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
        """Achados como no relatório, sem o nome do arquivo: 'linha [SEVERIDADE] código mensagem'."""
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
        self.assertIn("ruim.md:3 [ERRO] md.status-invalido status: valor 'feito' inválido", falha.stdout)
        self.assertEqual(falha.stdout.strip().splitlines()[-1], "1 erro(s), 0 aviso(s)")  # linha de resumo no fim

    def test_cli_arquivo_inexistente(self):
        """Arquivo que não existe interrompe com mensagem, sem traceback."""
        r = subprocess.run([sys.executable, str(SCRIPT), str(self.tmp / "nao.md")], capture_output=True, text=True)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("não foi encontrado", r.stderr)

    def test_placeholder_e_comentario_do_modelo(self):
        """<placeholder> e comentário HTML do modelo que sobraram são erro."""
        texto = AVULSA_OK.replace("### Fica fora\n\nFront.", "### Fica fora\n\n<o que não fazer>\n<!-- apagar -->")
        erros = self.erros(texto)
        self.assertAcusa("placeholder: <o que não fazer>", erros)
        self.assertAcusa("comentario: <!-- apagar -->", erros)

    def test_status_com_a_lista_do_modelo(self):
        """Status com a lista de opções do modelo (`a` | `b`) é erro: o primeiro valor não pode passar por escolhido."""
        texto = AVULSA_OK.replace("- **Status:** `aberta`", "- **Status:** `aberta` | `em andamento`")
        self.assertAcusa("3 [ERRO] md.status-opcoes-do-modelo status: lista de opções do modelo", self.erros(texto))

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

    def test_avulsa_com_criterios_de_spec_ou_sem_secao_1(self):
        """Avulsa define os ### CA-NN: com '### Critérios de aceite' é erro; sem a seção 1 também."""
        com_criterios = AVULSA_OK.replace("### CA-01:", "### Critérios de aceite\n\nCA-01, CA-02\n\n### CA-01:")
        self.assertAcusa("task.criterios-na-avulsa critério: task avulsa define os '### CA-NN'", self.erros(com_criterios))
        sem_1 = AVULSA_OK.replace("## 1. Contexto e critérios", "## Contexto")
        self.assertAcusa("seção: obrigatória ausente: ## 1. Contexto e critérios", self.erros(sem_1))

    def test_spec_e_bloqueada_por_na_avulsa(self):
        """Avulsa usa 'não se aplica' em Spec e Bloqueada por; sem as linhas, ou com valor, é erro."""
        com_spec = AVULSA_OK.replace("- **Spec:** não se aplica", "- **Spec:** [spec.md](../spec.md)")
        self.assertAcusa("task.spec-na-avulsa spec: task avulsa usa 'não se aplica' em **Spec:**", self.erros(com_spec))
        com_bloqueio = AVULSA_OK.replace("- **Bloqueada por:** não se aplica", "- **Bloqueada por:** nenhuma")
        self.assertAcusa("task.bloqueada-por-na-avulsa", self.erros(com_bloqueio))
        sem = AVULSA_OK.replace("- **Spec:** não se aplica\n", "").replace("- **Bloqueada por:** não se aplica\n", "")
        erros = self.erros(sem)
        self.assertAcusa("task.spec-ausente spec: linha **Spec:** não encontrada", erros)
        self.assertAcusa("task.bloqueada-por-ausente bloqueada por: linha **Bloqueada por:** não encontrada", erros)

    def test_secao_4_ausente(self):
        """As seções 1 a 5 são obrigatórias; aqui falta a 3."""
        texto = AVULSA_OK.replace("## 3. Como validar o que foi feito", "## Validação")
        self.assertAcusa("seção: obrigatória ausente: ## 3. Como validar o que foi feito", self.erros(texto))

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
        """"Ler antes" sem nenhum caminho de arquivo é só aviso, na linha da subseção."""
        texto = AVULSA_OK.replace(
            "- `api/src/domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case.ts`\n"
            "- api/src/http/controllers/usuario/cliente/cliente.controller.ts:40 (método `buscarPorId`).\n",
            "- o use-case de buscar cliente\n")
        self.assertEqual([m for m in self.mensagens(texto)], ["58 [AVISO] task.ler-antes-sem-caminho ler antes: nenhum caminho de arquivo citado"])

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
        self.assertAcusa("[AVISO] task.tabela-sem-nome-de-teste tabela: CA-01 sem nome de teste", mensagens)

    def test_link_quebrado(self):
        """Link relativo para arquivo que não existe é erro."""
        texto = AVULSA_OK.replace("### Fica fora\n\nFront.", "### Fica fora\n\nFront ([ver](../nao-existe.md)).")
        self.assertAcusa("link: destino não existe: ../nao-existe.md", self.erros(texto))


# Os seis eixos do Impacto, escritos à mão (não lidos do validador, para um eixo tirado dele ser pego).
EIXOS = ("Contrato da API", "Banco", "Front", "Permissões e segurança",
         "Testes existentes que mudam de propósito", "Documentação")


class ModeloNovoTest(_Base):
    """Subseções fixas, eixos de impacto, Modo e Andamento do modelo novo, a partir da fixture avulsa-ok.md."""

    SUBSECOES = {
        "Problema": "Qualquer usuário logado vê o perfil de qualquer cliente.",
        "Objetivo": "Só prestador logado ou o próprio cliente veem; os demais recebem 403.",
        "Referências": "Decisão de 2026-11-11.",
        "Fica fora": "Front.",
        "Decisões": "- A regra mora no use-case — descartada: middleware (a regra depende do id buscado) — rodada de 2026-11-18.",
        "Em aberto": "nada",
        "Arquivos previstos": "`api/src/domain/regras/pode-ver-perfil.ts` (novo)",
        "Não deve mudar": "Campos do `ClientePerfilPublico`.",
    }

    def _eixo(self, eixo: str, valor: str) -> str:
        """A fixture com o valor do eixo trocado (a linha inteira do eixo)."""
        linha = next(l for l in AVULSA_OK.splitlines() if l.startswith(f"- **{eixo}:**"))
        return AVULSA_OK.replace(linha, f"- **{eixo}:** {valor}".rstrip())

    def test_subsecao_ausente_ou_vazia(self):
        """subseção obrigatória ausente ou vazia é acusada com o nome dela (CA-01)"""
        for titulo, conteudo in self.SUBSECOES.items():
            with self.subTest(titulo=titulo):
                sem = AVULSA_OK.replace(f"### {titulo}\n\n{conteudo}\n", "")
                self.assertNotEqual(sem, AVULSA_OK, "a fixture mudou: ajuste o trecho")
                self.assertAcusa(f"task.subsecao-ausente subseção: obrigatória ausente: ### {titulo}", self.erros(sem))

                vazia = AVULSA_OK.replace(f"### {titulo}\n\n{conteudo}\n", f"### {titulo}\n\n<!-- só comentário -->\n")
                self.assertAcusa(f"task.subsecao-vazia subseção: vazia: ### {titulo}", self.erros(vazia))
        # As que não estão no dicionário (Passos, Ler antes, Impacto) também são cobradas.
        for titulo in ("Passos", "Ler antes de começar", "Impacto"):
            with self.subTest(titulo=titulo):
                texto = AVULSA_OK.replace(f"### {titulo}\n", f"### {titulo} (renomeada)\n")
                self.assertAcusa(f"obrigatória ausente: ### {titulo} (## 2. O que fazer nesta tarefa)", self.erros(texto))

    def test_subsecao_vazia_na_linha_dela(self):
        """A subseção vazia é acusada na linha do título dela, não na da seção."""
        texto = AVULSA_OK.replace("### Fica fora\n\nFront.\n", "### Fica fora\n\n")
        linha = texto.splitlines().index("### Fica fora") + 1
        self.assertAcusa(f"{linha} [ERRO] task.subsecao-vazia subseção: vazia: ### Fica fora", self.erros(texto))

    def test_nao_se_aplica_e_resposta_valida(self):
        """subseção que diz só 'não se aplica' não é acusada (CA-02)"""
        texto = AVULSA_OK
        for titulo, conteudo in self.SUBSECOES.items():
            texto = texto.replace(f"### {titulo}\n\n{conteudo}\n", f"### {titulo}\n\nnão se aplica\n")
        self.assertEqual(texto.count("não se aplica"), len(self.SUBSECOES) + 2)  # + Spec e Bloqueada por
        self.assertEqual(self.mensagens(texto), [])

    def test_nada_e_nenhuma_valem(self):
        """"Em aberto" com "nada" e "Decisões" com "nenhuma" não são acusados."""
        texto = AVULSA_OK.replace(self.SUBSECOES["Decisões"], "nenhuma")
        self.assertEqual(self.mensagens(texto), [])

    def test_task_de_spec_tem_o_mesmo_corpo(self):
        """Problema, Objetivo e Referências valem também na task de spec; sem uma delas, é acusada."""
        texto = TASK_SPEC_OK.replace("### Objetivo\n", "### Objetivos\n")
        self.assertAcusa("obrigatória ausente: ### Objetivo (## 1. Contexto e critérios)",
                         self.erros(texto, relativo="outra/specs/x/tasks/02-rotas.md"))

    def test_eixo_de_impacto_sem_resposta(self):
        """eixo de impacto ausente, vazio, sem sim/não ou com sim sem dizer o quê é acusado com o nome do eixo (CA-03)"""
        for eixo in EIXOS:
            with self.subTest(eixo=eixo):
                linha = next(l for l in AVULSA_OK.splitlines() if l.startswith(f"- **{eixo}:**"))
                self.assertAcusa(f"task.impacto-eixo-ausente impacto: eixo '{eixo}' ausente",
                                 self.erros(AVULSA_OK.replace(linha + "\n", "")))
                self.assertAcusa(f"task.impacto-eixo-vazio impacto: eixo '{eixo}' vazio", self.erros(self._eixo(eixo, "")))
                self.assertAcusa(f"task.impacto-eixo-sem-resposta impacto: eixo '{eixo}' sem 'sim — …' ou 'não'",
                                 self.erros(self._eixo(eixo, "talvez, depende da rota")))
                for sim in ("sim", "sim —", "sim -", "sim:  rota nova"):
                    self.assertAcusa(f"task.impacto-sim-sem-o-que impacto: eixo '{eixo}' com 'sim' sem dizer o quê",
                                     self.erros(self._eixo(eixo, sim)))

    def test_eixo_respondido_passa(self):
        """"sim" com qualquer travessão (—, –, -) e texto depois, e "não" sozinho ou com comentário, passam."""
        for valor in ("sim — rota nova", "sim – rota nova", "sim - rota nova", "Sim — rota nova", "não",
                      "não, procurado com rtk grep", "não (o front entra noutra spec)"):
            with self.subTest(valor=valor):
                self.assertEqual(self.erros(self._eixo("Banco", valor)), [])

    def test_sim_continua_na_linha_de_baixo(self):
        """O "o que muda" pode continuar na linha de baixo, recuado."""
        texto = self._eixo("Banco", "sim — campo novo `lida` na coleção\n  de notificações")
        self.assertEqual(self.erros(texto), [])

    def test_modo_ausente_lista_ou_invalido(self):
        """Modo ausente, com a lista do modelo ou fora dos dois valores é erro."""
        linha = "- **Modo:** `agente implementa, Juno revisa`"
        self.assertAcusa("task.modo-ausente modo: linha **Modo:** não encontrada",
                         self.erros(AVULSA_OK.replace(linha + "\n", "")))
        self.assertAcusa("task.modo-opcoes-do-modelo",
                         self.erros(AVULSA_OK.replace(linha, linha + " | `Juno implementa, agente guia e revisa`")))
        for invalido in ("`agente implementa`", "`Juno implementa, agente guia`", "agente implementa, Juno revisa"):
            with self.subTest(invalido=invalido):
                self.assertAcusa("task.modo-invalido modo:",
                                 self.erros(AVULSA_OK.replace(linha, f"- **Modo:** {invalido}")))

    def test_modo_juno_passa(self):
        """Os dois valores do conjunto passam."""
        texto = AVULSA_OK.replace("`agente implementa, Juno revisa`", "`Juno implementa, agente guia e revisa`")
        self.assertEqual(self.mensagens(texto), [])

    def _com_andamento(self, status: str, entradas: str) -> str:
        return (AVULSA_OK.replace("`aberta`", f"`{status}`")
                .replace("## 4. Andamento\n", f"## 4. Andamento\n\n{entradas}"))

    def test_andamento_vazio_com_aberta_ou_bloqueada_passa(self):
        """Andamento vazio vale com `aberta` (a fixture) e com `bloqueada`."""
        self.assertEqual(self.erros(AVULSA_OK.replace("`aberta`", "`bloqueada`")), [])

    def test_andamento_vazio_a_partir_de_em_andamento(self):
        """Andamento sem entrada com `em andamento`, `concluída` ou `cancelada` é erro."""
        for status in ("em andamento", "concluída", "cancelada"):
            with self.subTest(status=status):
                self.assertAcusa(f"task.andamento-sem-entrada andamento: status `{status}` sem nenhuma entrada",
                                 self.erros(AVULSA_OK.replace("`aberta`", f"`{status}`")))

    def test_andamento_com_entradas_passa(self):
        """Entradas datadas, com continuação recuada e bloco de código, passam."""
        entradas = ("- 2026-11-18 — início; unit 80 / 435 ✅\n"
                    "- 2026-11-19 – descobri que o buscarLogado também muda;\n"
                    "  registrado em Arquivos previstos\n\n"
                    "  ```text\n  saída de um comando\n  sem data\n  ```\n\n"
                    "- 2026-11-20 - troca de Modo: o Juno vai implementar (tokens)\n")
        self.assertEqual(self.erros(self._com_andamento("em andamento", entradas)), [])

    def test_andamento_entrada_fora_do_formato(self):
        """Entrada sem data, com data inválida, sem travessão ou sem texto é erro."""
        for entrada in ("- início da implementação", "- 2026-13-01 — data inválida", "- 2026-11-18 início",
                        "- 2026-11-18 —", "2026-11-18 — sem o traço da lista", "Texto solto no Andamento."):
            with self.subTest(entrada=entrada):
                texto = self._com_andamento("em andamento", f"- 2026-11-18 — início\n{entrada}\n")
                self.assertAcusa("task.andamento-entrada-formato andamento: entrada fora do formato", self.erros(texto))

    def test_andamento_ausente(self):
        """Task sem a seção Andamento é erro."""
        texto = AVULSA_OK.replace("## 4. Andamento\n\n", "")
        self.assertAcusa("task.andamento-ausente seção: obrigatória ausente: ## 4. Andamento", self.erros(texto))


class FechamentoTest(_Base):
    """Regras do fechamento (seção 6), com --fechar ou status `concluída`."""

    def _fechada(self, status: str = "concluída", fechamento: str = FECHAMENTO_OK) -> str:
        inicio = AVULSA_OK.index("## 4. Andamento")
        return AVULSA_OK[:inicio].replace("`aberta`", f"`{status}`") + ANDAMENTO_OK + fechamento

    def test_concluida_com_fechamento_completo_passa(self):
        """Task concluída com todos os rótulos preenchidos e evidência por CA não gera achado."""
        self.assertEqual(self.mensagens(self._fechada(), fechar=True), [])

    def test_fechar_com_checagens_vazias(self):
        """Ao fechar, "Checagens não feitas" vazia é erro (pode ser "nenhuma", não vazia)."""
        texto = self._fechada("em andamento").replace("- **Checagens não feitas:** nenhuma.", "- **Checagens não feitas:**")
        self.assertAcusa("fechamento: preencha 'Checagens não feitas'", self.erros(texto, fechar=True))

    def test_sem_fechar_em_andamento_nao_confere_o_fechamento(self):
        """Task em andamento sem --fechar pode ter o fechamento com rótulos vazios."""
        texto = AVULSA_OK.replace("`aberta`", "`em andamento`").replace(
            "## 4. Andamento\n", "## 4. Andamento\n\n- 2026-11-18 — início da implementação\n")
        self.assertEqual(self.erros(texto), [])

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
        self.assertAcusa("[AVISO] task.fechamento-checagens-pendentes fechamento: há checagens não feitas", self.mensagens(texto))

    def test_commits_entregues_sem_bloco_text(self):
        """"Commits entregues" só com o título, sem o bloco ```text da mensagem, é erro ao fechar."""
        texto = self._fechada(fechamento=FECHAMENTO_OK[:FECHAMENTO_OK.index("- **Commits entregues:**")]
                              + "- **Commits entregues:** `fix(cliente): Restringe o perfil do cliente`.\n")
        self.assertAcusa("task.commits-sem-bloco fechamento: 'Commits entregues' sem bloco ```text", self.erros(texto))
        self.assertAcusa("task.commits-sem-bloco", self.erros(texto.replace("`concluída`", "`em andamento`"), fechar=True))

    def test_commit_sem_a_lista_de_arquivos(self):
        """Bloco ```text sem a lista "Arquivos:" logo depois (ou com a lista vazia) é erro, com o título do commit."""
        sem_lista = FECHAMENTO_OK.replace(
            "  Arquivos:\n  - `.agents/docs/tasks/2026-11-18-x.md`\n", "  Ficou para o próximo commit.\n")
        self.assertNotEqual(sem_lista, FECHAMENTO_OK)
        self.assertAcusa("task.commits-sem-arquivos fechamento: commit 'docs(cliente): Fecha a task de restringir o perfil "
                         "do cliente' sem a lista 'Arquivos:'", self.erros(self._fechada(fechamento=sem_lista)))

        lista_vazia = FECHAMENTO_OK.replace("  - `.agents/docs/tasks/2026-11-18-x.md`\n", "")
        self.assertAcusa("task.commits-sem-arquivos", self.erros(self._fechada(fechamento=lista_vazia)))

    def test_commit_com_bloco_vazio(self):
        """Bloco ```text sem nenhuma linha de mensagem é erro."""
        vazio = FECHAMENTO_OK.replace(
            "  fix(cliente): Restringe o perfil do cliente\n\n  - só prestador logado ou o próprio cliente veem o perfil.\n\n"
            "  Task: 2026-11-18-x.md\n", "\n")
        self.assertNotEqual(vazio, FECHAMENTO_OK)
        self.assertAcusa("task.commits-bloco-vazio", self.erros(self._fechada(fechamento=vazio)))

    def test_commits_vazio_em_andamento_nao_e_cobrado(self):
        """Com `em andamento`, "Commits entregues" vazio não é cobrado ao fechar (o fechamento pode ser parcial)."""
        texto = self._fechada("em andamento", FECHAMENTO_OK[:FECHAMENTO_OK.index("- **Commits entregues:**")]
                              + "- **Commits entregues:**\n")
        self.assertEqual(self.erros(texto, fechar=True), [])

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
        texto = TASK_SPEC_OK.replace("## 2.", "### CA-04: listar\n\n- **Dado** um cliente\n\n## 2.")
        erros = self.erros_spec(texto)
        self.assertAcusa("task de spec cita os CA-NN do spec.md, não copia Dado / Quando / Então", erros)
        self.assertAcusa("task de spec não define '### CA-04'", erros)

    def test_spec_e_bloqueada_por_sem_vinculo(self):
        """Task de spec preenche Spec (com o link do spec.md) e Bloqueada por: 'não se aplica' é erro."""
        sem_vinculo = (TASK_SPEC_OK.replace("- **Spec:** [spec.md](../spec.md) · [design.md](../design.md)", "- **Spec:** não se aplica")
                       .replace("- **Bloqueada por:** [01-nucleo.md](01-nucleo.md)", "- **Bloqueada por:** não se aplica"))
        erros = self.erros_spec(sem_vinculo)
        self.assertAcusa("task.spec-sem-vinculo spec: task de spec preenche **Spec:**", erros)
        self.assertAcusa("task.bloqueada-por-sem-vinculo", erros)
        sem_link = TASK_SPEC_OK.replace("[spec.md](../spec.md) · ", "")
        self.assertAcusa("task.spec-sem-link spec: **Spec:** sem o link para o spec.md", self.erros_spec(sem_link))

    def test_ca_citado_fora_de_criterios_de_aceite_nao_e_da_task(self):
        """Só os CA de 'Critérios de aceite' são da task: um CA citado no Problema não é cobrado na tabela."""
        texto = TASK_SPEC_OK.replace("Ninguém vê as notificações", "Ninguém vê (CA-07 é da task 03) as notificações")
        self.assertNotEqual(texto, TASK_SPEC_OK)
        self.assertEqual(vt.task_cas(texto, "spec"), {4, 5, 6})
        self.assertEqual(self.erros_spec(texto), [])

    def test_sem_criterios_de_aceite(self):
        """Task de spec sem '### Critérios de aceite' (ou com ela vazia) é erro."""
        sem = TASK_SPEC_OK.replace("### Critérios de aceite\n\nCA-04 a CA-06\n", "")
        self.assertAcusa("obrigatória ausente: ### Critérios de aceite", self.erros_spec(sem))
        vazia = TASK_SPEC_OK.replace("### Critérios de aceite\n\nCA-04 a CA-06\n", "### Critérios de aceite\n\n")
        self.assertAcusa("task.subsecao-vazia subseção: vazia: ### Critérios de aceite", self.erros_spec(vazia))

    def test_ca_inexistente_na_spec_e_fora_do_formato(self):
        """CA citado que não existe no spec.md, ou fora do formato CA-NN, é erro."""
        texto = TASK_SPEC_OK.replace("CA-04 a CA-06", "CA-04 a CA-06, CA-99, CA-7")
        erros = self.erros_spec(texto)
        self.assertAcusa("29 [ERRO] md.criterio-inexistente critério: CA-99 citado mas não existe no spec.md", erros)
        self.assertAcusa("critério: 'CA-7' fora do formato CA-NN", erros)

    def test_intervalo_cobre_os_do_meio_na_tabela(self):
        """"CA-04 a CA-06" exige linha na tabela também para o CA-05."""
        texto = TASK_SPEC_OK.replace('| CA-05 | "deve marcar como lida (CA-05)" |\n', "")
        self.assertAcusa("tabela: CA-05 sem linha na tabela", self.erros_spec(texto))

    def test_link_para_task_irma_nao_criada_e_aceito_mas_spec_quebrada_nao(self):
        """Link para task irmã ainda não criada é aceito; link quebrado para outro arquivo não."""
        self.assertEqual(self.erros_spec(TASK_SPEC_OK), [])
        texto = TASK_SPEC_OK.replace("(../spec.md)", "(../nao-existe.md)")
        self.assertAcusa("link: destino não existe: ../nao-existe.md", self.erros_spec(texto))

    def test_sem_spec_na_pasta_pula_a_conferencia_dos_ca(self):
        """Sem spec.md na pasta, os CA não são conferidos."""
        texto = TASK_SPEC_OK.replace("CA-04 a CA-06", "CA-04 a CA-06, CA-99")
        erros = self.erros(texto, relativo="outra/specs/x/tasks/02-rotas.md")
        self.assertFalse(any("CA-99 citado" in e for e in erros), erros)

    def test_branch_de_spec_segue_o_padrao_mesmo_com_branch_no_design(self):
        """O design não tem mais Branch: a task de spec segue <tipo>/juno/<assunto>, e um design antigo com
        **Branch:** não muda isso."""
        design = self.tmp / "specs" / "2026-11-15-notificacoes" / "design.md"
        design.write_text(design.read_text(encoding="utf-8").replace(
            "- **Atualizado em:**", "- **Branch:** `feature/notificacoes`\n- **Atualizado em:**", 1), encoding="utf-8")
        self.assertEqual(self.erros_spec(TASK_SPEC_OK), [])
        texto = TASK_SPEC_OK.replace("`feat/juno/notificacoes-02`", "`feature/notificacoes`")
        self.assertAcusa("branch: use '<tipo>/juno/<assunto>'", self.erros_spec(texto))


if __name__ == "__main__":
    unittest.main()
