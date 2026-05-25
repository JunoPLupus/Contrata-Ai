import { Perfil } from './usuario.model';

export interface CadastroPayload {
  nome: string;
  email: string;
  whatsapp: string;
  senha: string;
  perfis: Perfil[];
  aceiteTermos: boolean;
}
