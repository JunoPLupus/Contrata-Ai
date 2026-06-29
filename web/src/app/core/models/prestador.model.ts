export interface Prestador {
  _id: string;
  id_usuario: string;
  nome?: string;
  foto?: string;
  telefone_profissional?: string;
  descricao?: string;
  localizacao_latitude?: number;
  localizacao_longitude?: number;
}
