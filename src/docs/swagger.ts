export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Educado API',
    version: '1.0.0',
    description:
      'API backend do Educado para autenticação de usuários, cursos, seções, atividades, progresso e certificados.',
  },
  tags: [
    { name: 'User', description: 'Endpoints de usuário' },
    {
      name: 'Auth',
      description: 'Registro e autenticação com aprovação administrativa',
    },
    { name: 'Admin', description: 'Revisão administrativa de candidaturas' },
    { name: 'Courses', description: 'Endpoints de cursos' },
    { name: 'Sections', description: 'Endpoints de seções' },
    { name: 'Activities', description: 'Endpoints de atividades' },
    { name: 'Progress', description: 'Endpoints de progresso' },
    { name: 'Certificates', description: 'Endpoints de certificados' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['error'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'username'],
      },
      UserLoginRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'lucas_antunes' },
        },
        required: ['username'],
      },
      Activity: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sectionId: { type: 'string' },
          type: {
            type: 'string',
            enum: [
              'video_pause',
              'true_false',
              'text_reading',
              'multiple_choice',
            ],
          },
          order: { type: 'integer' },
          pauseTimestamp: { type: 'integer', nullable: true },
          textPages: {
            type: 'array',
            nullable: true,
            items: { type: 'string' },
          },
          question: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          options: {
            type: 'array',
            nullable: true,
            items: { type: 'string' },
          },
          correctAnswer: {
            nullable: true,
            oneOf: [
              { type: 'integer' },
              { type: 'boolean' },
              { type: 'string' },
            ],
          },
          icon: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'sectionId', 'type', 'order'],
      },
      Section: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          courseId: { type: 'string' },
          title: { type: 'string' },
          videoUrl: { type: 'string', nullable: true },
          thumbnailUrl: { type: 'string', nullable: true },
          duration: { type: 'integer', nullable: true },
          order: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'courseId', 'title', 'order'],
      },
      SectionWithActivities: {
        allOf: [
          { $ref: '#/components/schemas/Section' },
          {
            type: 'object',
            properties: {
              activities: {
                type: 'array',
                items: { $ref: '#/components/schemas/Activity' },
              },
            },
          },
        ],
      },
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          shortDescription: { type: 'string' },
          imageUrl: { type: 'string' },
          difficulty: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
          estimatedTime: { type: 'string' },
          passingThreshold: { type: 'integer' },
          category: { type: 'string' },
          rating: { type: 'number', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'title',
          'description',
          'shortDescription',
          'imageUrl',
          'difficulty',
          'estimatedTime',
          'passingThreshold',
          'category',
          'tags',
        ],
      },
      CourseWithSections: {
        allOf: [
          { $ref: '#/components/schemas/Course' },
          {
            type: 'object',
            properties: {
              sections: {
                type: 'array',
                items: { $ref: '#/components/schemas/SectionWithActivities' },
              },
            },
          },
        ],
      },
      SectionProgress: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          courseProgressId: { type: 'string', format: 'uuid' },
          sectionId: { type: 'string' },
          completed: { type: 'boolean' },
          score: { type: 'integer' },
          totalQuestions: { type: 'integer' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'courseProgressId',
          'sectionId',
          'completed',
          'score',
          'totalQuestions',
        ],
      },
      SectionProgressWithSection: {
        allOf: [
          { $ref: '#/components/schemas/SectionProgress' },
          {
            type: 'object',
            properties: {
              section: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                },
              },
            },
          },
        ],
      },
      CourseProgress: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          courseId: { type: 'string' },
          userId: { type: 'string', format: 'uuid' },
          startedAt: { type: 'string', format: 'date-time' },
          lastAccessedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'courseId', 'userId', 'startedAt', 'lastAccessedAt'],
      },
      CourseProgressListItem: {
        allOf: [
          { $ref: '#/components/schemas/CourseProgress' },
          {
            type: 'object',
            properties: {
              course: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  imageUrl: { type: 'string' },
                },
              },
              sections: {
                type: 'array',
                items: { $ref: '#/components/schemas/SectionProgress' },
              },
            },
          },
        ],
      },
      CourseProgressDetail: {
        allOf: [
          { $ref: '#/components/schemas/CourseProgress' },
          {
            type: 'object',
            properties: {
              course: { $ref: '#/components/schemas/Course' },
              sections: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/SectionProgressWithSection',
                },
              },
            },
          },
        ],
      },
      Certificate: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          courseId: { type: 'string' },
          userId: { type: 'string', format: 'uuid' },
          courseName: { type: 'string' },
          completedAt: { type: 'string', format: 'date-time' },
          userName: { type: 'string' },
          totalSections: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'courseId',
          'userId',
          'courseName',
          'completedAt',
          'userName',
          'totalSections',
        ],
      },
      CertificateListItem: {
        allOf: [
          { $ref: '#/components/schemas/Certificate' },
          {
            type: 'object',
            properties: {
              course: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  imageUrl: { type: 'string' },
                },
              },
            },
          },
        ],
      },
      CertificateCreateRequest: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          username: { type: 'string' },
          courseName: { type: 'string' },
          userName: { type: 'string' },
          totalSections: { type: 'integer' },
        },
        required: [
          'courseId',
          'username',
          'courseName',
          'userName',
          'totalSections',
        ],
      },
      SaveSectionProgressRequest: {
        type: 'object',
        properties: {
          score: { type: 'integer' },
          totalQuestions: { type: 'integer' },
        },
        required: ['score', 'totalQuestions'],
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          fieldErrors: {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: {
              email: 'EMAIL_INVALID',
              password: 'PASSWORD_POLICY',
              confirmPassword: 'PASSWORD_MISMATCH',
            },
          },
        },
        required: ['code', 'fieldErrors'],
      },
      CodeOnlyErrorResponse: {
        type: 'object',
        properties: {
          code: { type: 'string' },
        },
        required: ['code'],
      },
      RegistrationStatus: {
        type: 'string',
        enum: ['DRAFT_PROFILE', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      },
      RegistrationCreateRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          confirmPassword: { type: 'string', minLength: 8 },
        },
        required: [
          'firstName',
          'lastName',
          'email',
          'password',
          'confirmPassword',
        ],
      },
      RegistrationCreateResponse: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          registrationStatus: {
            $ref: '#/components/schemas/RegistrationStatus',
          },
        },
        required: ['userId', 'registrationStatus'],
      },
      RegistrationProfileRequest: {
        type: 'object',
        properties: {
          motivations: { type: 'string', minLength: 30, maxLength: 2000 },
          academicBackground: {
            type: 'string',
            minLength: 20,
            maxLength: 2000,
          },
          professionalExperience: {
            type: 'string',
            minLength: 20,
            maxLength: 4000,
          },
        },
        required: [
          'motivations',
          'academicBackground',
          'professionalExperience',
        ],
      },
      RegistrationStatusResponse: {
        type: 'object',
        properties: {
          status: { $ref: '#/components/schemas/RegistrationStatus' },
          reason: { type: 'string' },
        },
        required: ['status'],
      },
      RegistrationStatusTransitionResponse: {
        type: 'object',
        properties: {
          registrationStatus: {
            $ref: '#/components/schemas/RegistrationStatus',
          },
        },
        required: ['registrationStatus'],
      },
      AuthLoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      AuthenticatedUser: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          status: { $ref: '#/components/schemas/RegistrationStatus' },
        },
        required: ['id', 'firstName', 'lastName', 'email', 'role', 'status'],
      },
      AuthLoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          user: { $ref: '#/components/schemas/AuthenticatedUser' },
        },
        required: ['accessToken', 'user'],
      },
      AdminRegistrationListItem: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          status: { $ref: '#/components/schemas/RegistrationStatus' },
          createdAt: { type: 'string', format: 'date-time' },
          profileSummary: {
            nullable: true,
            oneOf: [
              {
                type: 'object',
                properties: {
                  motivations: { type: 'string' },
                  academicBackground: { type: 'string' },
                  professionalExperience: { type: 'string' },
                },
              },
              { type: 'null' },
            ],
          },
        },
        required: [
          'userId',
          'firstName',
          'lastName',
          'email',
          'status',
          'createdAt',
        ],
      },
      AdminRejectRequest: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['reason'],
      },
    },
  },
  paths: {
    '/user/login': {
      post: {
        tags: ['User'],
        summary: 'Login por username (legado)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserLoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Usuário autenticado/criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/user/me': {
      post: {
        tags: ['User'],
        summary: 'Validação simples de sessão',
        responses: {
          '200': {
            description: 'Resposta de teste',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Hello User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/registrations': {
      post: {
        tags: ['Auth'],
        summary: 'Criar conta em fase de pré-cadastro',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegistrationCreateRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Conta criada em rascunho de perfil',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationCreateResponse',
                },
              },
            },
          },
          '409': {
            description: 'Email já cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'EMAIL_ALREADY_EXISTS' },
              },
            },
          },
          '422': {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
              },
            },
          },
          '429': {
            description: 'Rate limit atingido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'RATE_LIMITED' },
              },
            },
          },
        },
      },
    },
    '/auth/registrations/me/profile': {
      put: {
        tags: ['Auth'],
        summary: 'Enviar/atualizar perfil de candidatura (usuário autenticado)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegistrationProfileRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Perfil enviado para análise',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationStatusTransitionResponse',
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'UNAUTHORIZED' },
              },
            },
          },
          '409': {
            description: 'Transição inválida de status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_STATUS_TRANSITION' },
              },
            },
          },
          '422': {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/registrations/{userId}/profile': {
      put: {
        tags: ['Auth'],
        summary: 'Enviar/atualizar perfil de candidatura após cadastro inicial',
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegistrationProfileRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Perfil enviado para análise',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationStatusTransitionResponse',
                },
              },
            },
          },
          '404': {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'USER_NOT_FOUND' },
              },
            },
          },
          '409': {
            description: 'Transição inválida de status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_STATUS_TRANSITION' },
              },
            },
          },
          '422': {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/registrations/me/status': {
      get: {
        tags: ['Auth'],
        summary: 'Consultar status da candidatura do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Status atual da candidatura',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationStatusResponse',
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'UNAUTHORIZED' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar usuário aprovado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthLoginResponse' },
              },
            },
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_CREDENTIALS' },
              },
            },
          },
          '403': {
            description: 'Conta ainda não aprovada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'ACCOUNT_NOT_APPROVED' },
              },
            },
          },
          '422': {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/admin/registrations': {
      get: {
        tags: ['Admin'],
        summary: 'Listar candidaturas por status',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { $ref: '#/components/schemas/RegistrationStatus' },
            description: 'Exemplo comum: PENDING_REVIEW',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de candidaturas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AdminRegistrationListItem',
                  },
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'UNAUTHORIZED' },
              },
            },
          },
          '403': {
            description: 'Acesso restrito para ADMIN',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
        },
      },
    },
    '/admin/registrations/{userId}/approve': {
      post: {
        tags: ['Admin'],
        summary: 'Aprovar candidatura pendente',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Candidatura aprovada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationStatusTransitionResponse',
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'UNAUTHORIZED' },
              },
            },
          },
          '403': {
            description: 'Acesso restrito para ADMIN',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
          '409': {
            description: 'Transição inválida de status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_STATUS_TRANSITION' },
              },
            },
          },
        },
      },
    },
    '/admin/registrations/{userId}/reject': {
      post: {
        tags: ['Admin'],
        summary: 'Reprovar candidatura pendente',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminRejectRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Candidatura reprovada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegistrationStatusTransitionResponse',
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'UNAUTHORIZED' },
              },
            },
          },
          '403': {
            description: 'Acesso restrito para ADMIN',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
          '409': {
            description: 'Transição inválida de status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_STATUS_TRANSITION' },
              },
            },
          },
          '422': {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/courses': {
      get: {
        tags: ['Courses'],
        summary: 'Lista todos os cursos com seções e atividades',
        responses: {
          '200': {
            description: 'Lista de cursos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CourseWithSections' },
                },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Courses'],
        summary: 'Cria um curso',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Course' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Curso criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Course' },
              },
            },
          },
          '400': {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'Busca um curso por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Curso encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseWithSections' },
              },
            },
          },
          '400': {
            description: 'Parâmetro inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Courses'],
        summary: 'Atualiza um curso por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Course' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Curso atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Course' },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Courses'],
        summary: 'Remove um curso por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Curso removido com sucesso' },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/sections': {
      get: {
        tags: ['Sections'],
        summary: 'Lista todas as seções',
        responses: {
          '200': {
            description: 'Lista de seções',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Section' },
                },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Sections'],
        summary: 'Cria uma seção',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Section' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Seção criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Section' },
              },
            },
          },
          '400': {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/sections/{id}': {
      get: {
        tags: ['Sections'],
        summary: 'Busca uma seção por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Seção encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Section' },
              },
            },
          },
          '404': {
            description: 'Seção não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Sections'],
        summary: 'Atualiza uma seção por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Section' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Seção atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Section' },
              },
            },
          },
          '404': {
            description: 'Seção não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Sections'],
        summary: 'Remove uma seção por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Seção removida com sucesso' },
          '404': {
            description: 'Seção não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/activities/section/{sectionId}': {
      get: {
        tags: ['Activities'],
        summary: 'Lista atividades por seção',
        parameters: [
          {
            name: 'sectionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de atividades',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Activity' },
                },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/activities': {
      post: {
        tags: ['Activities'],
        summary: 'Cria uma atividade',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Activity' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Atividade criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Activity' },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/activities/{id}': {
      put: {
        tags: ['Activities'],
        summary: 'Atualiza uma atividade por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Activity' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Atividade atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Activity' },
              },
            },
          },
          '404': {
            description: 'Atividade não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Activities'],
        summary: 'Remove uma atividade por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Atividade removida com sucesso' },
          '404': {
            description: 'Atividade não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/progress/{username}/courses': {
      get: {
        tags: ['Progress'],
        summary: 'Lista progresso de cursos por usuário',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de progresso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/CourseProgressListItem',
                  },
                },
              },
            },
          },
          '400': {
            description: 'Parâmetro inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/progress/{username}/courses/{courseId}': {
      get: {
        tags: ['Progress'],
        summary: 'Busca progresso detalhado de um curso por usuário',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Progresso encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseProgressDetail' },
              },
            },
          },
          '400': {
            description: 'Parâmetro inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Usuário ou progresso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/progress/{username}/courses/{courseId}/sections/{sectionId}': {
      post: {
        tags: ['Progress'],
        summary: 'Salva/atualiza progresso da seção',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'sectionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SaveSectionProgressRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Progresso da seção salvo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SectionProgress' },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/progress/{username}/courses/{courseId}/complete': {
      put: {
        tags: ['Progress'],
        summary: 'Marca curso como completo',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Progresso atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseProgress' },
              },
            },
          },
          '400': {
            description: 'Parâmetro inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Usuário ou progresso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/certificates/{username}': {
      get: {
        tags: ['Certificates'],
        summary: 'Lista certificados por usuário',
        parameters: [
          {
            name: 'username',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de certificados',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CertificateListItem' },
                },
              },
            },
          },
          '400': {
            description: 'Parâmetro inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/certificates': {
      post: {
        tags: ['Certificates'],
        summary: 'Cria um certificado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CertificateCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Certificado criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Certificate' },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Certificado já existe',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ErrorResponse' },
                    {
                      type: 'object',
                      properties: {
                        certificate: {
                          $ref: '#/components/schemas/Certificate',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
} as const
