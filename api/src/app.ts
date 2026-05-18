import express from 'express';

import prestadorRouter from "./http/routes/prestador/prestador.routes";
import usuarioRouter from "./http/routes/usuario/usuario.routes";
import { errorHandler } from "./http/middlewares/error-handler/error-handler.middleware";

const rotaRaiz = '/contrataai-api'
const app = express()
app.use(express.json())

app.use(rotaRaiz, usuarioRouter)
app.use(rotaRaiz, prestadorRouter)

app.use(errorHandler)

export default app