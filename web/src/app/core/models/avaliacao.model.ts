export interface Avaliacao {
  _id: string;
  id_prestador: string;
  id_cliente: string;
  nota: number; // 1 a 5
  comentario?: string;
  data: Date;
  anonima: boolean;
}
