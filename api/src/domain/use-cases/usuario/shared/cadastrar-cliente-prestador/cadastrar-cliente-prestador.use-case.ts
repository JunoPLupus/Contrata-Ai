import { CadastrarClienteUseCase } from "../../cliente/cadastrar-cliente/cadastrar-cliente.use-case";
import { CadastrarPrestadorUseCase } from "../../prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import { UsuarioCadastroDTO } from "../../../../dto/usuario/usuario-cadastro.dto";
import { Usuario } from "../../../../entities/usuario/usuario.entity";

export class CadastrarClientePrestadorUseCase {
    constructor(
        private readonly cadastrarUsuarioUseCase: CadastrarClienteUseCase,
        private readonly cadastrarPrestadorUseCase: CadastrarPrestadorUseCase
    ) {}

    /**
     * Cadastra um novo usuário com perfil cliente e prestador simultaneamente.
     * Internamente, executa o cadastro do usuário e em seguida o cadastro do prestador,
     * vinculando o `idPrestador` ao usuário criado antes de retorná-lo.
     * @param dto - Dados do usuário a ser cadastrado.
     * @returns O usuário persistido com `idPrestador` preenchido.
     */
    async execute(dto: UsuarioCadastroDTO): Promise<Usuario> {
        const usuarioCadastrado = await this.cadastrarUsuarioUseCase.execute(dto)
        const prestadorCadastrado = await this.cadastrarPrestadorUseCase.execute({
            idCliente: usuarioCadastrado.id!
        })
        usuarioCadastrado.idPrestador = prestadorCadastrado.id!
        return usuarioCadastrado
    }
}
