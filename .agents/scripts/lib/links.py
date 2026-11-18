"""Checagem de links relativos em Markdown, compartilhada entre as skills.

Uso típico (o chamador decide como reportar e quais exceções aceitar):

    for linha, alvo in broken_links(arquivo, texto_sem_codigo, raiz=raiz_do_projeto):
        ...

Passe o texto com os blocos de código mascarados (mesmo tamanho, mesmas quebras de linha),
para que exemplos dentro de código não sejam tratados como links.
"""

import re
from pathlib import Path
from urllib.parse import unquote

# [texto](alvo) ou ![imagem](alvo), com título opcional: [texto](alvo "título")
_LINK = re.compile(r"!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+\"[^\"]*\")?\s*\)")
# http:, https:, mailto: etc.
_ESQUEMA = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")


def broken_links(arquivo: Path, texto: str, raiz: Path | None = None) -> list[tuple[int, str]]:
    """Devolve (linha, alvo) de cada link relativo de `texto` cujo destino não existe.

    - Links externos (com esquema) e âncoras da própria página (#...) são ignorados.
    - A âncora de um link para outro arquivo (arquivo.md#secao) é descartada: só o arquivo é conferido.
    - Links que começam com "/" são resolvidos a partir de `raiz`; sem `raiz`, são ignorados.
    """
    quebrados: list[tuple[int, str]] = []

    for match in _LINK.finditer(texto):
        alvo = match.group(1)
        if _ESQUEMA.match(alvo) or alvo.startswith("#"):
            continue

        caminho = unquote(alvo.split("#", 1)[0])
        if caminho.startswith("/"):
            if raiz is None:
                continue
            destino = raiz / caminho.lstrip("/")
        else:
            destino = arquivo.parent / caminho

        if not destino.exists():
            linha = texto.count("\n", 0, match.start()) + 1
            quebrados.append((linha, alvo))

    return quebrados
