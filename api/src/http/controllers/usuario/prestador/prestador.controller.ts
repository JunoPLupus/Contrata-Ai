import { CadastrarPrestadorUseCase } from "../../../../domain/use-cases/usuario/prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import { BuscarPrestadorPorIdUseCase } from "../../../../domain/use-cases/usuario/prestador/buscar-prestador-por-id/buscar-prestador-por-id.use-case";
import { AtualizarPrestadorUseCase } from "../../../../domain/use-cases/usuario/prestador/atualizar-prestador/atualizar-prestador.use-case";
import { InativarPrestadorUseCase } from "../../../../domain/use-cases/usuario/prestador/inativar-prestador/inativar-prestador.use-case";
import { AtivarPrestadorUseCase } from "../../../../domain/use-cases/usuario/prestador/ativar-prestador/ativar-prestador.use-case";
import { AtualizarPrestadorDTO } from "../../../../domain/dto/prestador/atualizar-prestador.dto";
import { PrestadorRespostaCadastroDTO } from "../../../dto/usuario/prestador/prestador-resposta-cadastro.dto";
import { Prestador } from "../../../../domain/entities/prestador/prestador.entity";
import { PrestadorMapper } from "../../../mappers/usuario/prestador/prestador.mapper";

import { Request, Response } from 'express';

export class PrestadorController {
    constructor(
        private readonly cadastrarPrestadorUseCase : CadastrarPrestadorUseCase,
        private readonly buscarPrestadorPorIdUseCase : BuscarPrestadorPorIdUseCase,
        private readonly atualizarPrestadorUseCase : AtualizarPrestadorUseCase,
        private readonly inativarPrestadorUseCase : InativarPrestadorUseCase,
        private readonly ativarPrestadorUseCase : AtivarPrestadorUseCase
    ) {}

    /**
     * Cadastra um novo prestador, vinculado ao cliente logado.
     * @param request - `idCliente` obtido do JWT.
     * @param response - 201 com o prestador registrado.
     */
    public async cadastrar(request: Request, response: Response) : Promise<void> {
        const prestadorCadastroDTO = {
            idCliente : request.user!.idCliente
        }

        const prestadorCadastrado : Prestador = await this.cadastrarPrestadorUseCase.execute(prestadorCadastroDTO);
        const prestadorRespostaCadastroDTO : PrestadorRespostaCadastroDTO = {
            id : prestadorCadastrado.id,
            idCliente : prestadorCadastrado.idCliente
        }
        response.status(201).json(prestadorRespostaCadastroDTO);
    }

    /**
     * Retorna os dados completos do prestador logado.
     * @param request - `idPrestador` obtido do JWT.
     * @param response - 200 com o perfil completo do prestador.
     */
    public async buscarLogado(request: Request, response: Response) : Promise<void> {
        const prestador = await this.buscarPrestadorPorIdUseCase.execute(request.user!.idPrestador!)

        response.status(200).json(PrestadorMapper.paraPerfilCompletoDto(prestador))
    }

    /**
     * Retorna os dados públicos de um prestador pelo `id`.
     * @param request - Path param `id`.
     * @param response - 200 com o perfil público do prestador.
     */
    public async buscarPorId(request: Request, response: Response) : Promise<void> {
        const id = request.params.id as string

        const prestador = await this.buscarPrestadorPorIdUseCase.execute(id)

        response.status(200).json(PrestadorMapper.paraPerfilPublicoDto(prestador))
    }

    /**
     * Atualiza os dados do prestador logado.
     * @param request - `idPrestador` obtido do JWT. Body: objeto AtualizarPrestadorDTO.
     * @param response - 200 com os dados atualizados.
     */
    public async atualizar(request: Request, response: Response) : Promise<void> {
        const dadosAtualizacao : AtualizarPrestadorDTO = request.body as unknown as AtualizarPrestadorDTO

        const prestadorAtualizado = await this.atualizarPrestadorUseCase.execute(request.user!.idPrestador!, dadosAtualizacao)

        response.status(200).json(PrestadorMapper.paraAtualizadoDto(prestadorAtualizado))
    }

    /**
     * Torna o perfil do prestador logado inativo permanentemente.
     * @param request - `idPrestador` obtido do JWT.
     * @param response - 204 sem conteúdo.
     */
    public async inativar(request: Request, response: Response) : Promise<void> {
        await this.inativarPrestadorUseCase.execute(request.user!.idPrestador!)

        response.status(204).send()
    }

    /**
     * Reativa o perfil do prestador logado previamente inativado.
     * @param request - `idPrestador` obtido do JWT.
     * @param response - 204 sem conteúdo.
     */
    public async ativar(request: Request, response: Response) : Promise<void> {
        await this.ativarPrestadorUseCase.execute(request.user!.idPrestador!)

        response.status(204).send()
    }
}
