import { UsuarioProps } from "./usuario.props";
import { NomeUsuarioValueObject } from "../../value-objects/usuario/nome/nome.vo";
import { SenhaUsuarioValueObject } from "../../value-objects/usuario/senha/senha.vo";
import { EmailUsuarioValueObject } from "../../value-objects/usuario/email/email.vo";

export class Usuario {

    private constructor(private readonly props : UsuarioProps) {}

    public static criarUsuario(props: UsuarioProps): Usuario {
        return new Usuario(props)
    }

    get nome() : string {
        return this.props.nome.nome;
    }
    set nome(nome : string) {
        this.props.nome = new NomeUsuarioValueObject(nome);
    }

    get senha() : string {
        return this.props.senha.senha;
    }
    set senha(senha : string) {
        this.props.senha = new SenhaUsuarioValueObject(senha);
    }

    get email() : string {
        return this.props.email.email;
    }
    set email(email : string) {
        this.props.email = new EmailUsuarioValueObject(email);
    }

    get perfis() : Array<'cliente' | 'prestador'>{
        return this.props.perfis;
    }
    set perfis(perfis: Array<'cliente' | 'prestador'>) {
        this.props.perfis = perfis;
    }
}