import bcrypt from 'bcrypt';

import { config } from "../../../../../shared/config"
import { IUsuarioRepository } from "../../../../repositories/usuario.repository";
import { AtualizarClienteDTO } from "../../../../dto/usuario/atualizar-cliente.dto";
import { Usuario } from "../../../../entities/usuario/usuario.entity";
import { RecursoNaoEncontradoError } from "../../../../errors/recurso-nao-encontrado.error";

export class AtualizarClienteUseCase {
    constructor(private readonly usuarioRepository: IUsuarioRepository) {}

    /**
     * Atualiza os dados de um cliente.
     * @param id - `id` do cliente a ser atualizado.
     * @param dadosAtualizacao - Campos a serem atualizados. Apenas os campos informados são alterados.
     * @returns O cliente com os dados atualizados.
     * @throws {RecursoNaoEncontradoError} se não existir cliente com esse `id`.
     */
    async execute(id: string, dadosAtualizacao: AtualizarClienteDTO): Promise<Usuario> {
        const usuario = await this.usuarioRepository.buscarPorId(id)

        if (usuario == null) throw new RecursoNaoEncontradoError('Cliente')

        if (dadosAtualizacao.nome !== undefined) usuario.nome = dadosAtualizacao.nome
        if (dadosAtualizacao.telefone !== undefined) usuario.telefone = dadosAtualizacao.telefone
        if (dadosAtualizacao.whatsapp !== undefined) usuario.whatsapp = dadosAtualizacao.whatsapp
        if (dadosAtualizacao.localizacaoCidade !== undefined) usuario.localizacaoCidade = dadosAtualizacao.localizacaoCidade
        if (dadosAtualizacao.localizacaoCep !== undefined) usuario.localizacaoCep = dadosAtualizacao.localizacaoCep
        if (dadosAtualizacao.senha !== undefined) {
            usuario.senha = dadosAtualizacao.senha
            usuario.senha = await bcrypt.hash(usuario.senha, config.bcryptSaltRounds)
        }

        return this.usuarioRepository.atualizar(usuario)
    }
}
