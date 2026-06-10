import { UsuarioController } from "../http/controllers/usuario/usuario.controller";
import { UsuarioPrestadorController } from "../http/controllers/usuario/usuario-prestador.controller";
import { VerificarEmailUseCase } from "../domain/use-cases/usuario/shared/verificar-email/verificar-email.use-case";
import { CadastrarClienteUseCase } from "../domain/use-cases/usuario/cliente/cadastrar-cliente/cadastrar-cliente.use-case";
import { CadastrarClientePrestadorUseCase } from "../domain/use-cases/usuario/shared/cadastrar-cliente-prestador/cadastrar-cliente-prestador.use-case";
import { UsuarioMongodbRepositoryImpl } from "../infra/repositories/usuario/usuario-mongodb.repository.impl";
import { PrestadorMongodbRepositoryImpl } from "../infra/repositories/prestador/prestador-mongodb.repository.impl";
import {
    CadastrarPrestadorUseCase
} from "../domain/use-cases/usuario/prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import { PrestadorController } from "../http/controllers/prestador/prestador.controller";
import { LoginUseCase } from "../domain/use-cases/usuario/shared/login/login.use-case";
import { AuthController } from "../http/controllers/auth/auth.controller";
import { ServicoMongodbRepositoryImpl } from "../infra/repositories/servico/servico-mongodb.repository.impl";
import { CadastrarServicoUseCase } from "../domain/use-cases/servico/cadastrar-servico/cadastrar-servico.use-case";
import { ServicoController } from "../http/controllers/servico/servico.controller";

//#region usuario.routes.ts
const usuarioRepository = new UsuarioMongodbRepositoryImpl()
const cadastrarUsuarioUseCase = new CadastrarClienteUseCase(usuarioRepository)
const verificarEmailUseCase = new VerificarEmailUseCase(usuarioRepository)
export const usuarioController = new UsuarioController(cadastrarUsuarioUseCase, verificarEmailUseCase)
//#endregion

//#region auth.routes.ts
const loginUseCase = new LoginUseCase(usuarioRepository)
export const authController = new AuthController(loginUseCase)
//#endregion

//#region prestador.routes.ts
const prestadorRepository = new PrestadorMongodbRepositoryImpl()
const cadastrarPrestadorUseCase = new CadastrarPrestadorUseCase(prestadorRepository, usuarioRepository)
export const prestadorController = new PrestadorController(cadastrarPrestadorUseCase)
//#endregion

//#region usuario-prestador.routes.ts
const criarClientePrestadorUseCase = new CadastrarClientePrestadorUseCase(cadastrarUsuarioUseCase, cadastrarPrestadorUseCase)
export const usuarioPrestadorController = new UsuarioPrestadorController(criarClientePrestadorUseCase)
//#endregion

//#region servico.routes.ts
const servicoRepository = new ServicoMongodbRepositoryImpl()
const cadastrarServicoUseCase = new CadastrarServicoUseCase(servicoRepository)
export const servicoController = new ServicoController(cadastrarServicoUseCase)
//#endregion