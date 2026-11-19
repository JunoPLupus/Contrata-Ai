import { Usuario } from "../../../../domain/entities/usuario/usuario.entity";

export type ClientePerfilPublicoDto = Pick<Usuario, 'nome' | 'reputacao_flag_cancelamento'>