import express from 'express';

import prestadorRouter from "./http/routes/usuario/prestador/prestador.routes";
import usuarioRouter from "./http/routes/usuario/shared/usuario.routes";
import authRouter from "./http/routes/usuario/shared/auth/auth.routes";
import servicoRouter from "./http/routes/servico/servico.routes";
import clienteRouter from "./http/routes/usuario/cliente/cliente.routes";
import categoriaRouter from "./http/routes/categoria/categoria.routes";
import solicitacaoRouter from "./http/routes/solicitacao/solicitacao.routes";
import orcamentoRouter from "./http/routes/orcamento/orcamento.routes";
import { errorHandler } from "./http/middlewares/error-handler/error-handler.middleware";

const rotaRaiz = '/contrataai-api'
const app = express()
app.use(express.json())

app.use(rotaRaiz, usuarioRouter)
app.use(rotaRaiz, clienteRouter)
app.use(rotaRaiz, prestadorRouter)
app.use(rotaRaiz, authRouter)
app.use(rotaRaiz, servicoRouter)
app.use(rotaRaiz, categoriaRouter)
app.use(rotaRaiz, solicitacaoRouter)
app.use(rotaRaiz, orcamentoRouter)

app.use(errorHandler)

export default app
