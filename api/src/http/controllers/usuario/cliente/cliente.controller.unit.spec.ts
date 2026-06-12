import { ClienteController } from "./cliente.controller";
import { CadastrarClienteUseCase } from "../../../../domain/use-cases/usuario/cliente/cadastrar-cliente/cadastrar-cliente.use-case";
import { Request, Response } from "express";
import { Usuario } from "../../../../domain/entities/usuario/usuario.entity";
import { UsuarioMother } from "../../../../test-helpers/usuario.mother";
import { BuscarClientePorIdUseCase } from "../../../../domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case";
import { AtualizarClienteUseCase } from "../../../../domain/use-cases/usuario/cliente/atualizar-cliente/atualizar-cliente.use-case";
import { ClienteMapper } from "../../../mappers/usuario/cliente/cliente.mapper";

describe('ClienteController', () => {
    let controller : ClienteController
    let cadastrarClienteUseCaseMock: jest.Mocked<CadastrarClienteUseCase>
    let buscarClientePorIdUseCaseMock: jest.Mocked<BuscarClientePorIdUseCase>
    let atualizarClienteUseCaseMock: jest.Mocked<AtualizarClienteUseCase>
    let req: Partial<Request>
    let res: Partial<Response>
    let usuarioMock : Usuario

    beforeEach(async () => {
        cadastrarClienteUseCaseMock = { execute: jest.fn() } as any
        buscarClientePorIdUseCaseMock = { execute: jest.fn() } as any
        atualizarClienteUseCaseMock = { execute: jest.fn() } as any
        controller = new ClienteController(cadastrarClienteUseCaseMock,buscarClientePorIdUseCaseMock, atualizarClienteUseCaseMock)

        req = { body: UsuarioMother.criarDTOValido(), user: { idCliente: '507f1f77bcf86cd799439011' } }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }
        usuarioMock = UsuarioMother.criarUsuarioValido({ ...req.body, id: req.user!.idCliente })
    })

    it('deve retornar resposta com sucesso 201 e objeto usuarioRespostaCadastroDTO ao cadastrar', async () => {
        // Arrange
        cadastrarClienteUseCaseMock.execute.mockResolvedValue(usuarioMock)
        // Act
        await controller.cadastrar(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            id: usuarioMock.id,
            nome: usuarioMock.nome,
            email: usuarioMock.email
        })
    })

    it('deve retornar resposta com sucesso 200 e o perfil completo do cliente logado', async () => {
        // Arrange
        buscarClientePorIdUseCaseMock.execute.mockResolvedValue(usuarioMock)
        // Act
        await controller.buscarLogado(req as any, res as any)
        // Assert
        expect(buscarClientePorIdUseCaseMock.execute).toHaveBeenCalledWith(req.user!.idCliente)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(ClienteMapper.paraPerfilDto(usuarioMock))
    })

    it('deve retornar resposta com sucesso 200 e o perfil completo ao buscar o próprio id', async () => {
        // Arrange
        req.params = { id: req.user!.idCliente as string }
        buscarClientePorIdUseCaseMock.execute.mockResolvedValue(usuarioMock)
        // Act
        await controller.buscarPorId(req as any, res as any)
        // Assert
        expect(buscarClientePorIdUseCaseMock.execute).toHaveBeenCalledWith(req.params.id)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(ClienteMapper.paraPerfilDto(usuarioMock))
    })

    it('deve retornar resposta com sucesso 200 e o perfil público ao buscar o id de outro cliente', async () => {
        // Arrange
        const outroClienteMock = UsuarioMother.criarUsuarioValido({ id: '507f1f77bcf86cd799439099', nome: 'Outro Cliente' })
        req.params = { id: outroClienteMock.id as string }
        buscarClientePorIdUseCaseMock.execute.mockResolvedValue(outroClienteMock)
        // Act
        await controller.buscarPorId(req as any, res as any)
        // Assert
        expect(buscarClientePorIdUseCaseMock.execute).toHaveBeenCalledWith(req.params.id)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(ClienteMapper.paraPerfilPublicoDto(outroClienteMock))
    })

    it('deve retornar resposta com sucesso 200 e o perfil atualizado ao atualizar o cliente logado', async () => {
        // Arrange
        req.body = { nome: 'Novo Nome' }
        const usuarioAtualizadoMock = UsuarioMother.criarUsuarioValido({ ...req.body, id: req.user!.idCliente })
        atualizarClienteUseCaseMock.execute.mockResolvedValue(usuarioAtualizadoMock)
        // Act
        await controller.atualizar(req as any, res as any)
        // Assert
        expect(atualizarClienteUseCaseMock.execute).toHaveBeenCalledWith(req.user!.idCliente, req.body)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(ClienteMapper.paraPerfilDto(usuarioAtualizadoMock))
    })
})
