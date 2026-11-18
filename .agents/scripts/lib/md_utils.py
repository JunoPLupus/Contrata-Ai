"""Utilitários de Markdown compartilhados entre as skills: máscara de código, linha e placeholders do modelo.

A máscara troca o conteúdo por espaços mantendo o tamanho e as quebras de linha: as posições e os
números de linha do texto mascarado valem no original. Busque no mascarado, recorte no original.
"""

import re

COMENTARIO = r"<!--[\s\S]*?-->"
COMENTARIO_PATTERN = re.compile(COMENTARIO)

# Placeholder do modelo: "<" seguido de letra (com acento/maiúscula), "..." ou aspas — nunca espaço ou
# dígito, para não confundir com "x < 5". Data do modelo não preenchida: AAAA-MM-DD.
PLACEHOLDER_PATTERN = re.compile(
    rf"(?P<comentario>{COMENTARIO})"
    r'|(?P<placeholder><(?:[^\W\d_]|\.\.\.|")[^>\n]*>)'
    r"|(?P<data>AAAA-MM-DD)"
)


def line_of(texto: str, posicao: int) -> int:
    """Número da linha (a partir de 1) de uma posição do texto."""
    return texto.count("\n", 0, posicao) + 1


def _mask(match: re.Match) -> str:
    return "".join("\n" if c == "\n" else " " for c in match.group(0))


def mask_code(texto: str) -> str:
    """Mascara blocos de código (três crases) e depois código inline."""
    mascarado = re.sub(r"```[\s\S]*?```", _mask, texto)
    return re.sub(r"`[^`\n]*`", _mask, mascarado)


def mask_code_and_comments(texto: str) -> str:
    """Mascara código e comentários HTML (exemplos do modelo não contam como estrutura)."""
    return COMENTARIO_PATTERN.sub(_mask, mask_code(texto))


def find_placeholders(texto: str) -> list[tuple[int, int, str, str]]:
    """(linha_inicio, linha_fim, tipo, trecho original) de cada comentário, placeholder ou data do modelo
    que sobrou fora de código. tipo: 'comentario' | 'placeholder' | 'data'."""
    achados = []
    for match in PLACEHOLDER_PATTERN.finditer(mask_code(texto)):
        achados.append((
            line_of(texto, match.start()),
            line_of(texto, match.end()),
            match.lastgroup,
            texto[match.start():match.end()],
        ))
    return achados
