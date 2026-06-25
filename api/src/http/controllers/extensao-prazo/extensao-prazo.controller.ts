import { Request, Response } from 'express';

import { SolicitarExtensaoPrazoUseCase } from "../../../domain/use-cases/extensao-prazo/solicitar-extensao-prazo/solicitar-extensao-prazo.use-case";
import { ResponderExtensaoPrazoUseCase } from "../../../domain/use-cases/extensao-prazo/responder-extensao-prazo/responder-extensao-prazo.use-case";
import { ExtensaoPrazoCadastroDTO } from "../../../domain/dto/extensao-prazo/extensao-prazo-cadastro.dto";
import { ExtensaoPrazoDecisaoDTO } from "../../../domain/dto/extensao-prazo/extensao-prazo-decisao.dto";
import { ExtensaoPrazoMapper } from "../../mappers/extensao-prazo/extensao-prazo.mapper";

export class ExtensaoPrazoController {
    constructor(
        private readonly solicitarExtensaoPrazoUseCase: SolicitarExtensaoPrazoUseCase,
        private readonly responderExtensaoPrazoUseCase: ResponderExtensaoPrazoUseCase
    ) {}

    public async solicitarExtensao(request: Request, response: Response): Promise<void> {
        const dto: ExtensaoPrazoCadastroDTO = {
            novoPrazo: new Date(request.body.novoPrazo),
            justificativa: request.body.justificativa,
        }
        const extensao = await this.solicitarExtensaoPrazoUseCase.execute(
            request.params.id as string,
            request.user!.idPrestador!,
            dto
        )
        response.status(201).json(ExtensaoPrazoMapper.paraRespostaDTO(extensao))
    }

    public async responderExtensao(request: Request, response: Response): Promise<void> {
        const dto: ExtensaoPrazoDecisaoDTO = {
            decisao: request.body.decisao,
        }
        const extensao = await this.responderExtensaoPrazoUseCase.execute(
            request.params.id as string,
            request.params.idExtensao as string,
            request.user!.idCliente,
            dto
        )
        response.status(200).json(ExtensaoPrazoMapper.paraRespostaDTO(extensao))
    }
}
