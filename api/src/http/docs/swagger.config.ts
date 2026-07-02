import swaggerJSDoc from 'swagger-jsdoc'

/**
 * Prefixo raiz de todas as rotas da API (idêntico ao usado em `app.ts`).
 * Exportado para que o `app.ts` monte o Swagger UI sob o mesmo prefixo.
 */
export const ROTA_DOCS = '/contrataai-api/docs'

/**
 * Resolve os arquivos de rotas que o swagger-jsdoc deve escanear em busca dos
 * blocos `@openapi`. Em desenvolvimento o processo roda via ts-node (.ts em
 * `src/`); em produção roda o build compilado (.js em `dist/`). A extensão do
 * próprio arquivo (`__filename`) indica em qual contexto estamos.
 */
// Globs sempre com barra normal (`/`): a lib `glob` interpreta `\` como escape,
// então `path.join` no Windows (que gera `\`) quebraria a varredura dos arquivos.
const emTypeScript = __filename.endsWith('.ts')
const padraoArquivosDeRotas = emTypeScript
    ? 'src/http/routes/**/*.routes.ts'
    : 'dist/http/routes/**/*.routes.js'

/**
 * Esquema de segurança reutilizável. As rotas protegidas referenciam-no via
 * `security: [{ bearerAuth: [] }]`. O token é enviado no header
 * `Authorization: Bearer <token>`.
 */
const securitySchemes = {
    bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido em `POST /login`. Envie no header `Authorization: Bearer <token>`.',
    },
} as const

/**
 * Monta o `content` de uma resposta de erro, sempre com o schema `ErroResposta`
 * e um `example` com a mensagem real produzida pela API para aquele caso.
 */
const conteudoErro = (mensagem: string) => ({
    'application/json': {
        schema: { $ref: '#/components/schemas/ErroResposta' },
        example: { message: mensagem },
    },
})
const respostaErro = (descricao: string, mensagem: string) => ({
    description: descricao,
    content: conteudoErro(mensagem),
})
// `RecursoNaoEncontradoError` produz sempre `"<Recurso> não encontrado."`.
const resposta404 = (recurso: string) => respostaErro(`${recurso} não encontrado.`, `${recurso} não encontrado.`)

/**
 * Respostas de erro reutilizáveis. Cada uma carrega o `example` com a mensagem
 * exata que o `errorHandler` retorna (`{ "message": string }`). Os erros 401,
 * 403 e 500 têm texto fixo; os 404 variam por recurso. O 422 é específico de
 * cada rota e por isso é declarado inline em cada bloco `@openapi`.
 */
const responses = {
    Erro401Credenciais: respostaErro(
        'Credenciais inválidas (e-mail inexistente ou senha incorreta).',
        'Credenciais inválidas! Verifique suas credenciais e tente novamente.',
    ),
    Erro403Autenticacao: respostaErro(
        'Token JWT ausente, inválido ou expirado.',
        'Acesso negado! É necessário se autenticar novamente.',
    ),
    Erro403Prestador: respostaErro(
        'Usuário autenticado, mas sem o perfil de prestador ativo exigido pela rota.',
        'Acesso negado! É necessário ter o perfil de prestador ativo.',
    ),
    Erro403LoginDuplicado: respostaErro(
        'Já existe um login ativo — login duplicado não é permitido.',
        'Login duplicado não permitido! Você já possui um login ativo.',
    ),
    Erro404Avaliacao: resposta404('Avaliação'),
    Erro404Categoria: resposta404('Categoria'),
    Erro404Cliente: resposta404('Cliente'),
    Erro404Contrato: resposta404('Contrato'),
    Erro404ExtensaoPrazo: resposta404('Extensão de prazo'),
    Erro404Orcamento: resposta404('Orçamento'),
    Erro404Prestador: resposta404('Prestador'),
    Erro404Servico: resposta404('Serviço'),
    Erro404Solicitacao: resposta404('Solicitação'),
    Erro404Usuario: resposta404('Usuário'),
    Erro500: respostaErro('Erro interno do servidor.', 'Erro interno do servidor.'),
}

/**
 * Schemas (componentes) reutilizáveis de request e response.
 * Espelham exatamente os DTOs de `domain/dto` (entrada) e `http/dto` (saída).
 */
const schemas = {
    // ----------------------------------------------------------------- Comum
    ErroResposta: {
        type: 'object',
        description: 'Formato padrão de erro retornado pelo errorHandler.',
        properties: {
            message: { type: 'string', example: 'Mensagem descritiva do erro.' },
        },
    },

    // ------------------------------------------------------------ Autenticação
    LoginRequest: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
            email: { type: 'string', format: 'email', description: 'Formato de e-mail válido.', example: 'fulano@gmail.com' },
            senha: { type: 'string', format: 'password', example: 'SenhaForte123' },
        },
    },
    LoginResposta: {
        type: 'string',
        description: 'Token JWT (válido por 2h). Retornado como string JSON pura.',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },

    // --------------------------------------------------------------- Usuários
    UsuarioCadastroRequest: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
            nome: { type: 'string', minLength: 3, maxLength: 150, example: 'João da Silva' },
            email: { type: 'string', format: 'email', description: 'Formato de e-mail válido.', example: 'joao@gmail.com' },
            senha: { type: 'string', format: 'password', minLength: 6, maxLength: 64, example: 'SenhaForte123' },
        },
    },
    ClienteRespostaCadastro: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abcd34' },
            nome: { type: 'string', example: 'João da Silva' },
            email: { type: 'string', format: 'email', example: 'joao@gmail.com' },
        },
    },
    ClientePrestadorRespostaCadastro: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abcd34' },
            idPrestador: { type: 'string', nullable: true, example: '665f1b2c9a1e4a0012abcd99' },
            nome: { type: 'string', example: 'João da Silva' },
            email: { type: 'string', format: 'email', example: 'joao@gmail.com' },
        },
    },
    AtualizarClienteRequest: {
        type: 'object',
        description: 'Todos os campos são opcionais; apenas os enviados são atualizados.',
        properties: {
            nome: { type: 'string', minLength: 3, maxLength: 150, description: 'Opcional. Entre 3 e 150 caracteres.', example: 'João Silva' },
            senha: { type: 'string', format: 'password', minLength: 6, maxLength: 64, description: 'Opcional. Entre 6 e 64 caracteres.', example: 'NovaSenha123' },
            telefone: { type: 'string', description: 'Opcional. Celular brasileiro com DDD (somente dígitos).', example: '11987654321' },
            whatsapp: { type: 'string', description: 'Opcional. Celular brasileiro com DDD (somente dígitos).', example: '11987654321' },
            localizacaoCidade: { type: 'string', minLength: 3, maxLength: 32, description: 'Opcional. Entre 3 e 32 caracteres.', example: 'São Paulo' },
            localizacaoCep: { type: 'string', pattern: '^\\d{5}-?\\d{3}$', description: 'Opcional. CEP brasileiro (8 dígitos, com ou sem hífen).', example: '01001000' },
        },
    },
    ClientePerfil: {
        type: 'object',
        description: 'Perfil completo do cliente logado.',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abcd34' },
            nome: { type: 'string', example: 'João da Silva' },
            email: { type: 'string', format: 'email', example: 'joao@gmail.com' },
            telefone: { type: 'string', nullable: true, example: '11912345678' },
            whatsapp: { type: 'string', nullable: true, example: '11912345678' },
            localizacaoCidade: { type: 'string', nullable: true, example: 'São Paulo' },
            localizacaoCep: { type: 'string', nullable: true, example: '01001000' },
            reputacao_flag_cancelamento: { type: 'integer', example: 0 },
            ativo: { type: 'boolean', example: true },
        },
    },
    ClientePerfilPublico: {
        type: 'object',
        description: 'Visão pública/parcial de um cliente.',
        properties: {
            nome: { type: 'string', example: 'João da Silva' },
            whatsapp: { type: 'string', nullable: true, example: '11912345678' },
            reputacao_flag_cancelamento: { type: 'integer', example: 0 },
        },
    },

    // ------------------------------------------------------------- Prestadores
    PrestadorRespostaCadastro: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abcd99' },
            idCliente: { type: 'string', example: '665f1b2c9a1e4a0012abcd34' },
        },
    },
    PrestadorPerfilCompleto: {
        type: 'object',
        description: 'Perfil completo do prestador logado.',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abcd99' },
            idCliente: { type: 'string', example: '665f1b2c9a1e4a0012abcd34' },
            telefone: { type: 'string', nullable: true, example: '11912345678' },
            descricao: { type: 'string', nullable: true, example: 'Eletricista com 10 anos de experiência.' },
        },
    },
    PrestadorPerfilPublico: {
        type: 'object',
        description: 'Visão pública de um prestador.',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abcd99' },
            descricao: { type: 'string', nullable: true, example: 'Eletricista com 10 anos de experiência.' },
        },
    },
    AtualizarPrestadorRequest: {
        type: 'object',
        description: 'Todos os campos são opcionais; apenas os enviados são atualizados.',
        properties: {
            telefone: { type: 'string', description: 'Opcional. Celular brasileiro com DDD (somente dígitos).', example: '11987654321' },
            descricao: { type: 'string', minLength: 5, maxLength: 500, description: 'Opcional. Entre 5 e 500 caracteres.', example: 'Eletricista com 10 anos de experiência.' },
        },
    },
    PrestadorAtualizado: {
        type: 'object',
        properties: {
            descricao: { type: 'string', nullable: true, example: 'Eletricista residencial e predial.' },
            telefone: { type: 'string', nullable: true, example: '11912345678' },
        },
    },
    PrestadorBuscaResposta: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abcd99' },
            nome: { type: 'string', example: 'João da Silva' },
            descricao: { type: 'string', nullable: true, example: 'Eletricista com 10 anos de experiência.' },
            cidade: { type: 'string', nullable: true, example: 'São Paulo' },
        },
    },

    // -------------------------------------------------------------- Categorias
    CategoriaResposta: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc001' },
            nome: { type: 'string', example: 'Elétrica' },
            descricao: { type: 'string', nullable: true, example: 'Serviços elétricos em geral.' },
        },
    },
    CategoriaDetalheResposta: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc002' },
            nome: { type: 'string', example: 'Instalação de tomadas' },
            descricao: { type: 'string', nullable: true, example: 'Instalação e troca de tomadas.' },
            categoriaPaiId: { type: 'string', nullable: true, example: '665f1b2c9a1e4a0012abc001' },
        },
    },
    CategoriaAninhadaResposta: {
        type: 'object',
        description: 'Categoria raiz com suas subcategorias aninhadas.',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc001' },
            nome: { type: 'string', example: 'Elétrica' },
            descricao: { type: 'string', nullable: true, example: 'Serviços elétricos em geral.' },
            subcategorias: {
                type: 'array',
                items: { $ref: '#/components/schemas/CategoriaResposta' },
            },
        },
    },

    // ---------------------------------------------------------------- Serviços
    ServicoCadastroRequest: {
        type: 'object',
        required: ['idCategoria', 'descricao'],
        properties: {
            idCategoria: { type: 'string', description: 'ID da categoria do serviço.', example: '665f1b2c9a1e4a0012abc002' },
            descricao: { type: 'string', minLength: 5, maxLength: 500, example: 'Instalação completa de tomadas e interruptores.' },
            precoMin: { type: 'number', minimum: 1, description: 'Opcional.', example: 80 },
            precoMax: { type: 'number', minimum: 1, description: 'Opcional.', example: 250 },
            prazoMedioDias: { type: 'integer', minimum: 1, description: 'Opcional.', example: 2 },
        },
    },
    ServicoAtualizacaoRequest: {
        type: 'object',
        description: 'Todos os campos são opcionais; apenas os enviados são atualizados.',
        properties: {
            idCategoria: { type: 'string', description: 'Opcional. ID da categoria do serviço.', example: '665f1b2c9a1e4a0012abc002' },
            descricao: { type: 'string', minLength: 5, maxLength: 500, description: 'Opcional.', example: 'Instalação de tomadas, interruptores e disjuntores.' },
            precoMin: { type: 'number', minimum: 1, description: 'Opcional.', example: 100 },
            precoMax: { type: 'number', minimum: 1, description: 'Opcional.', example: 300 },
            prazoMedioDias: { type: 'integer', minimum: 1, description: 'Opcional.', example: 3 },
        },
    },
    ServicoResposta: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc010' },
            idCategoria: { type: 'string', example: '665f1b2c9a1e4a0012abc002' },
            descricao: { type: 'string', example: 'Instalação completa de tomadas e interruptores.' },
            precoMin: { type: 'number', nullable: true, example: 80 },
            precoMax: { type: 'number', nullable: true, example: 250 },
            prazoMedioDias: { type: 'integer', nullable: true, example: 2 },
        },
    },

    // ------------------------------------------------------------- Solicitações
    SolicitacaoCadastroRequest: {
        type: 'object',
        required: ['idCategoria', 'descricao'],
        properties: {
            idCategoria: { type: 'string', description: 'ID da categoria do serviço.', example: '665f1b2c9a1e4a0012abc002' },
            descricao: { type: 'string', minLength: 5, maxLength: 300, example: 'Preciso instalar 5 tomadas na sala.' },
            idPrestadorDireto: {
                type: 'string',
                nullable: true,
                description: 'Opcional. Quando informado, direciona a solicitação a um prestador específico.',
                example: '665f1b2c9a1e4a0012abcd99',
            },
        },
    },
    SolicitacaoAtualizacaoRequest: {
        type: 'object',
        description: 'Todos os campos são opcionais; apenas os enviados são atualizados.',
        properties: {
            descricao: { type: 'string', minLength: 5, maxLength: 300, description: 'Opcional.', example: 'Instalar 6 tomadas na sala e 2 no quarto.' },
            status: {
                type: 'string',
                enum: ['aberta', 'cancelada', 'encerrada'],
                description: 'Opcional. Um dos valores permitidos.',
                example: 'cancelada',
            },
        },
    },
    SolicitacaoResposta: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc020' },
            idCliente: { type: 'string', example: '665f1b2c9a1e4a0012abcd34' },
            idCategoria: { type: 'string', example: '665f1b2c9a1e4a0012abc002' },
            idPrestadorDireto: { type: 'string', nullable: true, example: '665f1b2c9a1e4a0012abcd99' },
            descricao: { type: 'string', example: 'Preciso instalar 5 tomadas na sala.' },
            status: {
                type: 'string',
                enum: ['aberta', 'cancelada', 'encerrada'],
                example: 'aberta',
            },
            dataSolicitacao: { type: 'string', format: 'date-time', example: '2026-06-26T12:00:00.000Z' },
        },
    },

    // --------------------------------------------------------------- Orçamentos
    OrcamentoCadastroRequest: {
        type: 'object',
        required: ['idSolicitacao', 'valor'],
        properties: {
            idSolicitacao: { type: 'string', description: 'ID da solicitação.', example: '665f1b2c9a1e4a0012abc020' },
            valor: { type: 'number', minimum: 1, example: 180.5 },
            prazoDias: { type: 'integer', minimum: 1, nullable: true, description: 'Opcional. Valor mínimo: 1 (dias). Padrão: 15.', example: 3 },
        },
    },
    OrcamentoAtualizacaoRequest: {
        type: 'object',
        description: 'Todos os campos são opcionais; apenas os enviados são atualizados.',
        properties: {
            valor: { type: 'number', minimum: 1, description: 'Opcional.', example: 200 },
            prazoDias: { type: 'integer', minimum: 1, description: 'Opcional.', example: 4 },
            status: {
                type: 'string',
                enum: ['pendente', 'aceito', 'encerrado', 'cancelado'],
                description: 'Opcional. Um dos valores permitidos.',
                example: 'cancelado',
            },
        },
    },
    OrcamentoResposta: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc030' },
            idSolicitacao: { type: 'string', example: '665f1b2c9a1e4a0012abc020' },
            idPrestador: { type: 'string', example: '665f1b2c9a1e4a0012abcd99' },
            valor: { type: 'number', example: 180.5 },
            prazoDias: { type: 'integer', example: 3 },
            status: {
                type: 'string',
                enum: ['pendente', 'aceito', 'encerrado', 'cancelado'],
                example: 'pendente',
            },
            dataCriacao: { type: 'string', format: 'date-time', example: '2026-06-26T12:00:00.000Z' },
            dataAceite: { type: 'string', format: 'date-time', nullable: true, example: '2026-06-27T09:30:00.000Z' },
        },
    },

    // ---------------------------------------------------------------- Contratos
    ContratoAtualizacaoRequest: {
        type: 'object',
        description: 'Datas de planejamento do contrato. Campos opcionais.',
        properties: {
            dataInicioEstimada: { type: 'string', format: 'date-time', example: '2026-07-01T08:00:00.000Z' },
            prazoEstimado: { type: 'string', format: 'date-time', example: '2026-07-05T18:00:00.000Z' },
        },
    },
    ContratoStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
            status: {
                type: 'string',
                enum: ['aguardando_inicio', 'em_andamento', 'aguardando_confirmacao', 'concluido', 'cancelado'],
                description: 'Um dos status permitidos (respeitando as transições válidas).',
                example: 'em_andamento',
            },
        },
    },
    ContratoCancelamentoRequest: {
        type: 'object',
        required: ['motivo'],
        properties: {
            motivo: { type: 'string', description: 'Texto não deve ser vazio.', example: 'Não foi mais possível realizar o serviço na data combinada.' },
        },
    },
    ContratoProblemaRequest: {
        type: 'object',
        required: ['tipo', 'descricao'],
        properties: {
            tipo: {
                type: 'string',
                enum: ['servico_nao_realizado', 'qualidade_insatisfatoria', 'atraso', 'cobranca_indevida', 'comportamento_inadequado', 'outro'],
                description: 'Um dos tipos de problema permitidos.',
                example: 'atraso',
            },
            descricao: { type: 'string', minLength: 10, example: 'O prestador não compareceu na data acordada.' },
        },
    },
    ContratoProblema: {
        type: 'object',
        description: 'Problema relatado embutido no contrato.',
        properties: {
            tipo: {
                type: 'string',
                enum: ['servico_nao_realizado', 'qualidade_insatisfatoria', 'atraso', 'cobranca_indevida', 'comportamento_inadequado', 'outro'],
                example: 'atraso',
            },
            descricao: { type: 'string', example: 'O prestador não compareceu na data acordada.' },
            dataCriacao: { type: 'string', format: 'date-time', example: '2026-06-28T15:00:00.000Z' },
        },
    },
    ContratoResposta: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc040' },
            idSolicitacao: { type: 'string', example: '665f1b2c9a1e4a0012abc020' },
            idOrcamento: { type: 'string', example: '665f1b2c9a1e4a0012abc030' },
            idCliente: { type: 'string', example: '665f1b2c9a1e4a0012abcd34' },
            idPrestador: { type: 'string', example: '665f1b2c9a1e4a0012abcd99' },
            status: {
                type: 'string',
                enum: ['aguardando_inicio', 'em_andamento', 'aguardando_confirmacao', 'concluido', 'cancelado'],
                example: 'aguardando_inicio',
            },
            dataAceite: { type: 'string', format: 'date-time', example: '2026-06-27T09:30:00.000Z' },
            dataInicioEstimada: { type: 'string', format: 'date-time', nullable: true, example: '2026-07-01T08:00:00.000Z' },
            prazoEstimado: { type: 'string', format: 'date-time', nullable: true, example: '2026-07-05T18:00:00.000Z' },
            dataConclusao: { type: 'string', format: 'date-time', nullable: true, example: '2026-07-05T17:00:00.000Z' },
            cienciaPagamento: { type: 'boolean', example: false },
            whatsappLiberado: { type: 'boolean', example: false },
            motivoCancelamento: { type: 'string', nullable: true, example: 'Cliente desistiu do serviço.' },
            canceladoPor: { type: 'string', nullable: true, example: '665f1b2c9a1e4a0012abcd34' },
            problema: { allOf: [{ $ref: '#/components/schemas/ContratoProblema' }], nullable: true },
            whatsappPrestador: {
                type: 'string',
                nullable: true,
                description: 'Liberado apenas quando `whatsappLiberado === true`.',
                example: '11912345678',
            },
        },
    },

    // ----------------------------------------------------------- Extensão prazo
    ExtensaoPrazoCadastroRequest: {
        type: 'object',
        required: ['novoPrazo', 'justificativa'],
        properties: {
            novoPrazo: { type: 'string', format: 'date-time', description: 'Data/hora ISO 8601. Deve ser posterior ao prazo estimado atual.', example: '2026-07-10T18:00:00.000Z' },
            justificativa: { type: 'string', minLength: 5, maxLength: 500, example: 'Atraso na entrega de materiais pelo fornecedor.' },
        },
    },
    ExtensaoPrazoDecisaoRequest: {
        type: 'object',
        required: ['decisao'],
        properties: {
            decisao: {
                type: 'string',
                enum: ['aprovada', 'recusada'],
                description: 'Decisão sobre a extensão: aprovar ou recusar.',
                example: 'aprovada',
            },
        },
    },
    ExtensaoPrazoResposta: {
        type: 'object',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc050' },
            idContrato: { type: 'string', example: '665f1b2c9a1e4a0012abc040' },
            novoPrazo: { type: 'string', format: 'date-time', example: '2026-07-10T18:00:00.000Z' },
            justificativa: { type: 'string', example: 'Atraso na entrega de materiais pelo fornecedor.' },
            status: {
                type: 'string',
                enum: ['pendente', 'aprovada', 'recusada'],
                example: 'pendente',
            },
            dataSolicitacao: { type: 'string', format: 'date-time', example: '2026-06-29T10:00:00.000Z' },
            dataResposta: { type: 'string', format: 'date-time', nullable: true, example: '2026-06-30T11:00:00.000Z' },
        },
    },

    // --------------------------------------------------------------- Avaliações
    AvaliacaoCadastroRequest: {
        type: 'object',
        required: ['idContrato', 'nota'],
        properties: {
            idContrato: { type: 'string', description: 'ID do contrato avaliado.', example: '665f1b2c9a1e4a0012abc040' },
            nota: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comentario: { type: 'string', nullable: true, description: 'Opcional. Texto não vazio quando informado.', example: 'Serviço impecável, recomendo!' },
            anonima: { type: 'boolean', nullable: true, description: 'Opcional. Padrão: false.', example: false },
        },
    },
    AvaliacaoAtualizacaoRequest: {
        type: 'object',
        description: 'Todos os campos são opcionais; apenas os enviados são atualizados. Editável por até 7 dias após a criação.',
        properties: {
            nota: { type: 'integer', minimum: 1, maximum: 5, description: 'Opcional.', example: 4 },
            comentario: { type: 'string', description: 'Opcional. Texto não vazio quando informado.', example: 'Bom serviço, pequeno atraso.' },
            anonima: { type: 'boolean', description: 'Opcional.', example: true },
        },
    },
    AvaliacaoResposta: {
        type: 'object',
        description: 'Visão completa (autor da avaliação) — sempre expõe `idCliente`.',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc060' },
            idContrato: { type: 'string', example: '665f1b2c9a1e4a0012abc040' },
            idCliente: { type: 'string', example: '665f1b2c9a1e4a0012abcd34' },
            idPrestador: { type: 'string', example: '665f1b2c9a1e4a0012abcd99' },
            nota: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comentario: { type: 'string', nullable: true, example: 'Serviço impecável, recomendo!' },
            anonima: { type: 'boolean', example: false },
            dataCriacao: { type: 'string', format: 'date-time', example: '2026-07-06T10:00:00.000Z' },
            dataAtualizacao: { type: 'string', format: 'date-time', nullable: true, example: '2026-07-07T09:00:00.000Z' },
        },
    },
    AvaliacaoPublicaResposta: {
        type: 'object',
        description: 'Visão pública — `idCliente` é omitido quando `anonima === true` (RN08).',
        properties: {
            id: { type: 'string', example: '665f1b2c9a1e4a0012abc060' },
            idContrato: { type: 'string', example: '665f1b2c9a1e4a0012abc040' },
            idCliente: { type: 'string', nullable: true, example: '665f1b2c9a1e4a0012abcd34' },
            idPrestador: { type: 'string', example: '665f1b2c9a1e4a0012abcd99' },
            nota: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comentario: { type: 'string', nullable: true, example: 'Serviço impecável, recomendo!' },
            anonima: { type: 'boolean', example: false },
            dataCriacao: { type: 'string', format: 'date-time', example: '2026-07-06T10:00:00.000Z' },
            dataAtualizacao: { type: 'string', format: 'date-time', nullable: true, example: '2026-07-07T09:00:00.000Z' },
        },
    },
    AvaliacoesDoPrestadorResposta: {
        type: 'object',
        description: 'Avaliações públicas de um prestador acompanhadas de média e total (RF08).',
        properties: {
            avaliacoes: {
                type: 'array',
                items: { $ref: '#/components/schemas/AvaliacaoPublicaResposta' },
            },
            media: { type: 'number', example: 4.7 },
            total: { type: 'integer', example: 23 },
        },
    },
} as const

/**
 * Definição base do documento OpenAPI 3.0. As `paths` são geradas a partir dos
 * blocos `@openapi` escritos nos arquivos de rotas (`*.routes.ts`).
 */
const definition = {
    openapi: '3.0.3',
    info: {
        title: 'ContrataAí API',
        version: '1.0.0',
        description:
            'Documentação da API da plataforma **ContrataAí** — conecta clientes a prestadores de serviços. ' +
            'A maioria das rotas exige autenticação via JWT (`Authorization: Bearer <token>`), obtido em `POST /login`. ' +
            'Erros de domínio retornam o formato `{ "message": string }`.',
    },
    servers: [
        {
            url: '/contrataai-api',
            description: '(prefixo de todas as rotas)',
        },
    ],
    tags: [
        { name: 'Autenticação', description: 'Login e emissão de token JWT.' },
        { name: 'Usuários', description: 'Operações gerais de usuário (cliente/prestador).' },
        { name: 'Clientes', description: 'Cadastro e perfil de clientes.' },
        { name: 'Prestadores', description: 'Cadastro, perfil e busca de prestadores.' },
        { name: 'Categorias', description: 'Categorias e subcategorias de serviços.' },
        { name: 'Serviços', description: 'Serviços oferecidos pelos prestadores.' },
        { name: 'Solicitações', description: 'Solicitações de serviço dos clientes.' },
        { name: 'Orçamentos', description: 'Orçamentos enviados pelos prestadores.' },
        { name: 'Contratos', description: 'Contratos firmados entre cliente e prestador.' },
        { name: 'Extensões de Prazo', description: 'Solicitação e resposta de extensão de prazo de contratos.' },
        { name: 'Avaliações', description: 'Avaliações de prestadores pelos clientes.' },
    ],
    components: {
        securitySchemes,
        responses,
        schemas,
    },
}

/**
 * Especificação OpenAPI final, montada pelo swagger-jsdoc a partir da
 * `definition` acima e dos blocos `@openapi` dos arquivos de rotas.
 */
export const swaggerSpec = swaggerJSDoc({
    definition,
    apis: [padraoArquivosDeRotas],
})
