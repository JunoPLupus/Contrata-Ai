import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { Usuario } from "../../../../entities/usuario/usuario.entity";

export class VerificarEmailUseCase {
    constructor(private readonly usuarioRepository: IUsuarioRepository) {

    }

    async execute(email: string): Promise< Usuario | null > {
        return this.usuarioRepository.buscarPorEmail(email);
    }
}