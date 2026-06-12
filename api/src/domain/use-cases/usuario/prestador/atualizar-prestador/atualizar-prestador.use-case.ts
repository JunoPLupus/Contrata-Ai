import { IPrestadorRepository } from "../../../../repositories/prestador.repository";
import { AtualizarPrestadorDTO } from "../../../../dto/prestador/atualizar-prestador.dto";
import { Prestador } from "../../../../entities/prestador/prestador.entity";
import { RecursoNaoEncontradoError } from "../../../../errors/recurso-nao-encontrado.error";

export class AtualizarPrestadorUseCase {
    constructor(private readonly prestadorRepository: IPrestadorRepository) {}

    /**
     * Atualiza os dados de um prestador.
     * @param id - `id` do prestador a ser atualizado.
     * @param dadosAtualizacao - Campos a serem atualizados. Apenas os campos informados são alterados.
     * @returns O prestador com os dados atualizados.
     * @throws {RecursoNaoEncontradoError} se não existir prestador com esse `id`.
     */
    async execute(id: string, dadosAtualizacao: AtualizarPrestadorDTO): Promise<Prestador> {
        const prestador = await this.prestadorRepository.buscarPorId(id)

        if (prestador == null) throw new RecursoNaoEncontradoError('Prestador')

        if (dadosAtualizacao.telefone !== undefined) prestador.telefone = dadosAtualizacao.telefone
        if (dadosAtualizacao.descricao !== undefined) prestador.descricao = dadosAtualizacao.descricao

        return this.prestadorRepository.atualizar(prestador)
    }
}
