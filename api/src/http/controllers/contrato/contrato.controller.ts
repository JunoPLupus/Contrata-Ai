import { Request, Response } from 'express';

import { BuscarContratosDoUsuarioUseCase } from "../../../domain/use-cases/contrato/buscar-contratos-do-usuario/buscar-contratos-do-usuario.use-case";
import { BuscarContratoPorIdUseCase } from "../../../domain/use-cases/contrato/buscar-contrato-por-id/buscar-contrato-por-id.use-case";
import { AtualizarContratoUseCase } from "../../../domain/use-cases/contrato/atualizar-contrato/atualizar-contrato.use-case";
import { AtualizarStatusContratoUseCase } from "../../../domain/use-cases/contrato/atualizar-status-contrato/atualizar-status-contrato.use-case";
import { ConcluirContratoUseCase } from "../../../domain/use-cases/contrato/concluir-contrato/concluir-contrato.use-case";
import { CancelarContratoUseCase } from "../../../domain/use-cases/contrato/cancelar-contrato/cancelar-contrato.use-case";
import { RelatarProblemaContratoUseCase } from "../../../domain/use-cases/contrato/relatar-problema-contrato/relatar-problema-contrato.use-case";
import { ContratoAtualizacaoDTO } from "../../../domain/dto/contrato/contrato-atualizacao.dto";
import { ContratoStatusDTO } from "../../../domain/dto/contrato/contrato-status.dto";
import { ContratoCancelamentoDTO } from "../../../domain/dto/contrato/contrato-cancelamento.dto";
import { ContratoProblemaDTO } from "../../../domain/dto/contrato/contrato-problema.dto";
import { ContratoMapper } from "../../mappers/contrato/contrato.mapper";

export class ContratoController {
    constructor(
        private readonly buscarContratosDoUsuarioUseCase: BuscarContratosDoUsuarioUseCase,
        private readonly buscarContratoPorIdUseCase: BuscarContratoPorIdUseCase,
        private readonly atualizarContratoUseCase: AtualizarContratoUseCase,
        private readonly atualizarStatusContratoUseCase: AtualizarStatusContratoUseCase,
        private readonly concluirContratoUseCase: ConcluirContratoUseCase,
        private readonly cancelarContratoUseCase: CancelarContratoUseCase,
        private readonly relatarProblemaContratoUseCase: RelatarProblemaContratoUseCase
    ) {}

    public async buscarDoUsuario(request: Request, response: Response): Promise<void> {
        const contratos = await this.buscarContratosDoUsuarioUseCase.execute(
            request.user!.idCliente,
            request.user!.idPrestador
        )
        response.status(200).json(ContratoMapper.paraListaRespostaDTO(contratos))
    }

    public async buscarPorId(request: Request, response: Response): Promise<void> {
        const contrato = await this.buscarContratoPorIdUseCase.execute(
            request.params.id as string,
            request.user!.idCliente,
            request.user!.idPrestador
        )
        response.status(200).json(ContratoMapper.paraRespostaDTO(contrato))
    }

    public async atualizar(request: Request, response: Response): Promise<void> {
        const dto: ContratoAtualizacaoDTO = {
            dataInicioEstimada: request.body.dataInicioEstimada ? new Date(request.body.dataInicioEstimada) : undefined,
            prazoEstimado: request.body.prazoEstimado ? new Date(request.body.prazoEstimado) : undefined,
        }
        const contrato = await this.atualizarContratoUseCase.execute(
            request.params.id as string,
            request.user!.idPrestador!,
            dto
        )
        response.status(200).json(ContratoMapper.paraRespostaDTO(contrato))
    }

    public async atualizarStatus(request: Request, response: Response): Promise<void> {
        const dto: ContratoStatusDTO = {
            status: request.body.status,
        }
        const contrato = await this.atualizarStatusContratoUseCase.execute(
            request.params.id as string,
            request.user!.idPrestador!,
            dto
        )
        response.status(200).json(ContratoMapper.paraRespostaDTO(contrato))
    }

    public async concluir(request: Request, response: Response): Promise<void> {
        const contrato = await this.concluirContratoUseCase.execute(
            request.params.id as string,
            request.user!.idCliente,
            request.user!.idPrestador
        )
        response.status(200).json(ContratoMapper.paraRespostaDTO(contrato))
    }

    public async cancelar(request: Request, response: Response): Promise<void> {
        const dto: ContratoCancelamentoDTO = {
            motivo: request.body.motivo,
        }
        const contrato = await this.cancelarContratoUseCase.execute(
            request.params.id as string,
            request.user!.idCliente,
            request.user!.idPrestador,
            dto
        )
        response.status(200).json(ContratoMapper.paraRespostaDTO(contrato))
    }

    public async relatarProblema(request: Request, response: Response): Promise<void> {
        const dto: ContratoProblemaDTO = {
            tipo: request.body.tipo,
            descricao: request.body.descricao,
        }
        const contrato = await this.relatarProblemaContratoUseCase.execute(
            request.params.id as string,
            request.user!.idCliente,
            dto
        )
        response.status(200).json(ContratoMapper.paraRespostaDTO(contrato))
    }
}
