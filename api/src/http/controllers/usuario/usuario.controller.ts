import { CadastrarUsuarioUseCase } from "../../../domain/use-cases/usuario/cadastrar-usuario/cadastrar-usuario.use-case";
import { VerificarEmailUseCase } from "../../../domain/use-cases/usuario/verificar-email/verificar-email.use-case";
import { UsuarioCadastroDTO } from "../../../domain/dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioRespostaCadastroDto } from "../../dto/usuario/usuario-resposta-cadastro.dto";

import { Request, Response } from 'express';

export class UsuarioController {
    constructor(private readonly cadastrarUsuarioUseCase: CadastrarUsuarioUseCase,
                private readonly verificarEmailUseCase: VerificarEmailUseCase) {}

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
        const resposta: UsuarioRespostaCadastroDto = {
            id: usuarioEncontrado.id,
            nome: usuarioEncontrado.nome,
            email: usuarioEncontrado.email,
            perfis: usuarioEncontrado.perfis
        }
        response.status(200).json(resposta)
    }

    /**
     * Cadastra um novo usuário.
     * @param request - Body: objeto UsuarioCadastroDTO.
     * @param response - 201 com o usuário registrado.
     */
    public async cadastrar(request: Request, response: Response): Promise<void> {
        const usuarioCadastroDTO : UsuarioCadastroDTO = request.body as unknown as UsuarioCadastroDTO

        const usuarioCadastrado : Usuario = await this.cadastrarUsuarioUseCase.execute(usuarioCadastroDTO)
        const usuarioRespostaCadastroDTO : UsuarioRespostaCadastroDto = {
            id: usuarioCadastrado.id,
            nome: usuarioCadastrado.nome,
            email: usuarioCadastrado.email,
            perfis: usuarioCadastrado.perfis
        }
        response.status(201).json(usuarioRespostaCadastroDTO)
    }
}