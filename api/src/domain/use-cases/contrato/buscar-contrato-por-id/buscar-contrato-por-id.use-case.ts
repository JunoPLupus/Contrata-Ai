import { Contrato } from "../../../entities/contrato/contrato.entity";
import { IContratoRepository } from "../../../repositories/contrato.repository";
import { IPrestadorRepository } from "../../../repositories/prestador.repository";
import { IUsuarioRepository } from "../../../repositories/usuario.repository";
import { RecursoNaoEncontradoError } from "../../../errors/recurso-nao-encontrado.error";
import { AcessoProibidoError } from "../../../errors/acesso-proibido.error";

export type ContratoComWhatsapp = Contrato & { whatsappPrestador?: string }

export class BuscarContratoPorIdUseCase {
    constructor(
        private readonly contratoRepository: IContratoRepository,
        private readonly prestadorRepository: IPrestadorRepository,
        private readonly usuarioRepository: IUsuarioRepository
    ) {}

    /**
     * Busca um contrato pelo ID, validando acesso e enriquecendo com
     * o WhatsApp do prestador quando `whatsappLiberado === true` (RF15).
     *
     * @param id - ID do contrato.
     * @param idCliente - ID do usuário autenticado.
     * @param idPrestador - ID do prestador autenticado (pode ser `undefined`).
     * @returns O contrato encontrado.
     * @throws {RecursoNaoEncontradoError} Se o contrato não existir.
     * @throws {AcessoProibidoError} Se o usuário não for parte do contrato.
     */
    async execute(id: string, idCliente: string, idPrestador?: string): Promise<ContratoComWhatsapp & { whatsappPrestador?: string }> {
        const contrato = await this.contratoRepository.buscarPorId(id)
        if (!contrato) throw new RecursoNaoEncontradoError('Contrato')

        const eParte = contrato.idCliente === idCliente || (idPrestador && contrato.idPrestador === idPrestador)
        if (!eParte) throw new AcessoProibidoError()

        if (!contrato.whatsappLiberado) return contrato

        const prestador = await this.prestadorRepository.buscarPorId(contrato.idPrestador)
        if (!prestador) return contrato

        const usuario = await this.usuarioRepository.buscarPorId(prestador.idCliente)
        if (!usuario?.whatsapp) return contrato

        return Object.assign(contrato, { whatsappPrestador: usuario.whatsapp })
    }
}
