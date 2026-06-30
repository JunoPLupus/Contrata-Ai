import { VerificarEmailUseCase } from "../../../domain/use-cases/usuario/shared/verificar-email/verificar-email.use-case";
import { InativarUsuarioUseCase } from "../../../domain/use-cases/usuario/shared/inativar-usuario/inativar-usuario.use-case";
import { ClienteRespostaCadastroDto } from "../../dto/usuario/cliente/cliente-resposta-cadastro.dto";

import { Request, Response } from 'express';

export class UsuarioController {
    constructor(
        private readonly verificarEmailUseCase: VerificarEmailUseCase,
        private readonly inativarUsuarioUseCase: InativarUsuarioUseCase
    ) {}

    /**
     * Busca um usuário pelo endereço de e-mail.
     * @param request - Query string: `?email=fulano@gmail.com`
     * @param response - 200 com o usuário encontrado, ou 404 se não existir.
     */
    public async buscarPorEmail(request: Request, response: Response): Promise<void> {
        const emailRecebido : string = request.query.email as string

        const usuarioEncontrado = await this.verificarEmailUseCase.execute(emailRecebido)
        if (!usuarioEncontrado) {
            response.status(404).json(null)
            return
        }
        const resposta: ClienteRespostaCadastroDto = {
            id: usuarioEncontrado.id,
            nome: usuarioEncontrado.nome,
            email: usuarioEncontrado.email
        }
        response.status(200).json(resposta)
    }

    /**
     * Torna o perfil do usuário logado (cliente/prestador) inativo permanentemente.
     * @param request - `idCliente` obtido do JWT.
     * @param response - 204 sem conteúdo.
     */
    public async inativar(request: Request, response: Response): Promise<void> {
        await this.inativarUsuarioUseCase.execute(request.user!.idCliente)

        response.status(204).send()
    }
}
