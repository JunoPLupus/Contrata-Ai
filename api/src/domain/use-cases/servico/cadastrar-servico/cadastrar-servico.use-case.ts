import { Servico } from "../../../entities/servico/servico.entity";
import { IServicoRepository } from "../../../repositories/servico.repository";
import { ICategoriaRepository } from "../../../repositories/categoria.repository";
import { ServicoFactory } from "../../../factories/servico.factory";
import { ServicoCadastroDTO } from "../../../dto/servico/servico-cadastro.dto";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";

export class CadastrarServicoUseCase {
    constructor(
        private readonly servicoRepository: IServicoRepository,
        private readonly categoriaRepository: ICategoriaRepository
    ) {}

    /**
     * Cadastra um novo serviço a partir dos dados recebidos no DTO.
     * @param servicoDTO - Dados necessários para o cadastro do serviço.
     * @returns O serviço persistido com o `id` preenchido pelo banco.
     * @throws {RecursoNaoEncontradoError} Se nenhuma categoria for encontrada com o idCategoria informado.
     * @throws {CampoObrigatorioVazioError} Se algum campo obrigatório estiver vazio.
     * @throws {FormatoInvalidoError} Se algum campo receber um tipo inválido.
     * @throws {ValorLimiteError} Se algum campo não respeitar os limites definidos.
     */
    async execute(servicoDTO: ServicoCadastroDTO): Promise<Servico> {
        const categoria = await this.categoriaRepository.buscarPorId(servicoDTO.idCategoria)
        if (!categoria) throw new RecursoNaoEncontradoError('Categoria')

        const servico: Servico = ServicoFactory.criar({
            idPrestador: servicoDTO.idPrestador,
            idCategoria: servicoDTO.idCategoria,
            descricao: servicoDTO.descricao,
            precoMin: servicoDTO.precoMin,
            precoMax: servicoDTO.precoMax,
            prazoMedioDias: servicoDTO.prazoMedioDias
        })
        return this.servicoRepository.inserir(servico)
    }
}
