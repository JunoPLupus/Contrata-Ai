// Define qual rota de cadastro chamar: 'cliente' (só cliente) ou 'prestador' (cliente+prestador). Integração com a API pendente.
export type PerfilCadastro = 'cliente' | 'prestador';

export interface CadastroPayload {
  nome: string;
  email: string;
  whatsapp: string;
  senha: string;
  perfilEscolhido: PerfilCadastro;
  aceiteTermos: boolean;
}
