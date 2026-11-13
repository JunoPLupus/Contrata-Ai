import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { AvaliacaoCadastroDTO } from "../../../dto/avaliacao/avaliacao-cadastro.dto";
import { AvaliacaoFactory } from "../../../factories/avaliacao.factory";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";
import { Papel, PapelTipo } from "../../../value-objects/shared/papel/papel.vo";

export class CadastrarAvaliacaoUseCase {
    constructor(
        private readonly avaliacaoRepository: IAvaliacaoRepository,
        private readonly contratoRepository: IContratoRepository
    ) {}

    /**
     * Cadastra uma avaliação para um contrato concluído (RF22/RF23/RN08), em qualquer direção:
     * o cliente avalia o prestador ou o prestador avalia o cliente.
     *
     * Regras:
     * - O contrato deve existir.
     * - O `autor` é deduzido pelo contrato, comparando os perfis do token com as pontas do contrato
     *   (o avaliado é sempre a outra ponta). Quem não é parte do contrato não pode avaliar.
     * - O contrato deve estar com status `concluido`.
     * - No máximo 1 avaliação por (contrato, autor). Garantido só pelo índice único do banco
     *   (ADR 010), sem consulta prévia: a duplicata chega ao `errorHandler` como E11000.
     *
     * @param dados - DTO com `idContrato`, `nota`, `comentario` e `anonima`.
     * @param idCliente - ID do perfil de cliente do usuário logado (do token).
     * @param idPrestador - ID do perfil de prestador do usuário logado (do token), se houver.
     * @returns A avaliação cadastrada.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o usuário não for parte do contrato.
     * @throws {OperacaoNaoPermitidaError} Se o usuário estiver nas duas pontas do contrato
     *   (auto-avaliação) ou se o contrato não estiver concluído.
     */
    async execute(dados: AvaliacaoCadastroDTO, idCliente: string, idPrestador?: string): Promise<Avaliacao> {
        const contrato = await this.contratoRepository.buscarPorId(dados.idContrato)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')

        const autor = this.deduzirAutor(contrato, idCliente, idPrestador)

        if (contrato.status !== StatusContrato.CONCLUIDO) {
            throw new OperacaoNaoPermitidaError('A avaliação só é liberada após a conclusão do serviço.')
        }

        const avaliacao = AvaliacaoFactory.criar({
            idContrato: dados.idContrato,
            idCliente: contrato.idCliente,
            idPrestador: contrato.idPrestador,
            autor,
            nota: dados.nota,
            comentario: dados.comentario,
            anonima: dados.anonima,
        })

        return this.avaliacaoRepository.inserir(avaliacao)
    }

    /**
     * Deduz o papel de quem está avaliando a partir das pontas do contrato.
     *
     * @throws {OperacaoNaoPermitidaError} Se o usuário estiver nas duas pontas (auto-avaliação).
     *   Checagem defensiva: a origem já é bloqueada no cadastro de orçamento.
     * @throws {AcessoProibidoError} Se o usuário não estiver em nenhuma ponta.
     */
    private deduzirAutor(contrato: Contrato, idCliente: string, idPrestador?: string): PapelTipo {
        const ehCliente = contrato.idCliente === idCliente
        const ehPrestador = idPrestador !== undefined && contrato.idPrestador === idPrestador

        if (ehCliente && ehPrestador) {
            throw new OperacaoNaoPermitidaError('Não é permitido avaliar um contrato em que você é o cliente e o prestador.')
        }
        if (ehCliente) return Papel.CLIENTE
        if (ehPrestador) return Papel.PRESTADOR

        throw new AcessoProibidoError()
    }
}
