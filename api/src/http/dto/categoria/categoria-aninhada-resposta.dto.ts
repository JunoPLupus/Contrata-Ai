import { CategoriaRespostaDTO } from "./categoria-resposta.dto";

export type CategoriaAninhadaRespostaDTO = {
    id: string | undefined
    nome: string
    descricao: string | undefined
    subcategorias: CategoriaRespostaDTO[]
}
