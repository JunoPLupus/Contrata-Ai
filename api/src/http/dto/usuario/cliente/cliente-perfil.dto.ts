import { Usuario } from "../../../../domain/entities/usuario/usuario.entity";

export type ClientePerfilDto = Pick<Usuario, 'id' | 'nome' | 'email' | 'telefone' | 'whatsapp' | 'localizacaoCidade' | 'localizacaoCep' | 'reputacao_flag_cancelamento' | 'ativo'>