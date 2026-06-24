import { Request, Response } from 'express';

import { CadastrarSolicitacaoUseCase } from "../../../domain/use-cases/solicitacao/cadastrar-solicitacao/cadastrar-solicitacao.use-case";
import { BuscarSolicitacoesClienteLogadoUseCase } from "../../../domain/use-cases/solicitacao/buscar-solicitacoes-cliente-logado/buscar-solicitacoes-cliente-logado.use-case";
import { BuscarSolicitacoesDisponiveisPrestadorUseCase } from "../../../domain/use-cases/solicitacao/buscar-solicitacoes-disponiveis-prestador/buscar-solicitacoes-disponiveis-prestador.use-case";
import { BuscarSolicitacaoPorIdUseCase } from "../../../domain/use-cases/solicitacao/buscar-solicitacao-por-id/buscar-solicitacao-por-id.use-case";
import { AtualizarSolicitacaoUseCase } from "../../../domain/use-cases/solicitacao/atualizar-solicitacao/atualizar-solicitacao.use-case";
import { SolicitacaoCadastroDTO } from "../../../domain/dto/solicitacao/solicitacao-cadastro.dto";
import { SolicitacaoAtualizacaoDTO } from "../../../domain/dto/solicitacao/solicitacao-atualizacao.dto";
import { SolicitacaoMapper } from "../../mappers/solicitacao/solicitacao.mapper";

export class SolicitacaoController {
    constructor(
        private readonly cadastrarSolicitacaoUseCase: CadastrarSolicitacaoUseCase,
        private readonly buscarSolicitacoesClienteLogadoUseCase: BuscarSolicitacoesClienteLogadoUseCase,
        private readonly buscarSolicitacoesDisponiveisPrestadorUseCase: BuscarSolicitacoesDisponiveisPrestadorUseCase,
        private readonly buscarSolicitacaoPorIdUseCase: BuscarSolicitacaoPorIdUseCase,
        private readonly atualizarSolicitacaoUseCase: AtualizarSolicitacaoUseCase
    ) {}

    public async cadastrar(request: Request, response: Response): Promise<void> {
        const dto: SolicitacaoCadastroDTO = {
            idCliente: request.user!.idCliente,
            idCategoria: request.body.idCategoria,
            idPrestadorDireto: request.body.idPrestadorDireto,
            descricao: request.body.descricao
        }
        const solicitacao = await this.cadastrarSolicitacaoUseCase.execute(dto)
        response.status(201).json(SolicitacaoMapper.paraRespostaDTO(solicitacao))
    }

    public async buscarDoCliente(request: Request, response: Response): Promise<void> {
        const solicitacoes = await this.buscarSolicitacoesClienteLogadoUseCase.execute(request.user!.idCliente)
        response.status(200).json(SolicitacaoMapper.paraListaRespostaDTO(solicitacoes))
    }

    public async buscarDisponiveis(request: Request, response: Response): Promise<void> {
        const idCategoria = request.query.idCategoria as string | undefined
        const solicitacoes = await this.buscarSolicitacoesDisponiveisPrestadorUseCase.execute(
            request.user!.idPrestador!,
            request.user!.idCliente,
            idCategoria
        )
        response.status(200).json(SolicitacaoMapper.paraListaRespostaDTO(solicitacoes))
    }

    public async buscarPorId(request: Request, response: Response): Promise<void> {
        const solicitacao = await this.buscarSolicitacaoPorIdUseCase.execute(
            request.params.id as string,
            request.user!.idCliente,
            request.user!.idPrestador
        )
        response.status(200).json(SolicitacaoMapper.paraRespostaDTO(solicitacao))
    }

    public async atualizar(request: Request, response: Response): Promise<void> {
        const dto: SolicitacaoAtualizacaoDTO = {
            descricao: request.body.descricao,
            status: request.body.status
        }
        const solicitacao = await this.atualizarSolicitacaoUseCase.execute(
            request.params.id as string,
            request.user!.idCliente,
            dto
        )
        response.status(200).json(SolicitacaoMapper.paraRespostaDTO(solicitacao))
    }
}
