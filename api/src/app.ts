import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec, ROTA_DOCS } from "./http/docs/swagger.config";
import prestadorRouter from "./http/routes/usuario/prestador/prestador.routes";
import usuarioRouter from "./http/routes/usuario/shared/usuario.routes";
import authRouter from "./http/routes/usuario/shared/auth/auth.routes";
import servicoRouter from "./http/routes/servico/servico.routes";
import clienteRouter from "./http/routes/usuario/cliente/cliente.routes";
import categoriaRouter from "./http/routes/categoria/categoria.routes";
import solicitacaoRouter from "./http/routes/solicitacao/solicitacao.routes";
import orcamentoRouter from "./http/routes/orcamento/orcamento.routes";
import contratoRouter from "./http/routes/contrato/contrato.routes";
import avaliacaoRouter from "./http/routes/avaliacao/avaliacao.routes";
import { errorHandler } from "./http/middlewares/error-handler/error-handler.middleware";

const rotaRaiz = '/contrataai-api'
const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:4200']

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.use(ROTA_DOCS, swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get(`${ROTA_DOCS}.json`, (_req, res) => {
    res.json(swaggerSpec)
})

app.use(rotaRaiz, usuarioRouter)
app.use(rotaRaiz, clienteRouter)
app.use(rotaRaiz, prestadorRouter)
app.use(rotaRaiz, authRouter)
app.use(rotaRaiz, servicoRouter)
app.use(rotaRaiz, categoriaRouter)
app.use(rotaRaiz, solicitacaoRouter)
app.use(rotaRaiz, orcamentoRouter)
app.use(rotaRaiz, contratoRouter)
app.use(rotaRaiz, avaliacaoRouter)

app.use(errorHandler)

export default app
