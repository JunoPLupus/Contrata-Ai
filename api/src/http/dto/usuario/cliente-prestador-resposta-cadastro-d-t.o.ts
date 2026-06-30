import { Usuario } from "../../../domain/entities/usuario/usuario.entity";

export type ClientePrestadorRespostaCadastroDTO = Pick<Usuario, 'id' | 'idPrestador' | 'nome' | 'email' >
