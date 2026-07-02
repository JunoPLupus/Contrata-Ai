import { Avaliacao } from "../../../entities/avaliacao/avaliacao.entity";
import { IAvaliacaoRepository } from "../../../repositories/avaliacao.repository";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { AvaliacaoCadastroDTO } from "../../../dto/avaliacao/avaliacao-cadastro.dto";
import { AvaliacaoFactory } from "../../../factories/avaliacao.factory";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";
import { OperacaoNaoPermitidaError } from "../../../errors/operacao-nao-permitida.error";
import { StatusContrato } from "../../../value-objects/contrato/status/status.vo";

export class CadastrarAvaliacaoUseCase {
    constructor(
        private readonly avaliacaoRepository: IAvaliacaoRepository,
        private readonly contratoRepository: IContratoRepository
    ) {}

    /**
     * Cadastra uma avaliação para um contrato concluído (RF22/RF23/RN08).
     *
     * Regras:
     * - O contrato deve existir.
     * - Só o cliente do contrato pode avaliar.
     * - O contrato deve estar com status `concluido`.
     * - Só é permitida 1 avaliação por contrato.
     *
     * @param dados - DTO com `idContrato`, `nota`, `comentario` e `anonima`.
     * @param idCliente - ID do cliente autenticado (do token).
     * @returns A avaliação cadastrada.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o cliente não for o dono do contrato.
     * @throws {OperacaoNaoPermitidaError} Se o contrato não estiver concluído ou já foi avaliado.
     */
    async execute(dados: AvaliacaoCadastroDTO, idCliente: string): Promise<Avaliacao> {
        const contrato = await this.contratoRepository.buscarPorId(dados.idContrato)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')

        if (contrato.idCliente !== idCliente) throw new AcessoProibidoError()

        if (contrato.status !== StatusContrato.CONCLUIDO) {
            throw new OperacaoNaoPermitidaError('A avaliação só é liberada após a conclusão do serviço.')
        }

        const avaliacaoExistente = await this.avaliacaoRepository.buscarPorIdContrato(dados.idContrato)
        if (avaliacaoExistente) {
            throw new OperacaoNaoPermitidaError('Este contrato já foi avaliado.')
        }

        const avaliacao = AvaliacaoFactory.criar({
            idContrato: dados.idContrato,
            idCliente,
            idPrestador: contrato.idPrestador,
            nota: dados.nota,
            comentario: dados.comentario,
            anonima: dados.anonima,
        })

        return this.avaliacaoRepository.inserir(avaliacao)
    }
}
