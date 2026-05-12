import { Usuario } from "../entities/usuario/usuario.entity";

export abstract class IUsuarioRepository {
    abstract buscarPorEmail(email : string) : Promise< Usuario | null >;
    abstract inserir(usuario : Usuario) : Promise< Usuario >;
}