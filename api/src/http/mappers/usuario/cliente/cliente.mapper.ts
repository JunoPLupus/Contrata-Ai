import { Usuario } from "../../../../domain/entities/usuario/usuario.entity";
import { ClientePerfilDto } from "../../../dto/usuario/cliente/cliente-perfil.dto";
import { ClientePerfilPublicoDto } from "../../../dto/usuario/cliente/cliente-perfil-publico.dto";

export class ClienteMapper {
    public static paraPerfilDto(usuario: Usuario) : ClientePerfilDto {
        return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            whatsapp: usuario.whatsapp,
            localizacaoCidade: usuario.localizacaoCidade,
            localizacaoCep: usuario.localizacaoCep,
            reputacao_flag_cancelamento: usuario.reputacao_flag_cancelamento,
            ativo: usuario.ativo
        }
    }

    public static paraPerfilPublicoDto(usuario: Usuario) : ClientePerfilPublicoDto {
        return {
            nome: usuario.nome,
            whatsapp: usuario.whatsapp,
            reputacao_flag_cancelamento: usuario.reputacao_flag_cancelamento
        }
    }
}
