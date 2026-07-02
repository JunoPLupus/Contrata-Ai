import { Usuario } from "../domain/entities/usuario/usuario.entity";
import { UsuarioCadastroDTO } from "../domain/dto/usuario/usuario-cadastro.dto";
import { UsuarioFactory } from "../domain/factories/usuario.factory";
import { IUsuarioRepository } from "../domain/repositories/usuario.repository";

type UsuarioValidoDTO = UsuarioCadastroDTO & {
    id : string
    idPrestador : string
    telefone : string
    whatsapp : string
    localizacaoCidade : string
    localizacaoCep : string
    ativo : boolean
    reputacao_flag_cancelamento : number
}

export class UsuarioMother {
    public static criarUsuarioValido(dto ?: Partial<UsuarioValidoDTO>) : Usuario {
        return UsuarioFactory.criar({
            id : dto?.id,
            idPrestador : dto?.idPrestador,
            nome : dto?.nome ?? 'Fulano',
            email : dto?.email ?? 'fulano@gmail.com',
            senha : dto?.senha ?? '123456',
            telefone : dto?.telefone,
            whatsapp : dto?.whatsapp,
            localizacaoCidade : dto?.localizacaoCidade,
            localizacaoCep : dto?.localizacaoCep,
            data_cadastro : new Date(),
            ativo : dto?.ativo ?? true,
            reputacao_flag_cancelamento: dto?.reputacao_flag_cancelamento ?? 0
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
            buscarPorId: jest.fn(),
            inserir: jest.fn(),
            atualizar: jest.fn(),
            vincularPrestador: jest.fn(),
            incrementarFlagCancelamento: jest.fn()
        }
    }
}
