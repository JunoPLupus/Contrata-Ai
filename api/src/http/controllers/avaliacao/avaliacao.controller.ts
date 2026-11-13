import { Request, Response } from 'express';

import { CadastrarAvaliacaoUseCase } from "../../../domain/use-cases/avaliacao/cadastrar-avaliacao/cadastrar-avaliacao.use-case";
import { BuscarAvaliacaoPorIdUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacao-por-id/buscar-avaliacao-por-id.use-case";
import { BuscarAvaliacoesDoContratoUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacoes-do-contrato/buscar-avaliacoes-do-contrato.use-case";
import { BuscarAvaliacoesDoClienteLogadoUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente-logado/buscar-avaliacoes-do-cliente-logado.use-case";
import { BuscarAvaliacoesDoPrestadorUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacoes-do-prestador/buscar-avaliacoes-do-prestador.use-case";
import { BuscarAvaliacoesDoClienteUseCase } from "../../../domain/use-cases/avaliacao/buscar-avaliacoes-do-cliente/buscar-avaliacoes-do-cliente.use-case";
import { AtualizarAvaliacaoUseCase } from "../../../domain/use-cases/avaliacao/atualizar-avaliacao/atualizar-avaliacao.use-case";
import { DeletarAvaliacaoUseCase } from "../../../domain/use-cases/avaliacao/deletar-avaliacao/deletar-avaliacao.use-case";
import { AvaliacaoCadastroDTO } from "../../../domain/dto/avaliacao/avaliacao-cadastro.dto";
import { AvaliacaoAtualizacaoDTO } from "../../../domain/dto/avaliacao/avaliacao-atualizacao.dto";
import { AvaliacaoMapper } from "../../mappers/avaliacao/avaliacao.mapper";

export class AvaliacaoController {
    constructor(
        private readonly cadastrarAvaliacaoUseCase: CadastrarAvaliacaoUseCase,
        private readonly buscarAvaliacaoPorIdUseCase: BuscarAvaliacaoPorIdUseCase,
        private readonly buscarAvaliacoesDoContratoUseCase: BuscarAvaliacoesDoContratoUseCase,
        private readonly buscarAvaliacoesDoClienteLogadoUseCase: BuscarAvaliacoesDoClienteLogadoUseCase,
        private readonly buscarAvaliacoesDoPrestadorUseCase: BuscarAvaliacoesDoPrestadorUseCase,
        private readonly atualizarAvaliacaoUseCase: AtualizarAvaliacaoUseCase,
        private readonly deletarAvaliacaoUseCase: DeletarAvaliacaoUseCase,
        private readonly buscarAvaliacoesDoClienteUseCase: BuscarAvaliacoesDoClienteUseCase
    ) {}

    public async cadastrar(request: Request, response: Response): Promise<void> {
        const dto: AvaliacaoCadastroDTO = {
            idContrato: request.body.idContrato,
            nota: request.body.nota,
            comentario: request.body.comentario,
            anonima: request.body.anonima,
        }
        const avaliacao = await this.cadastrarAvaliacaoUseCase.execute(dto, request.user!.idCliente, request.user!.idPrestador)
        response.status(201).json(AvaliacaoMapper.paraRespostaDTO(avaliacao))
    }

    public async buscarPorId(request: Request, response: Response): Promise<void> {
        const avaliacao = await this.buscarAvaliacaoPorIdUseCase.execute(request.params.id as string)
        response.status(200).json(AvaliacaoMapper.paraRespostaPublicaDTO(avaliacao))
    }

    public async buscarDoContrato(request: Request, response: Response): Promise<void> {
        const avaliacoes = await this.buscarAvaliacoesDoContratoUseCase.execute(request.params.idContrato as string)
        response.status(200).json(AvaliacaoMapper.paraListaRespostaPublicaDTO(avaliacoes))
    }

    public async buscarDoClienteLogado(request: Request, response: Response): Promise<void> {
        const avaliacoes = await this.buscarAvaliacoesDoClienteLogadoUseCase.execute(request.user!.idCliente)
        response.status(200).json(AvaliacaoMapper.paraListaRespostaDTO(avaliacoes))
    }

    public async buscarDoPrestador(request: Request, response: Response): Promise<void> {
        const resultado = await this.buscarAvaliacoesDoPrestadorUseCase.execute(request.params.idPrestador as string)
        response.status(200).json(AvaliacaoMapper.paraRespostaResumoDTO(resultado))
    }

    public async buscarDoCliente(request: Request, response: Response): Promise<void> {
        const resultado = await this.buscarAvaliacoesDoClienteUseCase.execute(
            request.params.idCliente as string,
            request.user!.idCliente,
            request.user!.idPrestador
        )
        response.status(200).json(AvaliacaoMapper.paraRespostaResumoDTO(resultado))
    }

    public async atualizar(request: Request, response: Response): Promise<void> {
        const dto: AvaliacaoAtualizacaoDTO = {
            nota: request.body.nota,
            comentario: request.body.comentario,
            anonima: request.body.anonima,
        }
        const avaliacao = await this.atualizarAvaliacaoUseCase.execute(
            request.params.id as string,
            dto,
            request.user!.idCliente,
            request.user!.idPrestador
        )
        response.status(200).json(AvaliacaoMapper.paraRespostaDTO(avaliacao))
    }

    public async deletar(request: Request, response: Response): Promise<void> {
        await this.deletarAvaliacaoUseCase.execute(request.params.id as string, request.user!.idCliente, request.user!.idPrestador)
        response.status(204).send()
    }
}
