import { Usuario } from "../../../domain/entities/usuario/usuario.entity";

export type UsuarioRespostaCadastroDto = Pick< Usuario, 'id' | 'nome' | 'email' >