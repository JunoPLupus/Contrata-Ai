import { CadastrarClienteUseCase } from "../../../../domain/use-cases/usuario/cliente/cadastrar-cliente/cadastrar-cliente.use-case";
import { BuscarClientePorIdUseCase } from "../../../../domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case";
import { AtualizarClienteUseCase } from "../../../../domain/use-cases/usuario/cliente/atualizar-cliente/atualizar-cliente.use-case";
import { UsuarioCadastroDTO } from "../../../../domain/dto/usuario/usuario-cadastro.dto";
import { AtualizarClienteDTO } from "../../../../domain/dto/usuario/atualizar-cliente.dto";
import { Usuario } from "../../../../domain/entities/usuario/usuario.entity";
import { ClienteRespostaCadastroDto } from "../../../dto/usuario/cliente/cliente-resposta-cadastro.dto";
import { ClienteMapper } from "../../../mappers/usuario/cliente/cliente.mapper";

import { Request, Response } from 'express';

export class ClienteController {
    constructor(
        private readonly cadastrarUsuarioUseCase: CadastrarClienteUseCase,
        private readonly buscarClientePorIdUseCase: BuscarClientePorIdUseCase,
        private readonly atualizarClienteUseCase: AtualizarClienteUseCase
    ) {}

    /**
     * Cadastra um novo cliente.
     * @param request - Body: objeto UsuarioCadastroDTO.
     * @param response - 201 com o cliente registrado.
     */
    public async cadastrar(request: Request, response: Response): Promise<void> {
        const usuarioCadastroDTO : UsuarioCadastroDTO = request.body as unknown as UsuarioCadastroDTO

        const usuarioCadastrado : Usuario = await this.cadastrarUsuarioUseCase.execute(usuarioCadastroDTO)
        const usuarioRespostaCadastroDTO : ClienteRespostaCadastroDto = {
            id: usuarioCadastrado.id,
            nome: usuarioCadastrado.nome,
            email: usuarioCadastrado.email
        }
        response.status(201).json(usuarioRespostaCadastroDTO)
    }

    /**
     * Retorna os dados completos do cliente logado.
     * @param request - `idCliente` obtido do JWT.
     * @param response - 200 com o perfil completo do cliente.
     */
    public async buscarLogado(request: Request, response: Response): Promise<void> {
        const cliente = await this.buscarClientePorIdUseCase.execute(request.user!.idCliente)

        response.status(200).json(ClienteMapper.paraPerfilDto(cliente))
    }

    /**
     * Retorna os dados de um cliente pelo `id`.
     * @param request - Path param `id`. `idCliente` do JWT usado para definir o formato da resposta.
     * @param response - 200 com o perfil completo (se `id` for o do próprio usuário logado) ou um subconjunto público.
     */
    public async buscarPorId(request: Request, response: Response): Promise<void> {
        const id = request.params.id as string

        const cliente = await this.buscarClientePorIdUseCase.execute(id)

        if (id === request.user!.idCliente) {
            response.status(200).json(ClienteMapper.paraPerfilDto(cliente))
            return
        }

        response.status(200).json(ClienteMapper.paraPerfilPublicoDto(cliente))
    }

    /**
     * Atualiza os dados do cliente logado.
     * @param request - `idCliente` obtido do JWT. Body: objeto AtualizarClienteDTO.
     * @param response - 200 com o perfil completo atualizado.
     */
    public async atualizar(request: Request, response: Response): Promise<void> {
        const dadosAtualizacao : AtualizarClienteDTO = request.body as unknown as AtualizarClienteDTO

        const clienteAtualizado = await this.atualizarClienteUseCase.execute(request.user!.idCliente, dadosAtualizacao)

        response.status(200).json(ClienteMapper.paraPerfilDto(clienteAtualizado))
    }
}
