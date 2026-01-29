import { config } from 'dotenv'
import { syncDatabase, testDatabaseConnection } from '../config/database'
import { Course, Section, Activity } from '../models'

// Load environment variables
config()

// Mock courses data (copied from educado-app/data/mock-data.ts)
interface Question {
  id: string
  type: 'multiple_choice' | 'true_false'
  question: string
  options: string[]
  correctAnswer: number | boolean
  icon?: string
}

type ActivityType =
  | 'video_pause'
  | 'true_false'
  | 'text_reading'
  | 'multiple_choice'

interface ActivityData {
  id: string
  type: ActivityType
  pauseTimestamp?: number
  textPages?: string[]
  question?: string
  imageUrl?: string
  options?: string[]
  correctAnswer?: number | boolean
  icon?: string
}

interface SectionData {
  id: string
  title: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: number
  questions?: Question[]
  activities?: ActivityData[]
}

interface CourseData {
  id: string
  title: string
  description: string
  shortDescription: string
  imageUrl: string
  sections: SectionData[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  passingThreshold: number
  category: string
  rating?: number
  tags: string[]
}

// Video URLs from assets folder
const VIDEO_CRYPTO_BRO = 'Crypto Bro A.mp4'
const VIDEO_DESCONFIAR = 'Desconfiar e se proteger.mp4'
const VIDEO_SENHA = 'Nunca passar senha ou codigo.mp4'

const mockCourses: CourseData[] = [
  {
    id: '1',
    title: 'Waste Sorting Basics',
    shortDescription:
      'Learn the fundamentals of sorting different types of waste materials',
    description:
      'This course covers the essential skills needed to properly identify and sort various waste materials. You will learn about different categories of recyclables, how to recognize them, and the proper way to handle each type.',
    imageUrl: 'course-waste-sorting',
    difficulty: 'beginner',
    estimatedTime: '30 min',
    passingThreshold: 75,
    category: 'science',
    rating: 3.7,
    tags: ['recycling', 'environment', 'waste management', 'sustainability'],
    sections: [
      {
        id: '1-1',
        title: 'Introduction to Waste Types',
        videoUrl: VIDEO_CRYPTO_BRO,
        thumbnailUrl: 'section-1-1',
        duration: 180,
        questions: [
          {
            id: '1-1-q1',
            type: 'multiple_choice',
            question: 'Which of these materials is recyclable?',
            options: [
              'Plastic bottle',
              'Food waste',
              'Dirty paper',
              'Broken glass with food',
            ],
            correctAnswer: 0,
            icon: 'refresh-circle',
          },
          {
            id: '1-1-q2',
            type: 'true_false',
            question: 'All plastic materials can be recycled together',
            options: [],
            correctAnswer: false,
            icon: 'help-circle',
          },
        ],
      },
      {
        id: '1-2',
        title: 'Identifying Recyclable Materials',
        videoUrl: VIDEO_DESCONFIAR,
        thumbnailUrl: 'section-1-2',
        duration: 240,
        questions: [
          {
            id: '1-2-q1',
            type: 'multiple_choice',
            question: 'What does the recycling symbol with number 1 mean?',
            options: ['PET plastic', 'HDPE plastic', 'PVC plastic', 'Paper'],
            correctAnswer: 0,
            icon: 'information-circle',
          },
          {
            id: '1-2-q2',
            type: 'true_false',
            question: 'Aluminum cans should be crushed before recycling',
            options: [],
            correctAnswer: true,
            icon: 'cube',
          },
          {
            id: '1-2-q3',
            type: 'multiple_choice',
            question: 'Which color of glass is most commonly recycled?',
            options: [
              'Clear glass',
              'Brown glass',
              'Green glass',
              'All are equally recyclable',
            ],
            correctAnswer: 3,
            icon: 'wine',
          },
        ],
      },
      {
        id: '1-3',
        title: 'Proper Sorting Techniques',
        videoUrl: VIDEO_SENHA,
        thumbnailUrl: 'section-1-1',
        duration: 200,
        questions: [
          {
            id: '1-3-q1',
            type: 'true_false',
            question: 'Materials should be cleaned before recycling',
            options: [],
            correctAnswer: true,
            icon: 'water',
          },
          {
            id: '1-3-q2',
            type: 'multiple_choice',
            question: 'What should you do with plastic bottle caps?',
            options: [
              'Throw them away',
              'Leave them on the bottle',
              'Recycle separately',
              'Remove and save them',
            ],
            correctAnswer: 1,
            icon: 'flask',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Recycling Safety',
    shortDescription:
      'Essential safety practices for handling recyclable materials',
    description:
      'Safety is crucial when working with recyclable materials. This course teaches you how to protect yourself from sharp objects, hazardous materials, and other workplace dangers. Learn proper equipment usage and emergency procedures.',
    imageUrl: 'course-recycling-safety',
    difficulty: 'beginner',
    estimatedTime: '45 min',
    passingThreshold: 75,
    category: 'science',
    rating: 3.7,
    tags: ['safety', 'workplace', 'PPE', 'health'],
    sections: [
      {
        id: '2-1',
        title: 'Personal Protection Equipment',
        videoUrl: VIDEO_CRYPTO_BRO,
        thumbnailUrl: 'section-1-1',
        duration: 220,
        questions: [
          {
            id: '2-1-q1',
            type: 'multiple_choice',
            question: 'Which safety equipment is essential when sorting waste?',
            options: [
              'Gloves only',
              'Gloves and safety shoes',
              'Just be careful',
              'Nothing needed',
            ],
            correctAnswer: 1,
            icon: 'shield-checkmark',
          },
          {
            id: '2-1-q2',
            type: 'true_false',
            question: 'You can reuse disposable gloves if they look clean',
            options: [],
            correctAnswer: false,
            icon: 'hand-right',
          },
        ],
      },
      {
        id: '2-2',
        title: 'Handling Sharp Objects',
        videoUrl: VIDEO_DESCONFIAR,
        thumbnailUrl: 'section-1-2',
        duration: 180,
        questions: [
          {
            id: '2-2-q1',
            type: 'true_false',
            question: 'Broken glass should be wrapped before disposal',
            options: [],
            correctAnswer: true,
            icon: 'warning',
          },
          {
            id: '2-2-q2',
            type: 'multiple_choice',
            question: 'What should you do if you get cut?',
            options: [
              'Continue working',
              'Stop and clean the wound immediately',
              'Finish your shift first',
              'Just put on a new glove',
            ],
            correctAnswer: 1,
            icon: 'medkit',
          },
        ],
      },
      {
        id: '2-3',
        title: 'Identifying Hazardous Materials',
        videoUrl: VIDEO_SENHA,
        thumbnailUrl: 'section-1-1',
        duration: 260,
        questions: [
          {
            id: '2-3-q1',
            type: 'multiple_choice',
            question: 'Which of these is considered hazardous waste?',
            options: [
              'Plastic bags',
              'Battery',
              'Cardboard box',
              'Glass bottle',
            ],
            correctAnswer: 1,
            icon: 'battery-charging',
          },
          {
            id: '2-3-q2',
            type: 'true_false',
            question: 'Aerosol cans can be safely compressed with other metals',
            options: [],
            correctAnswer: false,
            icon: 'alert-circle',
          },
        ],
      },
      {
        id: '2-4',
        title: 'Emergency Procedures',
        videoUrl: VIDEO_CRYPTO_BRO,
        thumbnailUrl: 'section-1-2',
        duration: 200,
        questions: [
          {
            id: '2-4-q1',
            type: 'true_false',
            question: 'You should know where the first aid kit is located',
            options: [],
            correctAnswer: true,
            icon: 'medical',
          },
          {
            id: '2-4-q2',
            type: 'multiple_choice',
            question: 'If you see a fire, what should you do first?',
            options: [
              'Try to put it out',
              'Alert others and evacuate',
              'Call your supervisor',
              'Take a photo',
            ],
            correctAnswer: 1,
            icon: 'flame',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Material Identification',
    shortDescription:
      'Master the art of identifying different recyclable materials',
    description:
      'Become an expert at recognizing and categorizing various recyclable materials. This course covers plastics, metals, paper products, and special materials, teaching you how to quickly and accurately identify what can be recycled and where it should go.',
    imageUrl: 'course-material-identification',
    difficulty: 'intermediate',
    estimatedTime: '35 min',
    passingThreshold: 75,
    category: 'science',
    rating: 3.7,
    tags: ['materials', 'identification', 'recycling', 'classification'],
    sections: [
      {
        id: '3-1',
        title: 'Understanding Plastic Types',
        videoUrl: VIDEO_DESCONFIAR,
        thumbnailUrl: 'section-1-1',
        duration: 240,
        questions: [
          {
            id: '3-1-q1',
            type: 'multiple_choice',
            question: 'How many main types of plastic are commonly recycled?',
            options: ['3 types', '5 types', '7 types', '10 types'],
            correctAnswer: 2,
            icon: 'list',
          },
          {
            id: '3-1-q2',
            type: 'true_false',
            question: 'HDPE plastic is commonly used for milk jugs',
            options: [],
            correctAnswer: true,
            icon: 'nutrition',
          },
        ],
      },
      {
        id: '3-2',
        title: 'Metal Classification',
        videoUrl: VIDEO_SENHA,
        thumbnailUrl: 'section-1-2',
        duration: 210,
        questions: [
          {
            id: '3-2-q1',
            type: 'multiple_choice',
            question: 'Which metal is most valuable for recycling?',
            options: ['Steel', 'Aluminum', 'Copper', 'Iron'],
            correctAnswer: 2,
            icon: 'cash',
          },
          {
            id: '3-2-q2',
            type: 'true_false',
            question:
              'Magnets can help separate ferrous from non-ferrous metals',
            options: [],
            correctAnswer: true,
            icon: 'magnet',
          },
          {
            id: '3-2-q3',
            type: 'multiple_choice',
            question: 'What is the best way to identify aluminum?',
            options: [
              'It is very heavy',
              'It is magnetic',
              'It is lightweight and non-magnetic',
              'It rusts quickly',
            ],
            correctAnswer: 2,
            icon: 'scan',
          },
        ],
      },
      {
        id: '3-3',
        title: 'Paper and Cardboard Quality',
        videoUrl: VIDEO_CRYPTO_BRO,
        thumbnailUrl: 'section-1-1',
        duration: 190,
        questions: [
          {
            id: '3-3-q1',
            type: 'true_false',
            question: 'Wet or soiled paper cannot be recycled',
            options: [],
            correctAnswer: true,
            icon: 'water',
          },
          {
            id: '3-3-q2',
            type: 'multiple_choice',
            question: 'Which type of paper is most valuable?',
            options: [
              'Newspaper',
              'White office paper',
              'Mixed paper',
              'Cardboard',
            ],
            correctAnswer: 1,
            icon: 'document-text',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'Finanças Pessoais',
    shortDescription: 'Aprenda o básico sobre gestão financeira pessoal',
    description:
      'Este curso ensina o básico sobre dinheiro: como gastar, guardar e evitar dívidas. Aprenda também a se proteger de golpes financeiros, a importância de não compartilhar senhas e códigos, e como identificar ofertas suspeitas. As aulas são simples e com exemplos do dia a dia. Ideal para quem quer aprender a se organizar e planejar o futuro com segurança.',
    imageUrl: 'course-waste-sorting',
    difficulty: 'beginner',
    estimatedTime: '40 min',
    passingThreshold: 70,
    category: 'finance',
    rating: 4.5,
    tags: ['finanças', 'dinheiro', 'planejamento', 'economia', 'segurança'],
    sections: [
      {
        id: '4-1',
        title: 'Introdução ao curso de finanças',
        activities: [
          {
            id: '4-1-a1',
            type: 'text_reading',
            textPages: [
              'Este curso ensina o básico sobre dinheiro: como gastar, guardar e evitar dívidas. É feito para quem está começando e quer cuidar melhor do seu dinheiro. As aulas são simples e com exemplos do dia a dia. Ideal para quem quer aprender a se organizar e planejar o futuro.',
              'Você vai aprender sobre orçamento familiar, como economizar dinheiro no dia a dia, evitar dívidas e planejar seu futuro financeiro. Vamos usar exemplos práticos que você pode aplicar imediatamente na sua vida.',
            ],
          },
          {
            id: '4-1-a2',
            type: 'multiple_choice',
            question: 'Qual é o principal objetivo deste curso?',
            options: [
              'Aprender a investir na bolsa de valores',
              'Aprender o básico sobre gestão financeira pessoal',
              'Aprender a abrir uma empresa',
              'Aprender sobre criptomoedas',
            ],
            correctAnswer: 1,
            icon: 'school',
          },
        ],
      },
      {
        id: '4-2',
        title: 'Cuidados com golpes financeiros',
        videoUrl: VIDEO_CRYPTO_BRO,
        thumbnailUrl: 'section-1-1',
        duration: 180,
        activities: [
          {
            id: '4-2-a1',
            type: 'video_pause',
            pauseTimestamp: 5,
            question: 'Qual animal é conhecido como o rei da selva?',
            options: [
              'O planeta Marte é conhecido como o famoso planeta vermelho.',
              'O leão é conhecido como o rei da selva.',
              'O elefante é o maior animal terrestre.',
              'A águia é a rainha dos céus.',
            ],
            correctAnswer: 1,
            icon: 'help-circle',
          },
          {
            id: '4-2-a2',
            type: 'video_pause',
            pauseTimestamp: 15,
            question:
              'Anotar o que entra e o que sai ajuda a entender pra onde o dinheiro tá indo.',
            correctAnswer: true,
            icon: 'cash',
          },
          {
            id: '4-2-a3',
            type: 'video_pause',
            pauseTimestamp: 25,
            question: 'O que é orçamento familiar?',
            options: [
              'É o dinheiro que você guarda no banco',
              'É um plano de quanto dinheiro entra e sai da casa',
              'É o valor das contas de água e luz',
              'É o salário mensal',
            ],
            correctAnswer: 1,
            icon: 'home',
          },
        ],
      },
      {
        id: '4-4',
        title: 'Protegendo suas informações',
        videoUrl: VIDEO_DESCONFIAR,
        thumbnailUrl: 'section-1-2',
        duration: 120,
        activities: [
          {
            id: '4-4-a1',
            type: 'video_pause',
            pauseTimestamp: 5,
            question: 'Por que é importante desconfiar de ofertas muito boas?',
            options: [
              'Porque podem ser golpes',
              'Porque são sempre falsas',
              'Porque são ilegais',
              'Porque não existem promoções',
            ],
            correctAnswer: 0,
            icon: 'warning',
          },
          {
            id: '4-4-a2',
            type: 'video_pause',
            pauseTimestamp: 15,
            question: 'Desconfiar ajuda a se proteger de golpes financeiros.',
            correctAnswer: true,
            icon: 'shield-checkmark',
          },
        ],
      },
      {
        id: '4-5',
        title: 'Segurança de senhas e códigos',
        videoUrl: VIDEO_SENHA,
        thumbnailUrl: 'section-1-1',
        duration: 90,
        activities: [
          {
            id: '4-5-a1',
            type: 'video_pause',
            pauseTimestamp: 5,
            question: 'Você deve compartilhar sua senha bancária com alguém?',
            options: [
              'Sim, com amigos próximos',
              'Sim, com a família',
              'Não, nunca',
              'Sim, se for urgente',
            ],
            correctAnswer: 2,
            icon: 'lock-closed',
          },
          {
            id: '4-5-a2',
            type: 'video_pause',
            pauseTimestamp: 15,
            question: 'O banco pode pedir sua senha por telefone.',
            correctAnswer: false,
            icon: 'call',
          },
          {
            id: '4-5-a3',
            type: 'video_pause',
            pauseTimestamp: 25,
            question:
              'O que você deve fazer se alguém pedir seu código do banco?',
            options: [
              'Passar o código imediatamente',
              'Perguntar quem está pedindo',
              'Nunca passar códigos ou senhas',
              'Passar só o código, mas não a senha',
            ],
            correctAnswer: 2,
            icon: 'key',
          },
        ],
      },
      {
        id: '4-3',
        title: 'Economizando no dia a dia',
        activities: [
          {
            id: '4-3-a1',
            type: 'text_reading',
            textPages: [
              'Economizar dinheiro não precisa ser difícil. Pequenas mudanças no dia a dia podem fazer uma grande diferença no final do mês.',
              'Algumas dicas práticas: evite compras por impulso, compare preços antes de comprar, aproveite promoções, e sempre pergunte: eu realmente preciso disso agora?',
              'Lembre-se: cada real economizado é um real que pode ser usado para realizar seus sonhos e objetivos futuros.',
            ],
          },
          {
            id: '4-3-a2',
            type: 'true_false',
            question: 'Comprar por impulso ajuda a economizar dinheiro.',
            correctAnswer: false,
            icon: 'cart',
          },
          {
            id: '4-3-a3',
            type: 'multiple_choice',
            question: 'Qual é uma boa prática para economizar?',
            options: [
              'Comprar sempre que ver uma promoção',
              'Comparar preços antes de comprar',
              'Nunca olhar o preço das coisas',
              'Usar sempre o cartão de crédito',
            ],
            correctAnswer: 1,
            icon: 'pricetag',
          },
        ],
      },
    ],
  },
]

async function seedCourses() {
  try {
    console.log('Connecting to database...')
    await testDatabaseConnection()

    console.log('Syncing database...')
    await syncDatabase(true) // Force sync to drop and recreate tables

    console.log('Seeding courses...')

    for (const courseData of mockCourses) {
      console.log(`Creating course: ${courseData.title}`)

      // Create course
      await Course.create({
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        imageUrl: courseData.imageUrl,
        difficulty: courseData.difficulty,
        estimatedTime: courseData.estimatedTime,
        passingThreshold: courseData.passingThreshold,
        category: courseData.category,
        rating: courseData.rating,
        tags: courseData.tags,
      })

      // Create sections and activities
      for (
        let sectionIndex = 0;
        sectionIndex < courseData.sections.length;
        sectionIndex++
      ) {
        const sectionData = courseData.sections[sectionIndex]
        console.log(`  Creating section: ${sectionData.title}`)

        await Section.create({
          id: sectionData.id,
          courseId: courseData.id,
          title: sectionData.title,
          videoUrl: sectionData.videoUrl || null,
          thumbnailUrl: sectionData.thumbnailUrl || null,
          duration: sectionData.duration || null,
          order: sectionIndex,
        })

        // Convert legacy questions to activities
        if (sectionData.questions) {
          for (let i = 0; i < sectionData.questions.length; i++) {
            const question = sectionData.questions[i]
            await Activity.create({
              id: question.id,
              sectionId: sectionData.id,
              type:
                question.type === 'true_false'
                  ? 'true_false'
                  : 'multiple_choice',
              order: i,
              question: question.question,
              options: question.options.length > 0 ? question.options : null,
              correctAnswer: question.correctAnswer,
              icon: question.icon || null,
              pauseTimestamp: null,
              textPages: null,
              imageUrl: null,
            })
          }
        }

        // Create activities if present
        if (sectionData.activities) {
          for (let i = 0; i < sectionData.activities.length; i++) {
            const activity = sectionData.activities[i]
            await Activity.create({
              id: activity.id,
              sectionId: sectionData.id,
              type: activity.type,
              order: i,
              pauseTimestamp: activity.pauseTimestamp || null,
              textPages: activity.textPages || null,
              question: activity.question || null,
              imageUrl: activity.imageUrl || null,
              options: activity.options || null,
              correctAnswer:
                activity.correctAnswer !== undefined
                  ? activity.correctAnswer
                  : null,
              icon: activity.icon || null,
            })
          }
        }
      }
    }

    console.log('✅ Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seedCourses()
