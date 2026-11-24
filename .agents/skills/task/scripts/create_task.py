"""Cria o arquivo de uma task a partir do modelo .agents/docs/templates/task.md.

O corpo é o mesmo nos dois tipos; muda o que o script preenche:

- avulsa: .agents/docs/tasks/AAAA-MM-DD-<assunto>.md, status `aberta`, Spec e Bloqueada por com
  "não se aplica", critérios como '### CA-NN' (sem a subseção "Critérios de aceite");
- de spec: <pasta da spec>/tasks/NN-<assunto>.md, com número, título e arquivo do link da lista do
  design.md ("## 6. Tasks"); Spec com os links, Bloqueada por e os CA-NN da linha (em "Critérios de
  aceite", sem o exemplo '### CA-01'). O item precisa dizer o que cobre ("cobre: nenhum" quando não cobre
  critério): sem "cobre", o script recusa. Status `bloqueada` se alguma dependência não está `concluída` (task
  em tasks/done/ conta como concluída).

Preenche título, datas, status, tipo, Modo e o nome da branch (task de spec: `<tipo>/juno/<assunto da
spec>-NN`); o fechamento (seção 5) nasce só com os rótulos. O resto do modelo
fica para quem escreve a task (depois, confira com validate_task.py).

Modo: `--modo agente` (padrão) grava "agente implementa, Juno revisa"; `--modo juno`, quando o Juno já disse
que vai implementar, grava "Juno implementa, agente guia e revisa".

Uso:
    python create_task.py avulsa "<assunto>" --tipo fix [--titulo "Título"] [--modo agente|juno] [--data AAAA-MM-DD]
    python create_task.py spec <pasta da spec> <NN> --tipo feat [--modo agente|juno] [--data AAAA-MM-DD]
"""

import argparse
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts" / "lib"))
from md_checks import read_status, section_body, task_list_items  # noqa: E402  (precisa do sys.path ajustado acima)
from projeto import fill_template, get_project_root, read_text, relative_to_root, slugify  # noqa: E402

TIPOS_COMMIT = ("feat", "fix", "refactor", "test", "docs", "chore")
# Valor do --modo → texto do campo **Modo:** (os mesmos do validate_task.MODOS).
MODOS = {"agente": "agente implementa, Juno revisa", "juno": "Juno implementa, agente guia e revisa"}

# Partes do modelo que só um dos tipos usa: a avulsa define os '### CA-NN'; a de spec cita os do spec.md.
_EXEMPLO_CA = re.compile(r"^### CA-01: [\s\S]*?(?=^## )", re.MULTILINE)
_SUBSECAO_CRITERIOS = re.compile(r"^### Critérios de aceite\n[\s\S]*?(?=^### )", re.MULTILINE)
LINKS_SPEC = "[spec.md](../spec.md) · [design.md](../design.md)"


# region Montagem do conteúdo

def _trocar(conteudo: str, padrao: str, novo: str, descricao: str) -> str:
    """Troca a primeira linha que casa com `padrao`; falha se o modelo mudou e a linha sumiu."""
    conteudo, trocas = re.subn(padrao, lambda _: novo, conteudo, count=1, flags=re.MULTILINE)
    if trocas == 0:
        raise SystemExit(f"Modelo task.md sem a linha esperada: {descricao}.")
    return conteudo


def _remover_secao(conteudo: str, padrao: re.Pattern, descricao: str) -> str:
    conteudo, trocas = padrao.subn("", conteudo, count=1)
    if trocas == 0:
        raise SystemExit(f"Modelo task.md sem a {descricao}.")
    return conteudo


def _limpar_fechamento(conteudo: str) -> str:
    """Seção 5 nasce com os rótulos vazios: preenchida só ao fechar."""
    secao = section_body(conteudo, "5. Fechamento")
    if secao is None:
        raise SystemExit("Modelo task.md sem a seção '## 5. Fechamento'.")
    corpo, inicio = secao
    limpo = re.sub(r"^(- \*\*[^*\n]+:\*\*) <[^\n]*>$", r"\1", corpo, flags=re.MULTILINE)
    return conteudo[:inicio] + limpo + conteudo[inicio + len(corpo):]


def montar(titulo: str, data: date, status: str, tipo: str, branch: str, tipo_task: str,
           bloqueada_por: str = "", criterios: str = "", modo: str = "agente") -> str:
    conteudo = fill_template("task.md", titulo, data, status=status)
    conteudo = _trocar(conteudo, r"^(- \*\*Atualizado em:\*\* \S+ — )<[^>\n]+>$",
                       f"- **Atualizado em:** {data.isoformat()} — criação", "'Atualizado em'")
    conteudo = _trocar(conteudo, r"^- \*\*Tipo:\*\*.*$", f"- **Tipo:** `{tipo}`", "'- **Tipo:**'")
    conteudo = _trocar(conteudo, r"^- \*\*Modo:\*\*.*$", f"- **Modo:** `{MODOS[modo]}`", "'- **Modo:**'")
    conteudo = _trocar(conteudo, r"^- \*\*Branch:\*\*.*$",
                       f"- **Branch:** `{branch}`", "'- **Branch:**'")

    avulsa = tipo_task == "avulsa"
    conteudo = _trocar(conteudo, r"^- \*\*Spec:\*\*.*$",
                       f"- **Spec:** {'não se aplica' if avulsa else LINKS_SPEC}", "'- **Spec:**'")
    conteudo = _trocar(conteudo, r"^- \*\*Bloqueada por:\*\*.*$",
                       f"- **Bloqueada por:** {'não se aplica' if avulsa else bloqueada_por}", "'- **Bloqueada por:**'")
    if avulsa:
        conteudo = _remover_secao(conteudo, _SUBSECAO_CRITERIOS, "subseção '### Critérios de aceite'")
    else:
        conteudo = _remover_secao(conteudo, _EXEMPLO_CA, "exemplo '### CA-01'")
        conteudo = _trocar(conteudo, r"^<CA-01, CA-02 do spec\.md>$", criterios, "'<CA-01, CA-02 do spec.md>'")

    return _limpar_fechamento(conteudo)

# endregion

# region Lista de tasks do design.md

def ler_lista(design: Path) -> dict[str, dict]:
    """NN → {titulo, arquivo, dependencias, criterios, cancelada, linha} da lista "## 6. Tasks" do design.md
    (leitura da lib, a mesma do validate_spec). `arquivo` é None no item ainda sem link; `criterios` é None
    no item sem "cobre"."""
    texto = read_text(design)
    if section_body(texto, "6. Tasks") is None:
        raise SystemExit(f"'{relative_to_root(design)}' sem a seção '## 6. Tasks'.")

    return {
        item.numero: {
            "titulo": item.titulo,
            "arquivo": Path(item.alvo).name if item.alvo else None,
            "dependencias": re.findall(r"\b\d{2}\b", item.bloqueada_por or ""),
            "criterios": item.cobre,
            "cancelada": item.riscada,
            "linha": item.linha,
        }
        for item in task_list_items(texto)
    }


def status_da_task(pasta_tasks: Path, arquivo: str | None) -> str:
    """Status atual de uma task da spec: lido do arquivo; em done/ é concluída; sem arquivo, 'não criada'."""
    if arquivo is None:
        return "não criada"
    if (pasta_tasks / "done" / arquivo).exists():
        return "concluída"
    caminho = pasta_tasks / arquivo
    if not caminho.exists():
        return "não criada"
    status, _ = read_status(read_text(caminho))
    return status or "sem status"

# endregion


def _gravar(destino: Path, conteudo: str) -> None:
    if destino.exists() or (destino.parent / "done" / destino.name).exists():
        raise SystemExit(f"A task '{relative_to_root(destino)}' já existe.")
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(conteudo, encoding="utf-8")


def criar_avulsa(args: argparse.Namespace) -> None:
    slug = slugify(args.assunto)
    if not slug:
        raise SystemExit(f"Assunto '{args.assunto}' não gera um nome de arquivo válido.")
    data = args.data or date.today()
    titulo = args.titulo or slug.replace("-", " ").capitalize()

    conteudo = montar(titulo, data, "aberta", args.tipo, f"{args.tipo}/juno/{slug}", "avulsa", modo=args.modo)
    destino = get_project_root() / ".agents" / "docs" / "tasks" / f"{data.isoformat()}-{slug}.md"
    _gravar(destino, conteudo)
    print(f"Task criada em: {relative_to_root(destino)} (status `aberta`)")


def criar_de_spec(args: argparse.Namespace) -> None:
    pasta: Path = args.pasta_spec
    design = pasta / "design.md"
    if not design.exists():
        raise SystemExit(f"'design.md' não encontrado em '{pasta}': a lista de tasks mora nele.")

    numero = f"{int(args.numero):02d}"
    lista = ler_lista(design)
    if numero not in lista:
        raise SystemExit(f"A task {numero} não está na lista '## 6. Tasks' de '{relative_to_root(design)}'.")
    item = lista[numero]
    if item["cancelada"]:
        raise SystemExit(f"A task {numero} está riscada (cancelada) na lista do design.md.")
    if item["arquivo"] is None:
        raise SystemExit(f"A task {numero} não tem link na lista do design.md (linha {item['linha']}): "
                         f"ponha o link '[{numero} — título](tasks/{numero}-<assunto>.md)' antes de criar.")
    if item["criterios"] is None:
        raise SystemExit(f"A task {numero} não diz o que cobre na lista do design.md (linha {item['linha']}): "
                         "acrescente '— cobre: CA-NN' (ou 'cobre: nenhum').")

    pasta_tasks = pasta / "tasks"
    pendentes = []
    nomes = []
    for dep in item["dependencias"]:
        if dep not in lista:
            raise SystemExit(f"A task {numero} depende da {dep}, que não está na lista do design.md.")
        nome = lista[dep]["arquivo"]
        nomes.append(nome or dep)
        status = status_da_task(pasta_tasks, nome)
        if status != "concluída":
            pendentes.append(f"{nome or dep} ({status})")

    slug_spec = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", pasta.resolve().name)
    branch = f"{args.tipo}/juno/{slug_spec}-{numero}"

    status = "bloqueada" if pendentes else "aberta"
    conteudo = montar(item["titulo"], args.data or date.today(), status, args.tipo, branch, "spec",
                      bloqueada_por=", ".join(nomes) or "nenhuma", criterios=item["criterios"], modo=args.modo)
    destino = pasta_tasks / item["arquivo"]
    _gravar(destino, conteudo)

    print(f"Task criada em: {relative_to_root(destino)} (status `{status}`)")
    if pendentes:
        print(f"Bloqueada por: {', '.join(pendentes)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Cria o arquivo de uma task a partir do modelo.")
    sub = parser.add_subparsers(dest="tipo_task", required=True)

    avulsa = sub.add_parser("avulsa", help="Task avulsa em .agents/docs/tasks/")
    avulsa.add_argument("assunto", help="Assunto curto; vira o nome do arquivo (ex.: 'restringir perfil cliente')")
    avulsa.add_argument("--titulo", help="Título da task, com acentos (padrão: derivado do assunto)")

    spec = sub.add_parser("spec", help="Task de spec, a partir da lista do design.md")
    spec.add_argument("pasta_spec", type=Path, help="Pasta da spec (com design.md)")
    spec.add_argument("numero", help="Número da task na lista do design.md (ex.: 02)")

    for p in (avulsa, spec):
        p.add_argument("--tipo", required=True, choices=TIPOS_COMMIT, help="Tipo do commit principal")
        p.add_argument("--data", type=date.fromisoformat, default=None, help="AAAA-MM-DD (padrão: hoje)")
        p.add_argument("--modo", choices=tuple(MODOS), default="agente",
                       help="agente (padrão): agente implementa, Juno revisa; juno: Juno implementa, agente guia e revisa")

    args = parser.parse_args()
    criar_avulsa(args) if args.tipo_task == "avulsa" else criar_de_spec(args)


if __name__ == "__main__":
    main()
