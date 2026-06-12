import { UsuarioProps } from "./usuario.props";
import { StringValueObject } from "../../value-objects/shared/string/string.vo";
import { EmailUsuarioValueObject } from "../../value-objects/usuario/email/email.vo";
import { TelefoneUsuarioValueObject } from "../../value-objects/usuario/telefone/telefone.vo";
import { CepValueObject } from "../../value-objects/usuario/cep/cep.vo";
import { isStringVazia } from "../../utils/value-objects.utils";

export class Usuario {

    private constructor(private readonly props : UsuarioProps) {}

    public static criarUsuario(props: UsuarioProps): Usuario {
        return new Usuario(props)
    }

    get id() : string | undefined {
        return this.props.id
    }

    get idPrestador(): string | undefined {
        return this.props.idPrestador?.valor
    }

    set idPrestador(idPrestador: string) {
        this.props.idPrestador = new StringValueObject('idPrestador', idPrestador)
    }

    get nome() : string {
        return this.props.nome.valor
    }
    set nome(nome : string) {
        this.props.nome = new StringValueObject('nome', nome, 3, 150)
    }

    get senha() : string {
        return this.props.senha.valor
    }
    set senha(senha : string) {
        this.props.senha = new StringValueObject('senha', senha, 6, 64)
    }

    get email() : string {
        return this.props.email.email
    }
    set email(email : string) {
        this.props.email = new EmailUsuarioValueObject(email)
    }

    get telefone() : string | undefined {
        return this.props.telefone?.valor
    }
    set telefone(telefone : string | undefined) {
        this.props.telefone = !isStringVazia(telefone) ? new TelefoneUsuarioValueObject('telefone', telefone) : undefined
    }

    get whatsapp() : string | undefined {
        return this.props.whatsapp?.valor
    }
    set whatsapp(whatsapp : string | undefined) {
        this.props.whatsapp = !isStringVazia(whatsapp) ? new TelefoneUsuarioValueObject('whatsapp', whatsapp) : undefined
    }

    get localizacaoCidade() : string | undefined {
        return this.props.localizacaoCidade?.valor
    }
    set localizacaoCidade(localizacaoCidade : string | undefined) {
        this.props.localizacaoCidade = !isStringVazia(localizacaoCidade) ? new StringValueObject('localizacaoCidade', localizacaoCidade, 3, 32) : undefined
    }

    get localizacaoCep() : string | undefined {
        return this.props.localizacaoCep?.valor
    }
    set localizacaoCep(localizacaoCep : string | undefined) {
        this.props.localizacaoCep = !isStringVazia(localizacaoCep) ? new CepValueObject(localizacaoCep) : undefined
    }

    get data_cadastro() : Date {
        return this.props.data_cadastro
    }

    get ativo() : boolean {
        return this.props.ativo
    }
    set ativo (ativo : boolean) {
        this.props.ativo = ativo
    }

    get reputacao_flag_cancelamento() : number {
        return this.props.reputacao_flag_cancelamento
    }
    set reputacao_flag_cancelamento(flag : number) {
        this.props.reputacao_flag_cancelamento = flag
    }
}
