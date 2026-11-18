# Testes: como provar que o código faz o que diz

Para quem: agente ou pessoa que escreve teste em `api/` (Jest) ou nos scripts das skills (Python).

## 1. Por que testar assim

Teste que nunca falha não prova nada. O objetivo é **pegar a falha**, não ficar verde: todo teste novo ou
corrigido precisa ser visto falhando quando a regra que ele cobre quebra (seção 5.2).

## 2. Ferramentas e onde ficam os testes

### 2.1 Ferramentas

- API: Jest (todos os testes) e `mongodb-memory-server` (integração: banco em memória, sem tocar no banco real);
- Skills: `unittest` do Python (biblioteca padrão, sem dependência nova).

Não introduza dependência de teste nova sem aprovação.

### 2.2 Onde ficam os testes

| Projeto | Arquivo | Onde fica |
| --- | --- | --- |
| `api/` | `<nome>.unit.spec.ts` / `<nome>.integration.spec.ts` | Na mesma pasta do código testado |
| `api/` | `<entidade>.mother.ts` (dados de teste) | `api/src/test-helpers/` |
| `.agents/skills/` | `test_<script>.py` | Ao lado do script ou em `scripts/testes/` da skill (ex.: `spec/scripts/testes/`) |

O Jest separa unitário e integração pelo nome do arquivo (`unit` / `integration`).

## 3. Como executar

API (dentro de `api/`):

| Comando | O que faz |
| --- | --- |
| `rtk npm test` | todos os testes |
| `rtk npm run test:unit` | só unitários |
| `rtk npm run test:integration -- --runInBand` | só integração, em série (em paralelo estoura a memória) |
| `rtk npx tsc --noEmit` | checagem de tipos |

Sem Node na máquina: rode pela imagem Docker `node:22`, montando a pasta `api/` (o `rtk` vai no comando da
máquina, nunca dentro do container).

Skills (a partir da raiz do projeto):

| Comando | O que testa |
| --- | --- |
| `rtk python3 -m unittest discover -s .agents/skills/spec/scripts/testes` | scripts da `spec` |
| `rtk python3 -m unittest discover -s .agents/skills/task/scripts/testes` | scripts da `task` |
| `rtk python3 -m unittest discover -s .agents/skills/task/evals -p "test_*.py"` | critérios `[script]` dos evals da `task` |
| `cd .agents/skills/oficina-de-skills && rtk python3 -m unittest scripts.test_apply_checks` | `apply_checks` da oficina |

Informe o resultado real (suítes e testes, inclusive falhas), nunca "passou tudo".

## 4. Regras

- **Um caso que passa e um que falha** para cada regra ou critério. Ex.: o `validate_task` tem um teste com a
  task correta (sem achados) e um por regra quebrada (tabela sem nome de teste → erro).
- **Determinístico:** sem data atual, aleatoriedade ou ordem do banco decidindo o resultado. Fixe datas e
  valores no teste.
- **Isolado:** um teste não depende de outro nem do estado deixado por ele.
- **Agrupe por contexto**, para rodar um grupo ou tudo de uma vez pela IDE:
  - API: um `describe` por arquivo com o nome da classe testada e, quando houver mais de um contexto,
    `describe` aninhados por método ou cenário (ex.: `describe('CadastrarAvaliacaoUseCase')` ›
    `describe('dedução do autor')` › `it(...)`, em `cadastrar-avaliacao.use-case.unit.spec.ts`);
  - skills: uma classe `unittest.TestCase` por contexto, todas no nível do arquivo (ex.:
    `AvulsaTest`, `FechamentoTest`). O arquivo é o grupo maior. **Não aninhe classes de teste:** o
    `unittest` não coleta classe dentro de classe e ignora esses testes sem avisar.
- **Nome do teste que prova um critério** termina com o ID: `it('deve recusar outro cliente (CA-03)', ...)`.
- Toda mudança de comportamento vem com teste, no mesmo commit (`.agents/docs/guides/commits.md`).

## 5. Evitando falsos positivos

Um teste novo ou corrigido só vale se falhar quando o comportamento que ele verifica quebra. Duas frentes:
escrever o teste para não passar por acaso (5.1) e provar que ele pega a falha com mutação manual (5.2).

### 5.1 Ao escrever o teste

- Na `api/`, crie os objetos com os mothers de `test-helpers/` (dados válidos).
- Para testar um caso inválido, parta de dados **válidos** e quebre **um** campo por vez, conferindo o erro
  desse campo. Dados vazios são recusados por qualquer motivo e não provam a regra.
- Não compare a saída com o mesmo código que a gera (ex.: resposta do controller comparada com o próprio
  `OrcamentoMapper.paraRespostaDTO`): o teste passa mesmo com o mapper errado. Confira os campos explicitamente.
- Não use o valor default do mother na asserção de um mapeamento: se o código trocar o campo por uma constante
  igual ao default (ex.: `250`), o teste continua verde. Passe um valor distinto no teste.
- Não valide só com dados reais (saídas de uma rodada, banco de desenvolvimento): eles podem não conter o erro.
  Monte um dado sintético para cada erro que a regra precisa pegar.

### 5.2 Mutação manual

Mutação = quebrar a regra de propósito no código (remover uma checagem ou um campo obrigatório, inverter uma
comparação, retirar a credencial, deixar de salvar, trocar um valor por constante) e rodar os testes. Algum
teste tem de falhar: o mutante "morreu". Se tudo continua verde, ele "sobreviveu" e a regra não está provada.
Faça em toda regra nova ou corrigida, na API e nos scripts das skills:

1. Liste as mutações das regras que a mudança tocou (uma por condição importante).
2. Aplique uma por vez, rode a suíte afetada e desfaça a mutação.
3. Mutante vivo → reforce o teste (caso que faltava) ou justifique como **equivalente** (a mutação não muda o
   resultado de verdade; ex.: tirar `dup key` de uma regex que casa igual no formato real do erro).
4. Registre no fechamento da task: quantos mutantes, quantos mortos, quais sobreviveram e o que foi feito.

Exemplos reais: 22 mutantes no orçamento, 5 vivos na primeira passada (os falsos positivos do 5.1: mapper e
default do mother), todos mortos depois de reforçar os testes; 46 mutantes nos scripts da `task`, 2 vivos
(faltava o caso de caminho com `:linha` e o de CA não citado), testes reforçados.

Omissão de campo num mapper tipado com `Pick` é pega pelo compilador (`tsc --noEmit`), não pelos testes: não
gaste mutante nela.

## 6. Testes das skills

Os scripts das skills seguem este guia (seções 4 e 5). Os testes de comportamento de uma skill (cenários com e
sem a skill, critérios `[script]` em `evals/checks.py`) seguem a skill
[`oficina-de-skills`](../../skills/oficina-de-skills/SKILL.md), passo 4.

## 7. Checklist antes de dizer "terminei"

- [ ] Rodei as suítes afetadas (seção 3) e anotei os números reais, inclusive falhas que já existiam.
- [ ] Cada regra nova ou corrigida tem um caso que passa e um que falha.
- [ ] Cada critério `CA-NN` tem um teste com `(CA-NN)` no nome.
- [ ] Fiz a mutação manual nas regras novas e registrei mortos, vivos e o motivo dos vivos.
- [ ] O que não deu para rodar está dito, com o motivo (ex.: "Checagens não feitas" da task).
