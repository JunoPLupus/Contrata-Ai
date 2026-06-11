import { CategoriaProps } from "./categoria.props";

export class Categoria {
    private constructor(private readonly props : CategoriaProps) {
    }

    public static criarCategoria(props: CategoriaProps) : Categoria {
        return new Categoria(props);
    }

    get id(): string | undefined {
        return this.props.id;
    }

    get categoriaPaiId() : string | undefined {
        return this.props.categoriaPaiId;
    }

    get nome() : string {
        return this.props.nome.valor;
    }

    get descricao() : string | undefined {
        return this.props.descricao;
    }
}
