import { Usuario } from "../../entities/usuario/usuario.entity";

export type AtualizarClienteDTO = Partial<Pick<Usuario, 'nome' | 'senha' | 'telefone' | 'whatsapp' | 'localizacaoCidade' | 'localizacaoCep'>>