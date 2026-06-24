import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { ServicoAtualizacaoDTO } from "../../../dto/servico/servico-atualizacao.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export class AtualizarServicoUseCase {
    constructor(
        private readonly servicoRepository: IServicoRepository,
        private readonly categoriaRepository: ICategoriaRepository
    ) {}

    /**
     * Atualiza parcialmente um servico existente, verificando a propriedade do prestador logado.
     * @param id - ID do servico a ser atualizado.
     * @param idPrestador - ID do prestador autenticado extraido do token JWT.
     * @param dados - Campos a serem atualizados (todos opcionais).
     * @returns O servico atualizado.
     * @throws {RecursoNaoEncontradoError} Se nenhum servico for encontrado com esse ID.
     * @throws {RecursoNaoEncontradoError} Se nenhuma categoria for encontrada com o idCategoria informado.
     * @throws {AcessoProibidoError} Se o servico pertencer a outro prestador.
     */
    async execute(id: string, idPrestador: string, dados: ServicoAtualizacaoDTO): Promise<Servico> {
        const servico = await this.servicoRepository.buscarPorId(id)
        if (!servico) throw new RecursoNaoEncontradoError('Serviço')
        if (servico.idPrestador !== idPrestador) throw new AcessoProibidoError()

        if (dados.idCategoria !== undefined) {
            const categoria = await this.categoriaRepository.buscarPorId(dados.idCategoria)
            if (!categoria) throw new RecursoNaoEncontradoError('Categoria')
            servico.idCategoria = dados.idCategoria
        }
        if (dados.descricao !== undefined) servico.descricao = dados.descricao
        if (dados.precoMin !== undefined) servico.precoMin = dados.precoMin
        if (dados.precoMax !== undefined) servico.precoMax = dados.precoMax
        if (dados.prazoMedioDias !== undefined) servico.prazoMedioDias = dados.prazoMedioDias

        return this.servicoRepository.atualizar(servico)
    }
}
