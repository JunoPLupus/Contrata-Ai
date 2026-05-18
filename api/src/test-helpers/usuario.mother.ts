import { Usuario } from "../domain/entities/usuario/usuario.entity";
import { UsuarioCadastroDTO } from "../domain/dto/usuario/usuario-cadastro.dto";
import { UsuarioFactory } from "../domain/factories/usuario.factory";

export class UsuarioMother {
    public static criarUsuarioValido(dto ?: Partial<UsuarioCadastroDTO>) : Usuario {
        return UsuarioFactory.criar({
            nome : dto?.nome ?? 'Fulano',
            email : dto?.email ?? 'fulano@gmail.com',
            senha : dto?.senha ?? '123456',
            perfis : dto?.perfis ?? ['cliente', 'prestador'],
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
            perfis: dto?.perfis ?? ['cliente', 'prestador']
        }
    }
}