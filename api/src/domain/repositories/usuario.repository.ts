import { Usuario } from "../entities/usuario/usuario.entity";

export abstract class IUsuarioRepository {
    /**
     * Busca um usuário pelo endereço de e-mail.
     * @param email - E-mail a ser pesquisado.
     * @returns O usuário encontrado, ou `null` se não existir cadastro com esse e-mail.
     */
    abstract buscarPorEmail(email : string) : Promise< Usuario | null >;

    /**
     * Busca um usuário pelo identificador único.
     * @param id - `id` do usuário a ser pesquisado.
     * @returns O usuário encontrado, ou `null` se não existir registro com esse `id`.
     */
    abstract buscarPorId(id : string) : Promise< Usuario | null >;

    /**
     * Persiste um novo usuário.
     * @param usuario - Entidade de domínio a ser inserida.
     * @returns O usuário inserido com o `id` preenchido pelo banco.
     */
    abstract inserir(usuario : Usuario) : Promise< Usuario >;

    /**
     * Persiste as alterações de um usuário existente.
     * @param usuario - Entidade de domínio com os dados atualizados.
     * @returns O usuário com os dados atualizados.
     */
    abstract atualizar(usuario : Usuario) : Promise< Usuario >;

    /**
     * Vincula um prestador ao usuário, persistindo o `idPrestador` no documento do usuário.
     * Deve ser chamado após o cadastro do prestador.
     * @param idCliente - `id` do usuário a ser atualizado.
     * @param idPrestador - `id` do prestador a ser vinculado.
     */
    abstract vincularPrestador(idCliente : string, idPrestador : string) : Promise<void>;
}
