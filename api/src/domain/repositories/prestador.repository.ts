import { Prestador } from "../entities/prestador/prestador.entity";

export abstract class IPrestadorRepository {
    abstract inserir(prestador : Prestador) : Promise<Prestador>;
}