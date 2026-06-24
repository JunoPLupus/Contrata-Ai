import { Solicitacao } from "../../../entities/solicitacao/solicitacao.entity";
import { ISolicitacaoRepository } from "../../../repositories/solicitacao.repository";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { SolicitacaoFactory } from "../../../factories/solicitacao.factory";
import { SolicitacaoCadastroDTO } from "../../../dto/solicitacao/solicitacao-cadastro.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

export class CadastrarSolicitacaoUseCase {
    constructor(
        private readonly solicitacaoRepository: ISolicitacaoRepository,
        private readonly categoriaRepository: ICategoriaRepository,
        private readonly prestadorRepository: IPrestadorRepository
    ) {}

    /**
     * Cadastra uma nova solicitação a partir dos dados recebidos no DTO.
     * O status e sempre 'aberta' e a dataSolicitacao e gerada automaticamente.
     * @param dto - Dados necessários para o cadastro da solicitação.
     * @returns A solicitacao persistida com o `id` preenchido pelo banco.
     * @throws {RecursoNaoEncontradoError} Se a categoria nao for encontrada.
     * @throws {RecursoNaoEncontradoError} Se o prestador direto nao for encontrado (quando informado).
     * @throws {CampoObrigatorioVazioError} Se algum campo obrigatorio estiver vazio.
     * @throws {FormatoInvalidoError} Se algum campo receber um tipo invalido.
     * @throws {ValorLimiteError} Se a descricao estiver fora dos limites (5-300 caracteres).
     */
    async execute(dto: SolicitacaoCadastroDTO): Promise<Solicitacao> {
        const solicitacao = SolicitacaoFactory.criar({
            idCliente: dto.idCliente,
            idCategoria: dto.idCategoria,
            idPrestadorDireto: dto.idPrestadorDireto,
            descricao: dto.descricao
        })

        const categoria = await this.categoriaRepository.buscarPorId(dto.idCategoria)
        if (!categoria) throw new RecursoNaoEncontradoError('Categoria')

        if (dto.idPrestadorDireto !== undefined) {
            const prestador = await this.prestadorRepository.buscarPorId(dto.idPrestadorDireto)
            if (!prestador) throw new RecursoNaoEncontradoError('Prestador')
        }

        return this.solicitacaoRepository.inserir(solicitacao)
    }
}
