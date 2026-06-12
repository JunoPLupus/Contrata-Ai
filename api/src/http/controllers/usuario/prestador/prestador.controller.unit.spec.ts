import { Request, Response } from "express";

import { PrestadorController } from "./prestador.controller";
import { CadastrarPrestadorUseCase } from "../../../../domain/use-cases/usuario/prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import { BuscarPrestadorPorIdUseCase } from "../../../../domain/use-cases/usuario/prestador/buscar-prestador-por-id/buscar-prestador-por-id.use-case";
import { AtualizarPrestadorUseCase } from "../../../../domain/use-cases/usuario/prestador/atualizar-prestador/atualizar-prestador.use-case";
import { InativarPrestadorUseCase } from "../../../../domain/use-cases/usuario/prestador/inativar-prestador/inativar-prestador.use-case";
import { AtivarPrestadorUseCase } from "../../../../domain/use-cases/usuario/prestador/ativar-prestador/ativar-prestador.use-case";
import { PrestadorMother } from "../../../../test-helpers/prestador.mother";
import { PrestadorMapper } from "../../../mappers/usuario/prestador/prestador.mapper";

describe('Prestador Controller', () => {
    let controller : PrestadorController
    let cadastrarPrestadorUseCaseMock : jest.Mocked<CadastrarPrestadorUseCase>
    let buscarPrestadorPorIdUseCaseMock : jest.Mocked<BuscarPrestadorPorIdUseCase>
    let atualizarPrestadorUseCaseMock : jest.Mocked<AtualizarPrestadorUseCase>
    let inativarPrestadorUseCaseMock : jest.Mocked<InativarPrestadorUseCase>
    let ativarPrestadorUseCaseMock : jest.Mocked<AtivarPrestadorUseCase>
    let req : Partial<Request>
    let res : Partial<Response>

    beforeEach( async () => {
        cadastrarPrestadorUseCaseMock = { execute: jest.fn() } as any
        buscarPrestadorPorIdUseCaseMock = { execute: jest.fn() } as any
        atualizarPrestadorUseCaseMock = { execute: jest.fn() } as any
        inativarPrestadorUseCaseMock = { execute: jest.fn() } as any
        ativarPrestadorUseCaseMock = { execute: jest.fn() } as any
        controller = new PrestadorController(
            cadastrarPrestadorUseCaseMock,
            buscarPrestadorPorIdUseCaseMock,
            atualizarPrestadorUseCaseMock,
            inativarPrestadorUseCaseMock,
            ativarPrestadorUseCaseMock
        )

        req = { user: { ...PrestadorMother.criarDTO(), idPrestador: '507f1f77bcf86cd799439022' } }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        }
    })

    it('deve retornar resposta com sucesso 201 e objeto prestadorRespostaCadastroDTO ao cadastrar', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido(req.user)
        cadastrarPrestadorUseCaseMock.execute.mockResolvedValue(prestadorMock)
        // Act
        await controller.cadastrar(req as any, res as any)
        // Assert
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            id: prestadorMock.id,
            idCliente: prestadorMock.idCliente
        })
    })

    it('deve retornar resposta com sucesso 200 e o perfil completo do prestador logado', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ id: req.user!.idPrestador, telefone: '11999999999', descricao: 'Descrição válida do prestador' })
        buscarPrestadorPorIdUseCaseMock.execute.mockResolvedValue(prestadorMock)
        // Act
        await controller.buscarLogado(req as any, res as any)
        // Assert
        expect(buscarPrestadorPorIdUseCaseMock.execute).toHaveBeenCalledWith(req.user!.idPrestador)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(PrestadorMapper.paraPerfilCompletoDto(prestadorMock))
    })

    it('deve retornar resposta com sucesso 200 e o perfil público ao buscar o id de um prestador', async () => {
        // Arrange
        const prestadorMock = PrestadorMother.criarValido({ descricao: 'Descrição válida do prestador' })
        req.params = { id: prestadorMock.id as string }
        buscarPrestadorPorIdUseCaseMock.execute.mockResolvedValue(prestadorMock)
        // Act
        await controller.buscarPorId(req as any, res as any)
        // Assert
        expect(buscarPrestadorPorIdUseCaseMock.execute).toHaveBeenCalledWith(req.params.id)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(PrestadorMapper.paraPerfilPublicoDto(prestadorMock))
    })

    it('deve retornar resposta com sucesso 200 e os dados atualizados ao atualizar o prestador logado', async () => {
        // Arrange
        req.body = { telefone: '11999999999', descricao: 'Nova descrição do prestador' }
        const prestadorAtualizadoMock = PrestadorMother.criarValido({ id: req.user!.idPrestador, ...req.body })
        atualizarPrestadorUseCaseMock.execute.mockResolvedValue(prestadorAtualizadoMock)
        // Act
        await controller.atualizar(req as any, res as any)
        // Assert
        expect(atualizarPrestadorUseCaseMock.execute).toHaveBeenCalledWith(req.user!.idPrestador, req.body)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(PrestadorMapper.paraAtualizadoDto(prestadorAtualizadoMock))
    })

    it('deve retornar resposta com sucesso 204 ao inativar o prestador logado', async () => {
        // Arrange
        inativarPrestadorUseCaseMock.execute.mockResolvedValue(undefined)
        // Act
        await controller.inativar(req as any, res as any)
        // Assert
        expect(inativarPrestadorUseCaseMock.execute).toHaveBeenCalledWith(req.user!.idPrestador)
        expect(res.status).toHaveBeenCalledWith(204)
        expect(res.send).toHaveBeenCalled()
    })

    it('deve retornar resposta com sucesso 204 ao ativar o prestador logado', async () => {
        // Arrange
        ativarPrestadorUseCaseMock.execute.mockResolvedValue(undefined)
        // Act
        await controller.ativar(req as any, res as any)
        // Assert
        expect(ativarPrestadorUseCaseMock.execute).toHaveBeenCalledWith(req.user!.idPrestador)
        expect(res.status).toHaveBeenCalledWith(204)
        expect(res.send).toHaveBeenCalled()
    })
})
