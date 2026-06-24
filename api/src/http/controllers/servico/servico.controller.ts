import { Request, Response } from 'express';

import { CadastrarServicoUseCase } from "../../../domain/use-cases/servico/cadastrar-servico/cadastrar-servico.use-case";
import { BuscarServicosPrestadorLogadoUseCase } from "../../../domain/use-cases/servico/buscar-servicos-prestador-logado/buscar-servicos-prestador-logado.use-case";
import { BuscarServicoPorIdUseCase } from "../../../domain/use-cases/servico/buscar-servico-por-id/buscar-servico-por-id.use-case";
import { AtualizarServicoUseCase } from "../../../domain/use-cases/servico/atualizar-servico/atualizar-servico.use-case";
import { DeletarServicoUseCase } from "../../../domain/use-cases/servico/deletar-servico/deletar-servico.use-case";
import { ServicoCadastroDTO } from "../../../domain/dto/servico/servico-cadastro.dto";
import { ServicoAtualizacaoDTO } from "../../../domain/dto/servico/servico-atualizacao.dto";
import { ServicoMapper } from "../../mappers/servico/servico.mapper";

export class ServicoController {
    constructor(
        private readonly cadastrarServicoUseCase: CadastrarServicoUseCase,
        private readonly buscarServicosPrestadorLogadoUseCase: BuscarServicosPrestadorLogadoUseCase,
        private readonly buscarServicoPorIdUseCase: BuscarServicoPorIdUseCase,
        private readonly atualizarServicoUseCase: AtualizarServicoUseCase,
        private readonly deletarServicoUseCase: DeletarServicoUseCase
    ) {}

    public async cadastrar(request: Request, response: Response): Promise<void> {
        const servicoCadastroDTO: ServicoCadastroDTO = {
            idPrestador: request.user!.idPrestador!,
            idCategoria: request.body.idCategoria,
            descricao: request.body.descricao,
            precoMin: request.body.precoMin,
            precoMax: request.body.precoMax,
            prazoMedioDias: request.body.prazoMedioDias
        }
        const servico = await this.cadastrarServicoUseCase.execute(servicoCadastroDTO)
        response.status(201).json(ServicoMapper.paraRespostaDTO(servico))
    }

    public async buscarTodos(request: Request, response: Response): Promise<void> {
        const servicos = await this.buscarServicosPrestadorLogadoUseCase.execute(request.user!.idPrestador!)
        response.status(200).json(ServicoMapper.paraListaRespostaDTO(servicos))
    }

    public async buscarPorId(request: Request, response: Response): Promise<void> {
        const servico = await this.buscarServicoPorIdUseCase.execute(
            request.params.id as string,
            request.user!.idPrestador!
        )
        response.status(200).json(ServicoMapper.paraRespostaDTO(servico))
    }

    public async atualizar(request: Request, response: Response): Promise<void> {
        const servicoAtualizacaoDTO: ServicoAtualizacaoDTO = {
            idCategoria: request.body.idCategoria,
            descricao: request.body.descricao,
            precoMin: request.body.precoMin,
            precoMax: request.body.precoMax,
            prazoMedioDias: request.body.prazoMedioDias
        }
        const servico = await this.atualizarServicoUseCase.execute(
            request.params.id as string,
            request.user!.idPrestador!,
            servicoAtualizacaoDTO
        )
        response.status(200).json(ServicoMapper.paraRespostaDTO(servico))
    }

    public async deletar(request: Request, response: Response): Promise<void> {
        await this.deletarServicoUseCase.execute(request.params.id as string, request.user!.idPrestador!)
        response.status(204).send()
    }
}
