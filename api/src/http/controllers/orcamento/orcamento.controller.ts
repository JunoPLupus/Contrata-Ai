import { Request, Response } from 'express';

import { CadastrarOrcamentoUseCase } from "../../../domain/use-cases/orcamento/cadastrar-orcamento/cadastrar-orcamento.use-case";
import { BuscarOrcamentosPrestadorLogadoUseCase } from "../../../domain/use-cases/orcamento/buscar-orcamentos-prestador-logado/buscar-orcamentos-prestador-logado.use-case";
import { BuscarOrcamentoPorIdUseCase } from "../../../domain/use-cases/orcamento/buscar-orcamento-por-id/buscar-orcamento-por-id.use-case";
import { AtualizarOrcamentoUseCase } from "../../../domain/use-cases/orcamento/atualizar-orcamento/atualizar-orcamento.use-case";
import { AceitarOrcamentoUseCase } from "../../../domain/use-cases/orcamento/aceitar-orcamento/aceitar-orcamento.use-case";
import { OrcamentoCadastroDTO } from "../../../domain/dto/orcamento/orcamento-cadastro.dto";
import { OrcamentoAtualizacaoDTO } from "../../../domain/dto/orcamento/orcamento-atualizacao.dto";
import { OrcamentoMapper } from "../../mappers/orcamento/orcamento.mapper";

export class OrcamentoController {
    constructor(
        private readonly cadastrarOrcamentoUseCase: CadastrarOrcamentoUseCase,
        private readonly buscarOrcamentosPrestadorLogadoUseCase: BuscarOrcamentosPrestadorLogadoUseCase,
        private readonly buscarOrcamentoPorIdUseCase: BuscarOrcamentoPorIdUseCase,
        private readonly atualizarOrcamentoUseCase: AtualizarOrcamentoUseCase,
        private readonly aceitarOrcamentoUseCase: AceitarOrcamentoUseCase
    ) {}

    public async cadastrar(request: Request, response: Response): Promise<void> {
        const dto: OrcamentoCadastroDTO = {
            idSolicitacao: request.body.idSolicitacao,
            idPrestador: request.user!.idPrestador!,
            valor: request.body.valor,
            prazoDias: request.body.prazoDias
        }
        const orcamento = await this.cadastrarOrcamentoUseCase.execute(dto)
        response.status(201).json(OrcamentoMapper.paraRespostaDTO(orcamento))
    }

    public async buscarDoPrestador(request: Request, response: Response): Promise<void> {
        const orcamentos = await this.buscarOrcamentosPrestadorLogadoUseCase.execute(request.user!.idPrestador!)
        response.status(200).json(OrcamentoMapper.paraListaRespostaDTO(orcamentos))
    }

    public async buscarPorId(request: Request, response: Response): Promise<void> {
        const orcamento = await this.buscarOrcamentoPorIdUseCase.execute(
            request.params.id as string,
            request.user!.idCliente,
            request.user!.idPrestador
        )
        response.status(200).json(OrcamentoMapper.paraRespostaDTO(orcamento))
    }

    public async atualizar(request: Request, response: Response): Promise<void> {
        const dto: OrcamentoAtualizacaoDTO = {
            valor: request.body.valor,
            prazoDias: request.body.prazoDias,
            status: request.body.status
        }
        const orcamento = await this.atualizarOrcamentoUseCase.execute(
            request.params.id as string,
            request.user!.idPrestador!,
            dto
        )
        response.status(200).json(OrcamentoMapper.paraRespostaDTO(orcamento))
    }

    public async aceitar(request: Request, response: Response): Promise<void> {
        const orcamento = await this.aceitarOrcamentoUseCase.execute(
            request.params.id as string,
            request.user!.idCliente
        )
        response.status(200).json(OrcamentoMapper.paraRespostaDTO(orcamento))
    }
}
