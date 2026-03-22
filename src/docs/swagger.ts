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
    {
      name: 'Student Auth',
      description: 'Registro e autenticação de estudantes (mobile)',
    },
    {
      name: 'Student Profile',
      description: 'Perfil do estudante (mobile)',
    },
    {
      name: 'Catalog',
      description: 'Catálogo público de cursos',
    },
    {
      name: 'Enrollments',
      description: 'Inscrição de estudantes em cursos',
    },
    {
      name: 'Student Progress',
      description: 'Progresso do estudante (autenticado via JWT)',
    },
    {
      name: 'Student Activities',
      description: 'Submissão de respostas de atividades',
    },
    {
      name: 'Gamification',
      description: 'Pontos, XP, níveis e badges',
    },
    {
      name: 'Leaderboard',
      description: 'Ranking global e por curso',
    },
    {
      name: 'Reviews',
      description: 'Avaliações e feedback de cursos',
    },
    {
      name: 'Student Certificates',
      description: 'Certificados do estudante e verificação',
    },
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
      // ---- Student / Mobile Schemas ----
      StudentRegistrationRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string', example: 'João' },
          lastName: { type: 'string', example: 'Silva' },
          email: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string', nullable: true },
          dateOfBirth: { type: 'string', format: 'date', nullable: true },
          deviceId: { type: 'string', nullable: true },
        },
        required: ['firstName', 'lastName'],
      },
      StudentAuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
            },
          },
        },
      },
      StudentProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          dateOfBirth: { type: 'string', nullable: true },
          avatarMediaId: { type: 'string', nullable: true },
          deviceId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CatalogCourse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          shortDescription: { type: 'string' },
          imageMediaId: { type: 'string' },
          difficulty: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
          estimatedTime: { type: 'string' },
          category: { type: 'string' },
          rating: { type: 'number', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          enrollmentCount: { type: 'integer' },
        },
      },
      CatalogCourseDetail: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          shortDescription: { type: 'string' },
          imageMediaId: { type: 'string' },
          difficulty: { type: 'string' },
          estimatedTime: { type: 'string' },
          passingThreshold: { type: 'number' },
          category: { type: 'string' },
          rating: { type: 'number', nullable: true },
          enrollmentCount: { type: 'integer' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                order: { type: 'integer' },
                duration: { type: 'integer', nullable: true },
              },
            },
          },
        },
      },
      Enrollment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          courseId: { type: 'string' },
          status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'DROPPED'] },
          enrolledAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          progressPercent: { type: 'integer' },
          completedSections: { type: 'integer' },
          totalSections: { type: 'integer' },
          course: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              shortDescription: { type: 'string' },
              imageMediaId: { type: 'string' },
              difficulty: { type: 'string' },
              estimatedTime: { type: 'string' },
              category: { type: 'string' },
              rating: { type: 'number', nullable: true },
            },
          },
        },
      },
      EnrollmentDetail: {
        type: 'object',
        properties: {
          enrollment: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              enrolledAt: { type: 'string', format: 'date-time' },
              completedAt: { type: 'string', nullable: true },
            },
          },
          course: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              imageMediaId: { type: 'string' },
              difficulty: { type: 'string' },
              estimatedTime: { type: 'string' },
              passingThreshold: { type: 'number' },
            },
          },
          progressPercent: { type: 'integer' },
          completedSections: { type: 'integer' },
          totalSections: { type: 'integer' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                order: { type: 'integer' },
                status: {
                  type: 'string',
                  enum: ['completed', 'in_progress', 'locked'],
                },
                score: { type: 'integer', nullable: true },
                totalQuestions: { type: 'integer', nullable: true },
              },
            },
          },
        },
      },
      GamificationSummary: {
        type: 'object',
        properties: {
          totalPoints: { type: 'integer' },
          currentLevel: { type: 'integer' },
          levelName: { type: 'string' },
          xpProgress: { type: 'integer' },
          xpNeeded: { type: 'integer' },
          currentStreak: { type: 'integer' },
          longestStreak: { type: 'integer' },
          coursesCompleted: { type: 'integer' },
          sectionsCompleted: { type: 'integer' },
          recentBadges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                key: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                iconUrl: { type: 'string', nullable: true },
                earnedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      LeaderboardResult: {
        type: 'object',
        properties: {
          month: { type: 'string', example: '2026-03' },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                rank: { type: 'integer' },
                userId: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                avatarMediaId: { type: 'string', nullable: true },
                points: { type: 'integer' },
              },
            },
          },
          userRank: {
            type: 'object',
            nullable: true,
            properties: {
              rank: { type: 'integer' },
              userId: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              points: { type: 'integer' },
            },
          },
          total: { type: 'integer' },
        },
      },
      CourseReviewRequest: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          tags: { type: 'array', items: { type: 'string' }, maxItems: 5 },
          comment: { type: 'string', nullable: true, maxLength: 1000 },
        },
        required: ['courseId', 'rating'],
      },
      CourseReviewItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          rating: { type: 'integer' },
          tags: { type: 'array', items: { type: 'string' } },
          comment: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              avatarMediaId: { type: 'string', nullable: true },
            },
          },
        },
      },
      StudentCertificate: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          courseId: { type: 'string' },
          courseName: { type: 'string' },
          userName: { type: 'string' },
          completedAt: { type: 'string', format: 'date-time' },
          totalSections: { type: 'integer' },
          hasPdf: { type: 'boolean' },
          verificationCode: { type: 'string', nullable: true },
          course: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              imageMediaId: { type: 'string' },
            },
          },
        },
      },
      AnswerSubmissionRequest: {
        type: 'object',
        properties: {
          answer: {
            description:
              'Resposta (number para múltipla escolha, boolean para V/F)',
          },
        },
        required: ['answer'],
      },
      AnswerSubmissionResponse: {
        type: 'object',
        properties: {
          activityId: { type: 'string' },
          correct: { type: 'boolean' },
          correctAnswer: {
            description: 'Resposta correta (tipo varia por atividade)',
          },
          attempts: { type: 'integer' },
        },
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
    // ========== Student Mobile Endpoints ==========
    '/student/auth/register': {
      post: {
        tags: ['Student Auth'],
        summary: 'Registrar estudante (sem senha)',
        description:
          'Cria uma conta de estudante com nome obrigatório. Email, celular, data de nascimento e deviceId são opcionais. Retorna JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/StudentRegistrationRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Estudante registrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudentAuthResponse' },
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
    '/student/auth/device-login': {
      post: {
        tags: ['Student Auth'],
        summary: 'Login por device ID',
        description:
          'Autentica um estudante pelo deviceId armazenado no registro.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  deviceId: { type: 'string', example: 'device-abc-123' },
                },
                required: ['deviceId'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login bem-sucedido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudentAuthResponse' },
              },
            },
          },
          '404': {
            description: 'Device não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'DEVICE_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
    '/student/profile': {
      get: {
        tags: ['Student Profile'],
        summary: 'Obter perfil do estudante',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Perfil do estudante',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudentProfile' },
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
      put: {
        tags: ['Student Profile'],
        summary: 'Atualizar perfil do estudante',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Perfil atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StudentProfile' },
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
    '/student/account': {
      delete: {
        tags: ['Student Profile'],
        summary: 'Excluir conta do estudante',
        description:
          'Remove permanentemente a conta do estudante e todos os dados associados (progresso, inscrições, certificados).',
        security: [{ bearerAuth: [] }],
        responses: {
          '204': { description: 'Conta excluída' },
          '401': {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/catalog/courses': {
      get: {
        tags: ['Catalog'],
        summary: 'Listar cursos ativos (público)',
        description:
          'Retorna cursos ativos com paginação, busca textual e filtros por categoria e dificuldade.',
        parameters: [
          {
            name: 'q',
            in: 'query',
            schema: { type: 'string' },
            description: 'Busca textual',
          },
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtrar por categoria',
          },
          {
            name: 'difficulty',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
            },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de cursos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CatalogCourse' },
                    },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/catalog/courses/{id}': {
      get: {
        tags: ['Catalog'],
        summary: 'Detalhes de um curso (público)',
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
            description: 'Detalhes do curso com seções',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CatalogCourseDetail' },
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
    '/catalog/categories': {
      get: {
        tags: ['Catalog'],
        summary: 'Listar categorias de cursos ativos',
        responses: {
          '200': {
            description: 'Lista de categorias',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categories: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/catalog/courses/{id}/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'Listar avaliações de um curso (público)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
          },
        ],
        responses: {
          '200': {
            description: 'Avaliações paginadas com resumo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CourseReviewItem' },
                    },
                    total: { type: 'integer' },
                    summary: {
                      type: 'object',
                      properties: {
                        averageRating: { type: 'number' },
                        totalReviews: { type: 'integer' },
                        distribution: {
                          type: 'object',
                          properties: {
                            '1': { type: 'integer' },
                            '2': { type: 'integer' },
                            '3': { type: 'integer' },
                            '4': { type: 'integer' },
                            '5': { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/student/enrollments': {
      post: {
        tags: ['Enrollments'],
        summary: 'Inscrever-se em um curso',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { courseId: { type: 'string' } },
                required: ['courseId'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Inscrição realizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    courseId: { type: 'string' },
                    status: { type: 'string', example: 'ACTIVE' },
                    enrolledAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Curso não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Já inscrito',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'ALREADY_ENROLLED' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Enrollments'],
        summary: 'Listar cursos inscritos',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de inscrições com progresso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    enrollments: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Enrollment' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/student/enrollments/{courseId}': {
      get: {
        tags: ['Enrollments'],
        summary: 'Detalhes da inscrição com progresso por seção',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Detalhe da inscrição',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EnrollmentDetail' },
              },
            },
          },
          '404': {
            description: 'Inscrição não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'ENROLLMENT_NOT_FOUND' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Enrollments'],
        summary: 'Desinscrever-se de um curso',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Desinscrição realizada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'DROPPED' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Inscrição não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/student/progress/courses': {
      get: {
        tags: ['Student Progress'],
        summary: 'Listar progresso de todos os cursos',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de progresso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    progress: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/student/progress/courses/{courseId}': {
      get: {
        tags: ['Student Progress'],
        summary: 'Progresso detalhado de um curso com seções (locked/unlocked)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Progresso do curso com seções',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EnrollmentDetail' },
              },
            },
          },
          '404': {
            description: 'Inscrição não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/student/progress/courses/{courseId}/sections/{sectionId}': {
      post: {
        tags: ['Student Progress'],
        summary: 'Salvar progresso de seção',
        description:
          'Registra a conclusão de uma seção com pontuação. Verifica desbloqueio sequencial e retém melhor pontuação.',
        security: [{ bearerAuth: [] }],
        parameters: [
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
                type: 'object',
                properties: {
                  score: { type: 'integer', example: 80 },
                  totalQuestions: { type: 'integer', example: 5 },
                },
                required: ['score', 'totalQuestions'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Progresso salvo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sectionId: { type: 'string' },
                    completed: { type: 'boolean' },
                    score: { type: 'integer' },
                    totalQuestions: { type: 'integer' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Seção bloqueada (acesso sequencial)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'SECTION_LOCKED' },
              },
            },
          },
        },
      },
    },
    '/student/progress/courses/{courseId}/complete': {
      put: {
        tags: ['Student Progress'],
        summary: 'Marcar curso como concluído',
        description:
          'Valida que todas as seções foram concluídas, emite certificado e atualiza inscrição para COMPLETED.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Curso concluído',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    courseId: { type: 'string' },
                    completedAt: { type: 'string', format: 'date-time' },
                    progressPercent: { type: 'integer', example: 100 },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Seções incompletas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'SECTIONS_INCOMPLETE' },
              },
            },
          },
        },
      },
    },
    '/student/activities/{activityId}/answer': {
      post: {
        tags: ['Student Activities'],
        summary: 'Submeter resposta de atividade',
        description:
          'Verifica a resposta contra a atividade, registra tentativa e retorna se está correta. Permite retentativas ilimitadas.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'activityId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AnswerSubmissionRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Resultado da resposta',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AnswerSubmissionResponse',
                },
              },
            },
          },
          '403': {
            description: 'Não inscrito no curso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'NOT_ENROLLED' },
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
        },
      },
    },
    '/student/gamification/summary': {
      get: {
        tags: ['Gamification'],
        summary: 'Resumo de gamificação do estudante',
        description:
          'Retorna pontos, nível, nome do nível, streak, badges recentes e barra de XP.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Resumo de gamificação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GamificationSummary' },
              },
            },
          },
        },
      },
    },
    '/student/gamification/badges': {
      get: {
        tags: ['Gamification'],
        summary: 'Listar badges ganhos pelo estudante',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de badges',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    badges: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          key: { type: 'string' },
                          name: { type: 'string' },
                          description: { type: 'string' },
                          iconUrl: { type: 'string', nullable: true },
                          earnedAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/student/gamification/points-history': {
      get: {
        tags: ['Gamification'],
        summary: 'Histórico de pontos (paginado)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
          },
        ],
        responses: {
          '200': {
            description: 'Histórico paginado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          action: {
                            type: 'string',
                            enum: [
                              'SECTION_COMPLETE',
                              'COURSE_COMPLETE',
                              'PERFECT_SCORE',
                              'DAILY_FIRST',
                              'LOGIN_STREAK',
                              'REVIEW_SUBMITTED',
                            ],
                          },
                          points: { type: 'integer' },
                          courseId: { type: 'string', nullable: true },
                          earnedAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/leaderboard/global': {
      get: {
        tags: ['Leaderboard'],
        summary: 'Leaderboard global mensal',
        description:
          'Top 30 estudantes do mês por pontos. Se autenticado, inclui posição do usuário.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'month',
            in: 'query',
            schema: { type: 'string', example: '2026-03' },
            description: 'Mês no formato YYYY-MM (padrão: mês atual)',
          },
        ],
        responses: {
          '200': {
            description: 'Leaderboard com top 30 + posição do usuário',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LeaderboardResult' },
              },
            },
          },
        },
      },
    },
    '/leaderboard/courses/{courseId}': {
      get: {
        tags: ['Leaderboard'],
        summary: 'Leaderboard por curso',
        description:
          'Top 30 estudantes do mês por pontos em um curso específico.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'month',
            in: 'query',
            schema: { type: 'string', example: '2026-03' },
          },
        ],
        responses: {
          '200': {
            description: 'Leaderboard do curso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LeaderboardResult' },
              },
            },
          },
        },
      },
    },
    '/student/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Submeter avaliação de curso',
        description:
          'Requer que o estudante tenha concluído o curso (enrollment COMPLETED). Avaliação 1-5 estrelas, tags selecionáveis e comentário opcional.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CourseReviewRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Avaliação submetida',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    rating: { type: 'integer' },
                    tags: { type: 'array', items: { type: 'string' } },
                    comment: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Curso não concluído',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'COURSE_NOT_COMPLETED' },
              },
            },
          },
          '409': {
            description: 'Já avaliou este curso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'ALREADY_REVIEWED' },
              },
            },
          },
        },
      },
    },
    '/student/certificates': {
      get: {
        tags: ['Student Certificates'],
        summary: 'Listar certificados do estudante',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de certificados',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    certificates: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/StudentCertificate',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/student/certificates/{id}/pdf': {
      get: {
        tags: ['Student Certificates'],
        summary: 'Baixar certificado em PDF',
        description:
          'Gera e retorna o PDF do certificado. Inclui dados do curso, nome do aluno, QR code de verificação.',
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
            description: 'PDF do certificado',
            content: {
              'application/pdf': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          '404': {
            description: 'Certificado não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'CERTIFICATE_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
    '/certificates/verify/{code}': {
      get: {
        tags: ['Student Certificates'],
        summary: 'Verificar certificado por código (público)',
        description:
          'Endpoint público para verificar a autenticidade de um certificado via QR code.',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Código de verificação do certificado (12 caracteres)',
          },
        ],
        responses: {
          '200': {
            description: 'Certificado verificado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    userName: { type: 'string' },
                    courseName: { type: 'string' },
                    completedAt: { type: 'string', format: 'date-time' },
                    totalHours: { type: 'string', nullable: true },
                    verified: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Certificado não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CodeOnlyErrorResponse' },
                example: { code: 'CERTIFICATE_NOT_FOUND' },
              },
            },
          },
        },
      },
    },
  },
} as const
