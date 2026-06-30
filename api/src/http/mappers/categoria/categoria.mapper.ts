import { Categoria } from "../../../domain/entities/categoria/categoria.entity";
import { CategoriaRespostaDTO } from "../../dto/categoria/categoria-resposta.dto";
import { CategoriaDetalheRespostaDTO } from "../../dto/categoria/categoria-detalhe-resposta.dto";
import { CategoriaAninhadaRespostaDTO } from "../../dto/categoria/categoria-aninhada-resposta.dto";

export class CategoriaMapper {
    public static paraRespostaDTO(categoria: Categoria): CategoriaRespostaDTO {
        return {
            id: categoria.id,
            nome: categoria.nome,
            descricao: categoria.descricao
        }
    }

    public static paraDetalheRespostaDTO(categoria: Categoria): CategoriaDetalheRespostaDTO {
        return {
            id: categoria.id,
            nome: categoria.nome,
            descricao: categoria.descricao,
            categoriaPaiId: categoria.categoriaPaiId
        }
    }

    public static paraListaAninhadaRespostaDTO(categorias: Categoria[]): CategoriaAninhadaRespostaDTO[] {
        const raizes = categorias.filter(c => !c.categoriaPaiId)
        return raizes.map(raiz => ({
            id: raiz.id,
            nome: raiz.nome,
            descricao: raiz.descricao,
            subcategorias: categorias
                .filter(c => c.categoriaPaiId === raiz.id)
                .map(filho => CategoriaMapper.paraRespostaDTO(filho))
        }))
    }
}
