import { Router } from "express";

import { authController } from "../../../../../shared/container";
import { bloqueiaUsuarioAutenticado } from "../../../../middlewares/bloqueia-usuario-autenticado/bloqueia-usuario-autenticado.middleware";

const authRouter = Router()

//#region Documentação - POST /login
/**
 * @openapi
 * /login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Efetua login e retorna um token JWT
 *     description: Valida as credenciais e retorna um token JWT (válido por 2h) como string JSON pura. Bloqueia (403) quando já existe um login ativo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login efetuado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResposta'
 *       401:
 *         $ref: '#/components/responses/Erro401Credenciais'
 *       403:
 *         $ref: '#/components/responses/Erro403LoginDuplicado'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
authRouter.post('/login', bloqueiaUsuarioAutenticado, (req, res) => authController.login(req, res))
//#endregion

export default authRouter
