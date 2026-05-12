import { Usuario } from "../../entities/usuario/usuario.entity";

export type UsuarioCadastroDTO = Pick<Usuario, 'nome' | 'email' | 'senha' | 'perfis'>