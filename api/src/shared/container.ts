import { UsuarioController } from "../http/controllers/usuario/usuario.controller";
import { ClientePrestadorController } from "../http/controllers/usuario/shared/cliente-prestador.controller";
import { VerificarEmailUseCase } from "../domain/use-cases/usuario/shared/verificar-email/verificar-email.use-case";
import { InativarUsuarioUseCase } from "../domain/use-cases/usuario/shared/inativar-usuario/inativar-usuario.use-case";
import { CadastrarClienteUseCase } from "../domain/use-cases/usuario/cliente/cadastrar-cliente/cadastrar-cliente.use-case";
import { BuscarClientePorIdUseCase } from "../domain/use-cases/usuario/cliente/buscar-cliente-por-id/buscar-cliente-por-id.use-case";
import { AtualizarClienteUseCase } from "../domain/use-cases/usuario/cliente/atualizar-cliente/atualizar-cliente.use-case";
import { CadastrarClientePrestadorUseCase } from "../domain/use-cases/usuario/shared/cadastrar-cliente-prestador/cadastrar-cliente-prestador.use-case";
import { UsuarioMongodbRepositoryImpl } from "../infra/repositories/usuario/usuario-mongodb.repository.impl";
import { PrestadorMongodbRepositoryImpl } from "../infra/repositories/prestador/prestador-mongodb.repository.impl";
import { CadastrarPrestadorUseCase } from "../domain/use-cases/usuario/prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import { BuscarPrestadorPorIdUseCase } from "../domain/use-cases/usuario/prestador/buscar-prestador-por-id/buscar-prestador-por-id.use-case";
import { AtualizarPrestadorUseCase } from "../domain/use-cases/usuario/prestador/atualizar-prestador/atualizar-prestador.use-case";
import { InativarPrestadorUseCase } from "../domain/use-cases/usuario/prestador/inativar-prestador/inativar-prestador.use-case";
import { AtivarPrestadorUseCase } from "../domain/use-cases/usuario/prestador/ativar-prestador/ativar-prestador.use-case";
import { PrestadorController } from "../http/controllers/usuario/prestador/prestador.controller";
import { LoginUseCase } from "../domain/use-cases/usuario/shared/login/login.use-case";
import { AuthController } from "../http/controllers/usuario/shared/auth/auth.controller";
import { ServicoMongodbRepositoryImpl } from "../infra/repositories/servico/servico-mongodb.repository.impl";
import { CadastrarServicoUseCase } from "../domain/use-cases/servico/cadastrar-servico/cadastrar-servico.use-case";
import { BuscarServicosPrestadorLogadoUseCase } from "../domain/use-cases/servico/buscar-servicos-prestador-logado/buscar-servicos-prestador-logado.use-case";
import { BuscarServicoPorIdUseCase } from "../domain/use-cases/servico/buscar-servico-por-id/buscar-servico-por-id.use-case";
import { AtualizarServicoUseCase } from "../domain/use-cases/servico/atualizar-servico/atualizar-servico.use-case";
import { DeletarServicoUseCase } from "../domain/use-cases/servico/deletar-servico/deletar-servico.use-case";
import { ServicoController } from "../http/controllers/servico/servico.controller";
import { ClienteController } from "../http/controllers/usuario/cliente/cliente.controller";
import { CategoriaMongodbRepositoryImpl } from "../infra/repositories/categoria/categoria-mongodb.repository.impl";
import { BuscarTodasCategoriasUseCase } from "../domain/use-cases/categoria/buscar-todas-categorias/buscar-todas-categorias.use-case";
import { BuscarCategoriaPorIdUseCase } from "../domain/use-cases/categoria/buscar-categoria-por-id/buscar-categoria-por-id.use-case";
import { BuscarCategoriasPorCategoriaPaiIdUseCase } from "../domain/use-cases/categoria/buscar-categorias-por-categoria-pai-id/buscar-categorias-por-categoria-pai-id.use-case";
import { CategoriaController } from "../http/controllers/categoria/categoria.controller";
import { SolicitacaoMongodbRepositoryImpl } from "../infra/repositories/solicitacao/solicitacao-mongodb.repository.impl";
import { CadastrarSolicitacaoUseCase } from "../domain/use-cases/solicitacao/cadastrar-solicitacao/cadastrar-solicitacao.use-case";
import { BuscarSolicitacoesClienteLogadoUseCase } from "../domain/use-cases/solicitacao/buscar-solicitacoes-cliente-logado/buscar-solicitacoes-cliente-logado.use-case";
import { BuscarSolicitacoesDisponiveisPrestadorUseCase } from "../domain/use-cases/solicitacao/buscar-solicitacoes-disponiveis-prestador/buscar-solicitacoes-disponiveis-prestador.use-case";
import { BuscarSolicitacaoPorIdUseCase } from "../domain/use-cases/solicitacao/buscar-solicitacao-por-id/buscar-solicitacao-por-id.use-case";
import { AtualizarSolicitacaoUseCase } from "../domain/use-cases/solicitacao/atualizar-solicitacao/atualizar-solicitacao.use-case";
import { SolicitacaoController } from "../http/controllers/solicitacao/solicitacao.controller";

//#region usuario.routes.ts
const usuarioRepository = new UsuarioMongodbRepositoryImpl()
const cadastrarClienteUseCase = new CadastrarClienteUseCase(usuarioRepository)
const verificarEmailUseCase = new VerificarEmailUseCase(usuarioRepository)
const inativarUsuarioUseCase = new InativarUsuarioUseCase(usuarioRepository)
const buscarClientePorIdUseCase = new BuscarClientePorIdUseCase(usuarioRepository)
const atualizarClienteUseCase = new AtualizarClienteUseCase(usuarioRepository)
export const usuarioController = new UsuarioController(verificarEmailUseCase, inativarUsuarioUseCase)
export const clienteController = new ClienteController(cadastrarClienteUseCase, buscarClientePorIdUseCase, atualizarClienteUseCase)
//#endregion

//#region auth.routes.ts
const loginUseCase = new LoginUseCase(usuarioRepository)
export const authController = new AuthController(loginUseCase)
//#endregion

//#region prestador.routes.ts
const prestadorRepository = new PrestadorMongodbRepositoryImpl()
const cadastrarPrestadorUseCase = new CadastrarPrestadorUseCase(prestadorRepository, usuarioRepository)
const buscarPrestadorPorIdUseCase = new BuscarPrestadorPorIdUseCase(prestadorRepository)
const atualizarPrestadorUseCase = new AtualizarPrestadorUseCase(prestadorRepository)
const inativarPrestadorUseCase = new InativarPrestadorUseCase(prestadorRepository)
const ativarPrestadorUseCase = new AtivarPrestadorUseCase(prestadorRepository)
export const prestadorController = new PrestadorController(
    cadastrarPrestadorUseCase,
    buscarPrestadorPorIdUseCase,
    atualizarPrestadorUseCase,
    inativarPrestadorUseCase,
    ativarPrestadorUseCase
)
//#endregion

//#region usuario-prestador.routes.ts
const cadastrarClientePrestadorUseCase = new CadastrarClientePrestadorUseCase(cadastrarClienteUseCase, cadastrarPrestadorUseCase)
export const clientePrestadorController = new ClientePrestadorController(cadastrarClientePrestadorUseCase)
//#endregion

//#region categoria.routes.ts
const categoriaRepository = new CategoriaMongodbRepositoryImpl()
const buscarTodasCategoriasUseCase = new BuscarTodasCategoriasUseCase(categoriaRepository)
const buscarCategoriaPorIdUseCase = new BuscarCategoriaPorIdUseCase(categoriaRepository)
const buscarCategoriasPorCategoriaPaiIdUseCase = new BuscarCategoriasPorCategoriaPaiIdUseCase(categoriaRepository)
export const categoriaController = new CategoriaController(buscarTodasCategoriasUseCase, buscarCategoriaPorIdUseCase, buscarCategoriasPorCategoriaPaiIdUseCase)
//#endregion

//#region servico.routes.ts
const servicoRepository = new ServicoMongodbRepositoryImpl()
const cadastrarServicoUseCase = new CadastrarServicoUseCase(servicoRepository, categoriaRepository)
const buscarServicosPrestadorLogadoUseCase = new BuscarServicosPrestadorLogadoUseCase(servicoRepository)
const buscarServicoPorIdUseCase = new BuscarServicoPorIdUseCase(servicoRepository)
const atualizarServicoUseCase = new AtualizarServicoUseCase(servicoRepository, categoriaRepository)
const deletarServicoUseCase = new DeletarServicoUseCase(servicoRepository)
export const servicoController = new ServicoController(
    cadastrarServicoUseCase,
    buscarServicosPrestadorLogadoUseCase,
    buscarServicoPorIdUseCase,
    atualizarServicoUseCase,
    deletarServicoUseCase
)
//#endregion

//#region solicitacao.routes.ts
const solicitacaoRepository = new SolicitacaoMongodbRepositoryImpl()
const cadastrarSolicitacaoUseCase = new CadastrarSolicitacaoUseCase(solicitacaoRepository, categoriaRepository, prestadorRepository)
const buscarSolicitacoesClienteLogadoUseCase = new BuscarSolicitacoesClienteLogadoUseCase(solicitacaoRepository)
const buscarSolicitacoesDisponiveisPrestadorUseCase = new BuscarSolicitacoesDisponiveisPrestadorUseCase(solicitacaoRepository, servicoRepository)
const buscarSolicitacaoPorIdUseCase = new BuscarSolicitacaoPorIdUseCase(solicitacaoRepository, servicoRepository)
const atualizarSolicitacaoUseCase = new AtualizarSolicitacaoUseCase(solicitacaoRepository)
export const solicitacaoController = new SolicitacaoController(
    cadastrarSolicitacaoUseCase,
    buscarSolicitacoesClienteLogadoUseCase,
    buscarSolicitacoesDisponiveisPrestadorUseCase,
    buscarSolicitacaoPorIdUseCase,
    atualizarSolicitacaoUseCase
)
//#endregion
