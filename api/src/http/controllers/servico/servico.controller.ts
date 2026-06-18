import { Request, Response } from 'express';

import { CadastrarServicoUseCase } from "../../../domain/use-cases/servico/cadastrar-servico/cadastrar-servico.use-case";
import { ServicoCadastroDTO } from "../../../domain/dto/servico/servico-cadastro.dto";
import { ServicoRespostaCadastroDTO } from "../../dto/servico/servico-resposta-cadastro.dto";
import { Servico } from "../../../domain/entities/servico/servico.entity";

export class ServicoController {
    constructor(private readonly cadastrarServicoUseCase: CadastrarServicoUseCase) {}

    /**
     * Cadastra um novo serviço vinculado ao prestador autenticado.
     * @param request - Body: campos do serviço sem `idPrestador`. Token JWT: `idPrestador`.
     * @param response - 201 com o serviço cadastrado sem o `idPrestador`.
     */
    public async cadastrar(request: Request, response: Response): Promise<void> {
        const servicoCadastroDTO: ServicoCadastroDTO = {
            idPrestador: request.user!.idPrestador!,
            idCategoria: request.body.idCategoria,
            descricao: request.body.descricao,
            precoMin: request.body.precoMin,
            precoMax: request.body.precoMax,
            prazoMedioDias: request.body.prazoMedioDias
        }

        const servicoCadastrado: Servico = await this.cadastrarServicoUseCase.execute(servicoCadastroDTO)

        const servicoRespostaCadastroDTO: ServicoRespostaCadastroDTO = {
            id: servicoCadastrado.id,
            idCategoria: servicoCadastrado.idCategoria,
            descricao: servicoCadastrado.descricao,
            precoMin: servicoCadastrado.precoMin,
            precoMax: servicoCadastrado.precoMax,
            prazoMedioDias: servicoCadastrado.prazoMedioDias
        }

        response.status(201).json(servicoRespostaCadastroDTO)
    }
}
