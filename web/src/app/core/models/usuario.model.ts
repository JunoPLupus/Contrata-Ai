export interface Usuario {
  _id?: string;
  nome: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  // Se preenchido, o usuário também é prestador. Substitui o antigo array `perfis`.
  idPrestador?: string;
  localizacao_cidade?: string;
  localizacao_cep?: string;
  reputacao_flag_cancelamento?: number;
  data_cadastro?: Date;
  ativo?: boolean;
}
