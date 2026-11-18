# Task: <título curto e objetivo>

<!--
Modelo único de task.
- Task de spec: copie para .agents/docs/specs/AAAA-MM-DD-<assunto>/tasks/NN-<assunto>.md
  e preencha a seção 1. A seção 2 fica de fora (o contexto e os critérios estão no spec.md).
- Task avulsa: copie para .agents/docs/tasks/AAAA-MM-DD-<assunto>.md, pule a seção 1 e preencha a 2.
Cite outras tasks pelo nome do arquivo, não pelo caminho (o caminho muda quando vão para done/).
Apague estes comentários ao preencher.
-->

- **Status:** `aberta` | `em andamento` | `bloqueada` | `concluída` | `cancelada`
- **Criado em:** AAAA-MM-DD
- **Atualizado em:** AAAA-MM-DD — <motivo da última mudança>
- **Tipo:** `feat` | `fix` | `refactor` | `test` | `docs` | `chore`
- **Alcance:** `só API` | `API + front` | `só front` | `documentação`
- **Branch:** <nome da branch, criada pelo Juno>

## 1. Vínculo com a spec (task de spec)

- **Spec:** [spec.md](../spec.md) · **Design:** [design.md](../design.md)
- **Bloqueada por:** <nenhuma | NN-<assunto>.md>
- **Critérios de aceite cobertos:** <CA-01, CA-02>

## 2. Contexto e critérios (task avulsa)

- **Problema:** <o que está errado ou faltando>
- **Objetivo:** <resultado esperado, verificável>
- **Fica fora:** <o que não fazer nesta task>
- **Referências:** <requisito, ADR, issue, arquivo que motivou>

### CA-01: <nome do cenário>

- **Dado** <estado inicial>
- **Quando** <ação>
- **Então** <resultado observável>

## 3. O que fazer nesta tarefa

<!-- Fatia vertical: o caminho completo pelas camadas necessárias, testável sozinho. -->

1. <passo>
2. <passo>

**Ler antes de começar** (código real que serve de ponto de partida ou de modelo):

- <ex.: `api/src/domain/use-cases/avaliacao/cadastrar-avaliacao/cadastrar-avaliacao.use-case.ts`>
- <teste existente que serve de modelo>

**Arquivos previstos:** <criados e alterados; ajuda a dividir os commits>

**Não deve mudar:** <contratos, rotas, schemas, arquivos que esta task não pode tocar>

Precisou alterar um arquivo fora dos previstos, uma dependência, um schema ou um contrato da API?
Pare e avise antes: isso é mudança de escopo e precisa ser aprovada (e registrada nesta task).

**Testes existentes que vão mudar de propósito:** <teste e motivo, ex.: o teste do mapper passa a
esperar o campo novo>. Teste que quebrar e não estiver nesta lista é regressão até prova em contrário.

## 4. Como validar o que foi feito

**Antes de começar:** rode `npm run test:unit` e `npm run test:integration -- --runInBand` e anote o
resultado no fechamento. Assim, o que já estava quebrado não se confunde com o que a task quebrou.

| Critério | Teste que prova |
|---|---|
| CA-01 | `<arquivo>.unit.spec.ts` — "<nome do teste> (CA-01)" |

O nome do teste termina com o ID do critério, ex.: `it('deve recusar a avaliação antes da conclusão do contrato (CA-02)', ...)`.
Assim dá para achar, com uma busca, qual teste prova cada critério.

Comandos (dentro de `api/`; sem Node na máquina, via Docker `node:22`):

- `npx tsc --noEmit` — tipos
- `npm run test:unit`
- `npm run test:integration -- --runInBand`
- **Mutação manual** nas regras novas (como fazer: `.agents/docs/guides/testing.md`, seção 5.2): <quais
  mutações; todas devem ser detectadas por algum teste>

- **Checagem manual**, quando fizer sentido: <ex.: chamar a rota pelo Swagger com um caso de erro>

A task só está concluída com todos os comandos passando e a evidência registrada no fechamento.
"Terminei" sem evidência não conta: se uma checagem não pôde ser feita, diga qual e por quê.

## 5. Fechamento

<!-- Preencher ao terminar. É o que a skill de encerramento lê. -->

- **O que foi feito:** <resumo>
- **Arquivos alterados:** <lista; compare com os previstos e explique os que ficaram fora da lista>
- **Decisões tomadas no caminho:** <o que foi decidido durante a implementação e por quê>
- **Testes antes de começar:** <suítes e resultado; falhas que já existiam>
- **Testes no fim:** <suítes e testes passando; mutações feitas e detectadas>
- **Evidência por critério:** <CA-01 → teste "…" passando; CA-02 → …>
- **Checagens não feitas:** <qual e por quê, ou "nenhuma">
- **Ficou para depois:** <pendências, riscos, ideias — com destino: nova task, estacionamento>
- **Commits entregues:** <texto de cada commit e seus arquivos>
