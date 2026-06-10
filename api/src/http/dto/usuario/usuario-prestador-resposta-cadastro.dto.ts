import { Usuario } from "../../../domain/entities/usuario/usuario.entity";

export type UsuarioPrestadorRespostaCadastroDTO = Pick<Usuario, 'id' | 'idPrestador' | 'nome' | 'email' >
