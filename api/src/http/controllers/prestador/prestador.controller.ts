import { CadastrarPrestadorUseCase } from "../../../domain/use-cases/prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import { PrestadorRespostaCadastroDTO } from "../../dto/prestador/prestador-resposta-cadastro.dto";
import { Prestador } from "../../../domain/entities/prestador/prestador.entity";

import { Request, Response } from 'express';

export class PrestadorController {
    constructor(private readonly cadastrarPrestadorUseCase : CadastrarPrestadorUseCase) {}

    public async cadastrar(request: Request, response: Response) : Promise<void> {
        const idCliente = request.body.idCliente as string;

        const prestadorCadastrado : Prestador = await this.cadastrarPrestadorUseCase.execute(idCliente);
        const prestadorRespostaCadastroDTO : PrestadorRespostaCadastroDTO = {
            id : prestadorCadastrado.id,
            idCliente : prestadorCadastrado.idCliente
        }
        response.status(201).json(prestadorRespostaCadastroDTO);
    }
}