import { Usuario } from "../domain/entities/usuario/usuario.entity";
import { UsuarioCadastroDTO } from "../domain/dto/usuario/usuario-cadastro.dto";
import { UsuarioFactory } from "../domain/factories/usuario.factory";
import { IUsuarioRepository } from "../domain/repositories/usuario.repository";

export class UsuarioMother {
    public static criarUsuarioValido(dto ?: Partial<UsuarioCadastroDTO & { idPrestador: string }>) : Usuario {
        return UsuarioFactory.criar({
            idPrestador : dto?.idPrestador,
            nome : dto?.nome ?? 'Fulano',
            email : dto?.email ?? 'fulano@gmail.com',
            senha : dto?.senha ?? '123456',
            data_cadastro : new Date(),
            ativo : true,
            reputacao_flag_cancelamento: 0
        })
    }
    public static criarDTOValido(dto?: Partial<UsuarioCadastroDTO>): UsuarioCadastroDTO {
        return {
            nome: dto?.nome ?? 'Fulano',
            email: dto?.email ?? 'fulano@gmail.com',
            senha: dto?.senha ?? '123456',
        }
    }
    public static criarRepositoryMock(): jest.Mocked<IUsuarioRepository> {
        return {
            buscarPorEmail: jest.fn(),
            inserir: jest.fn(),
            vincularPrestador: jest.fn()
        }
    }
}