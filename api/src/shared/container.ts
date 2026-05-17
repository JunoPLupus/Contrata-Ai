import { UsuarioController } from "../http/controllers/usuario/usuario.controller";
import { VerificarEmailUseCase } from "../domain/use-cases/usuario/verificar-email/verificar-email.use-case";
import { CadastrarUsuarioUseCase } from "../domain/use-cases/usuario/cadastrar-usuario/cadastrar-usuario.use-case";
import { UsuarioMongodbRepositoryImpl } from "../infra/repositories/usuario/usuario-mongodb.repository.impl";
import {PrestadorMongodbRepositoryImpl} from "../infra/repositories/prestador/prestador-mongodb.repository.impl";
import {
    CadastrarPrestadorUseCase
} from "../domain/use-cases/prestador/cadastrar-prestador/cadastrar-prestador.use-case";
import {PrestadorController} from "../http/controllers/prestador/prestador.controller";

//#region usuario.routes.ts
const usuarioRepository = new UsuarioMongodbRepositoryImpl()
const cadastrarUsuarioUseCase = new CadastrarUsuarioUseCase(usuarioRepository)
const verificarEmailUseCase = new VerificarEmailUseCase(usuarioRepository)
export const usuarioController = new UsuarioController(cadastrarUsuarioUseCase, verificarEmailUseCase)
//#endregion

//#region prestador.routes.ts
const prestadorRepository = new PrestadorMongodbRepositoryImpl()
const cadastrarPrestadorUseCase = new CadastrarPrestadorUseCase(prestadorRepository)
export const prestadorController = new PrestadorController(cadastrarPrestadorUseCase)
//#endregion