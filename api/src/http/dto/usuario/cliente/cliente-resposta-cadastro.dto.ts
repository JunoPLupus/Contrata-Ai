import { Usuario } from "../../../../domain/entities/usuario/usuario.entity";

export type ClienteRespostaCadastroDto = Pick< Usuario, 'id' | 'nome' | 'email' >