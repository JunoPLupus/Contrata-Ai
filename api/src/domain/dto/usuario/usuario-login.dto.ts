import { Usuario } from "../../entities/usuario/usuario.entity";

export type UsuarioLoginDTO = Pick< Usuario, 'email' | 'senha' >