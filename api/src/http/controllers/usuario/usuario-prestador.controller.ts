import { Request, Response } from 'express';

import { CadastrarClientePrestadorUseCase } from "../../../domain/use-cases/usuario/cadastrar-cliente-prestador/cadastrar-cliente-prestador.use-case";
import { UsuarioCadastroDTO } from "../../../domain/dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../domain/entities/usuario/usuario.entity";
import { UsuarioPrestadorRespostaCadastroDTO } from "../../dto/usuario/usuario-prestador-resposta-cadastro.dto";

export class UsuarioPrestadorController {
    constructor(private readonly criarClientePrestadorUseCase: CadastrarClientePrestadorUseCase) {}

    /**
     * Cadastra um novo usuario com perfil cliente e prestador simultaneamente.
     * @param request - Body: objeto UsuarioCadastroDTO.
     * @param response - 201 com o usuario registrado e o `idPrestador` vinculado.
     */
    public async cadastrar(request: Request, response: Response): Promise<void> {
        const dto: UsuarioCadastroDTO = request.body as unknown as UsuarioCadastroDTO
        const usuario: Usuario = await this.criarClientePrestadorUseCase.execute(dto)
        const resposta: UsuarioPrestadorRespostaCadastroDTO = {
            id: usuario.id,
            idPrestador: usuario.idPrestador,
            nome: usuario.nome,
            email: usuario.email
        }
        response.status(201).json(resposta)
    }
}
