import { Prestador } from "../../../../domain/entities/prestador/prestador.entity";
import { PrestadorPerfilCompletoRespostaDTO } from "../../../dto/usuario/prestador/prestador-perfil-completo-resposta.dto";
import { PrestadorPerfilPublicoRespostaDTO } from "../../../dto/usuario/prestador/prestador-perfil-publico-resposta.dto";
import { PrestadorAtualizadoRespostaDTO } from "../../../dto/usuario/prestador/prestador-atualizado-resposta.dto";
import { PrestadorBuscaResultado } from "../../../../domain/dto/prestador/prestador-busca-resultado.dto";
import { PrestadorBuscaRespostaDTO } from "../../../dto/prestador/prestador-busca-resposta.dto";

export class PrestadorMapper {
    public static paraPerfilCompletoDto(prestador: Prestador) : PrestadorPerfilCompletoRespostaDTO {
        return {
            id: prestador.id,
            idCliente: prestador.idCliente,
            telefone: prestador.telefone,
            descricao: prestador.descricao
        }
    }

    public static paraPerfilPublicoDto(prestador: Prestador) : PrestadorPerfilPublicoRespostaDTO {
        return {
            id: prestador.id,
            descricao: prestador.descricao
        }
    }

    public static paraAtualizadoDto(prestador: Prestador) : PrestadorAtualizadoRespostaDTO {
        return {
            descricao: prestador.descricao,
            telefone: prestador.telefone
        }
    }

    public static paraBuscaRespostaDto(resultado: PrestadorBuscaResultado): PrestadorBuscaRespostaDTO {
        return {
            id: resultado.id,
            descricao: resultado.descricao,
            nome: resultado.nome,
            cidade: resultado.cidade
        }
    }

    public static paraListaBuscaRespostaDto(lista: PrestadorBuscaResultado[]): PrestadorBuscaRespostaDTO[] {
        return lista.map(r => PrestadorMapper.paraBuscaRespostaDto(r))
    }
}
