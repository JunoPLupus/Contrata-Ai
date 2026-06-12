import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { RecursoNaoEncontradoError } from "../../../../errors/recurso-nao-encontrado.error";

export class InativarUsuarioUseCase {
    constructor(private readonly usuarioRepository: IUsuarioRepository) {}

    /**
     * Torna o perfil de um usuário (cliente/prestador) inativo permanentemente.
     * @param id - `id` do usuário a ser inativado.
     * @throws {RecursoNaoEncontradoError} se não existir usuário com esse `id`.
     */
    async execute(id: string): Promise<void> {
        const usuario = await this.usuarioRepository.buscarPorId(id)

        if (usuario == null) throw new RecursoNaoEncontradoError('Usuário')

        usuario.ativo = false
        await this.usuarioRepository.atualizar(usuario)
    }
}
