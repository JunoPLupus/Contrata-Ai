export type Perfil = 'cliente' | 'prestador';

export interface Usuario {
  _id?: string;
  nome: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  perfis: Perfil[];
  localizacao_cidade?: string;
  localizacao_cep?: string;
  reputacao_flag_cancelamento?: number;
  data_cadastro?: Date;
  ativo?: boolean;
}
