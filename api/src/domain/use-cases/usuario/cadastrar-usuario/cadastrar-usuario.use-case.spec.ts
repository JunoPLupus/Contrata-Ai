import { CadastrarUsuarioUseCase } from "./cadastrar-usuario.use-case";
import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { UsuarioCadastroDTO } from "../../../dto/usuario/usuario-cadastro.dto";

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('senha_hash_mockada'),
    compare: jest.fn()
}));

describe('CadastrarUsuarioUseCase', () => {
    let cadastrarUsuarioUseCase: CadastrarUsuarioUseCase;
    let usuarioRepositoryMock : jest.Mocked<IUsuarioRepository>;
    let usuarioValidoDTOMock : UsuarioCadastroDTO;

    beforeEach(() => {
        usuarioRepositoryMock = {
            buscarPorEmail : jest.fn(),
            inserir: jest.fn()
        }
        cadastrarUsuarioUseCase = new CadastrarUsuarioUseCase(usuarioRepositoryMock);

        usuarioValidoDTOMock = {
            nome: 'Fulano',
            email: 'fulano@gmail.com',
            senha: '123456',
            perfis: ['cliente', 'prestador']
        }
    });

    it('deve criar usuário com dados válidos', async () => {
        // arrange
        usuarioRepositoryMock.inserir.mockResolvedValue({
            ...usuarioValidoDTOMock,
            data_cadastro: new Date(),
            ativo: true,
            reputacao_flag_cancelamento: 0
        });

        // act
        await cadastrarUsuarioUseCase.execute(usuarioValidoDTOMock);

        // assert
        expect(usuarioRepositoryMock.buscarPorEmail).not.toHaveBeenCalled();
        expect(usuarioRepositoryMock.inserir).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'fulano@gmail.com',
                ativo: true,
                reputacao_flag_cancelamento: 0
            })
        );
    });

    it('deve falhar se nome não preenchido', async () => {
       // arrange
        const usuarioSemNomeMock = {
            ...usuarioValidoDTOMock,
            nome: ''
        }

       // act & assert
        await expect(
            cadastrarUsuarioUseCase.execute(usuarioSemNomeMock)
        ).rejects.toThrow("O campo 'nome' é obrigatório.")
        expect(usuarioRepositoryMock.buscarPorEmail).not.toHaveBeenCalled();
        expect(usuarioRepositoryMock.inserir).not.toHaveBeenCalled();
    });
});