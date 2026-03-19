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
    { name: 'Me', description: 'Endpoints do usuário autenticado' },
    { name: 'Courses', description: 'Endpoints de cursos' },
    { name: 'Sections', description: 'Endpoints de seções' },
    { name: 'Activities', description: 'Endpoints de atividades' },
    { name: 'Progress', description: 'Endpoints de progresso' },
    { name: 'Certificates', description: 'Endpoints de certificados' },
    { name: 'Tags', description: 'Endpoints de tags' },
    { name: 'Institutions', description: 'Endpoints de instituições' },
    { name: 'Media', description: 'Upload e listagem de mídia' },
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
          imageMediaId: { type: 'string', nullable: true },
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
          videoMediaId: { type: 'string', nullable: true },
          thumbnailMediaId: { type: 'string', nullable: true },
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
          ownerId: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          shortDescription: { type: 'string' },
          imageMediaId: { type: 'string' },
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
          'imageMediaId',
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
                  imageMediaId: { type: 'string' },
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
                  imageMediaId: { type: 'string' },
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
      AdminUserListItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          status: { $ref: '#/components/schemas/RegistrationStatus' },
          registrationSubmittedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          registrationApprovedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
        required: ['id', 'role', 'firstName', 'lastName', 'email', 'status'],
      },
      AdminUserRoleToggleResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
        },
        required: ['id', 'role'],
      },
      AdminUserDeleteResponse: {
        type: 'object',
        properties: {
          deleted: { type: 'boolean' },
        },
        required: ['deleted'],
      },
      AdminUserDetailResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          status: { $ref: '#/components/schemas/RegistrationStatus' },
          motivations: { type: 'string', nullable: true },
          academicBackground: { type: 'string', nullable: true },
          professionalExperience: { type: 'string', nullable: true },
        },
        required: ['id', 'name', 'email', 'status'],
      },
      AdminRejectRequest: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['reason'],
      },
      Tag: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'slug', 'isActive', 'createdAt', 'updatedAt'],
      },
      TagPayload: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      Institution: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          domain: { type: 'string', example: '@example.com' },
          secondaryDomain: {
            type: 'string',
            nullable: true,
            example: '@sub.example.com',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'domain', 'createdAt', 'updatedAt'],
      },
      InstitutionPayload: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          domain: { type: 'string', example: '@example.com' },
          secondaryDomain: {
            type: 'string',
            nullable: true,
            example: '@sub.example.com',
          },
        },
        required: ['name', 'domain'],
      },
      Media: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          ownerId: { type: 'string', format: 'uuid' },
          kind: { type: 'string', enum: ['image', 'video'] },
          title: { type: 'string' },
          altText: { type: 'string' },
          description: { type: 'string' },
          streamUrl: { type: 'string' },
          filename: { type: 'string' },
          contentType: { type: 'string' },
          size: { type: 'integer' },
          gridFsId: { type: 'string' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: [
          'ownerId',
          'kind',
          'title',
          'altText',
          'description',
          'streamUrl',
          'filename',
          'contentType',
          'size',
          'gridFsId',
          'status',
          'createdAt',
          'updatedAt',
        ],
      },
      MediaListResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Media' },
          },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
        },
        required: ['items', 'page', 'limit', 'total'],
      },
      MediaMetadataUpdateRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          altText: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'altText', 'description'],
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
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Listar todos os usuários do sistema (ADMIN)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de usuários para painel administrativo',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AdminUserListItem' },
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
    '/admin/users/{userId}': {
      get: {
        tags: ['Admin'],
        summary: 'Buscar usuário por id (ADMIN)',
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
            description: 'Detalhes do usuário',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminUserDetailResponse',
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
          '404': {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'USER_NOT_FOUND' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Excluir usuário e dados de candidatura/revisão (ADMIN)',
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
            description: 'Usuário removido com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminUserDeleteResponse',
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
            description: 'Operação inválida para o próprio admin autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'SELF_DELETE_NOT_ALLOWED' },
              },
            },
          },
        },
      },
    },
    '/admin/users/{userId}/role': {
      patch: {
        tags: ['Admin'],
        summary: 'Alternar role entre USER e ADMIN',
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
            description: 'Role atualizada com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AdminUserRoleToggleResponse',
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
            description: 'Operação inválida para o próprio admin autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'SELF_ROLE_CHANGE_NOT_ALLOWED' },
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
    '/admin/media': {
      get: {
        tags: ['Admin'],
        summary: 'Listar todas as mídias (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: 'kind',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['image', 'video'] },
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          },
        ],
        responses: {
          '200': {
            description: 'Lista global de mídias',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaListResponse' },
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
    '/me/courses': {
      get: {
        tags: ['Me'],
        summary: 'Listar cursos do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de cursos do usuário',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Course' },
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
    '/me/media': {
      get: {
        tags: ['Me'],
        summary: 'Listar mídias do usuário autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
          {
            name: 'kind',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['image', 'video'] },
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de mídias do usuário',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaListResponse' },
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
    '/courses': {
      get: {
        tags: ['Courses'],
        summary: 'Lista todos os cursos com seções e atividades',
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
    '/courses/{id}/activate': {
      post: {
        tags: ['Courses'],
        summary: 'Ativar curso por ID',
        security: [{ bearerAuth: [] }],
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
            description: 'Curso ativado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Course' },
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
            description: 'Sem permissão para o curso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'COURSE_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
    '/courses/{id}/deactivate': {
      post: {
        tags: ['Courses'],
        summary: 'Desativar curso por ID',
        security: [{ bearerAuth: [] }],
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
            description: 'Curso desativado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Course' },
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
            description: 'Sem permissão para o curso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'COURSE_NOT_FOUND' },
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
      get: {
        tags: ['Activities'],
        summary: 'Busca uma atividade por ID',
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
            description: 'Atividade encontrada',
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
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'ACTIVITY_NOT_FOUND' },
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
    '/tags': {
      get: {
        tags: ['Tags'],
        summary: 'Listar tags',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de tags',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Tag' },
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
      post: {
        tags: ['Tags'],
        summary: 'Criar tag',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TagPayload' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tag criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tag' },
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
    '/tags/{id}': {
      get: {
        tags: ['Tags'],
        summary: 'Buscar tag por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Tag encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tag' },
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
          '404': {
            description: 'Tag não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'TAG_NOT_FOUND' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Tags'],
        summary: 'Atualizar tag',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TagPayload' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tag atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tag' },
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
          '404': {
            description: 'Tag não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'TAG_NOT_FOUND' },
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
      delete: {
        tags: ['Tags'],
        summary: 'Remover tag',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Tag removida' },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'UNAUTHORIZED' },
              },
            },
          },
          '404': {
            description: 'Tag não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'TAG_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
    '/institutions': {
      get: {
        tags: ['Institutions'],
        summary: 'Listar instituições',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de instituições',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Institution' },
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
      post: {
        tags: ['Institutions'],
        summary: 'Criar instituição',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InstitutionPayload' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Instituição criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Institution' },
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
    '/institutions/{id}': {
      get: {
        tags: ['Institutions'],
        summary: 'Buscar instituição por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Instituição encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Institution' },
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
          '404': {
            description: 'Instituição não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INSTITUTION_NOT_FOUND' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Institutions'],
        summary: 'Atualizar instituição',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InstitutionPayload' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Instituição atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Institution' },
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
          '404': {
            description: 'Instituição não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INSTITUTION_NOT_FOUND' },
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
      delete: {
        tags: ['Institutions'],
        summary: 'Remover instituição',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': { description: 'Instituição removida' },
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
          '404': {
            description: 'Instituição não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INSTITUTION_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
    '/media/images': {
      post: {
        tags: ['Media'],
        summary: 'Upload binário de imagem (Mongo/GridFS)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Imagem enviada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
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
          '422': {
            description: 'Arquivo ausente ou tipo inválido',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/ValidationErrorResponse' },
                    { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/media/videos': {
      post: {
        tags: ['Media'],
        summary: 'Upload binário de vídeo (Mongo/GridFS)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Vídeo enviado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
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
          '422': {
            description: 'Arquivo ausente ou tipo inválido',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/ValidationErrorResponse' },
                    { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/media/images/{id}': {
      get: {
        tags: ['Media'],
        summary: 'Obter metadados de imagem por ID',
        security: [{ bearerAuth: [] }],
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
            description: 'Metadados da imagem',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso à mídia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                examples: {
                  forbidden: { value: { code: 'FORBIDDEN' } },
                  inactive: { value: { code: 'MEDIA_INACTIVE' } },
                },
              },
            },
          },
          '404': {
            description: 'Mídia não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_NOT_FOUND' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Media'],
        summary: 'Excluir imagem por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Imagem excluída com sucesso' },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso à mídia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
          '404': {
            description: 'Mídia não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
    '/media/images/{id}/metadata': {
      post: {
        tags: ['Media'],
        summary: 'Criar metadados SQL da imagem por ID',
        security: [{ bearerAuth: [] }],
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
              schema: {
                $ref: '#/components/schemas/MediaMetadataUpdateRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Metadados da imagem salvos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso à mídia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
          '404': {
            description: 'Mídia não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_NOT_FOUND' },
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
      put: {
        tags: ['Media'],
        summary: 'Atualizar metadados SQL da imagem por ID',
        security: [{ bearerAuth: [] }],
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
              schema: {
                $ref: '#/components/schemas/MediaMetadataUpdateRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Metadados da imagem atualizados',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '404': {
            description: 'Metadados não encontrados para atualização',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_METADATA_NOT_FOUND' },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso à mídia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
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
    '/media/videos/{id}': {
      get: {
        tags: ['Media'],
        summary: 'Obter metadados de vídeo por ID',
        security: [{ bearerAuth: [] }],
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
            description: 'Metadados do vídeo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso à mídia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                examples: {
                  forbidden: { value: { code: 'FORBIDDEN' } },
                  inactive: { value: { code: 'MEDIA_INACTIVE' } },
                },
              },
            },
          },
          '404': {
            description: 'Mídia não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_NOT_FOUND' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Media'],
        summary: 'Excluir vídeo por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Vídeo excluído com sucesso' },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso à mídia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
          '404': {
            description: 'Mídia não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
    '/media/videos/{id}/metadata': {
      post: {
        tags: ['Media'],
        summary: 'Criar metadados SQL do vídeo por ID',
        security: [{ bearerAuth: [] }],
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
              schema: {
                $ref: '#/components/schemas/MediaMetadataUpdateRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Metadados do vídeo salvos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso à mídia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
              },
            },
          },
          '404': {
            description: 'Mídia não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_NOT_FOUND' },
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
      put: {
        tags: ['Media'],
        summary: 'Atualizar metadados SQL do vídeo por ID',
        security: [{ bearerAuth: [] }],
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
              schema: {
                $ref: '#/components/schemas/MediaMetadataUpdateRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Metadados do vídeo atualizados',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '404': {
            description: 'Metadados não encontrados para atualização',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_METADATA_NOT_FOUND' },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso à mídia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'FORBIDDEN' },
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
    '/media/{id}/stream': {
      get: {
        tags: ['Media'],
        summary: 'Stream de mídia por ID',
        security: [{ bearerAuth: [] }],
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
            description: 'Stream do conteúdo binário',
            content: {
              'application/octet-stream': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          '400': {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'INVALID_MEDIA_ID' },
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
            description: 'Sem acesso ao arquivo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                examples: {
                  forbidden: { value: { code: 'FORBIDDEN' } },
                  inactive: { value: { code: 'MEDIA_INACTIVE' } },
                },
              },
            },
          },
          '404': {
            description: 'Mídia não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'MEDIA_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
  },
} as const
