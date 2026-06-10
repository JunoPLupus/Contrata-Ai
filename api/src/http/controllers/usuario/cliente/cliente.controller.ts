import { CadastrarClienteUseCase } from "../../../../domain/use-cases/usuario/cliente/cadastrar-cliente/cadastrar-cliente.use-case";
import { UsuarioCadastroDTO } from "../../../../domain/dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../../domain/entities/usuario/usuario.entity";
import { ClienteRespostaCadastroDto } from "../../../dto/usuario/cliente/cliente-resposta-cadastro.dto";

import { Request, Response } from 'express';

export class ClienteController {
    constructor(private readonly cadastrarUsuarioUseCase: CadastrarClienteUseCase) {}

    /**
     * Cadastra um novo cliente.
     * @param request - Body: objeto UsuarioCadastroDTO.
     * @param response - 201 com o cliente registrado.
     */
    public async cadastrar(request: Request, response: Response): Promise<void> {
        const usuarioCadastroDTO : UsuarioCadastroDTO = request.body as unknown as UsuarioCadastroDTO

        const usuarioCadastrado : Usuario = await this.cadastrarUsuarioUseCase.execute(usuarioCadastroDTO)
        const usuarioRespostaCadastroDTO : ClienteRespostaCadastroDto = {
            id: usuarioCadastrado.id,
            nome: usuarioCadastrado.nome,
            email: usuarioCadastrado.email
        }
        response.status(201).json(usuarioRespostaCadastroDTO)
    }
}