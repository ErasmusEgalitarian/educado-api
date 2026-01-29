import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Certificate extends Model {
  declare id: string
  declare courseId: string
  declare userId: string
  declare courseName: string
  declare completedAt: Date
  declare userName: string
  declare totalSections: number
  declare createdAt: Date
  declare updatedAt: Date
}

Certificate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalSections: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'certificate',
    tableName: 'certificates',
    timestamps: true,
    indexes: [
      {
        name: 'certificate_user_idx',
        fields: ['userId'],
      },
      {
        name: 'certificate_course_idx',
        fields: ['courseId'],
      },
      {
        name: 'certificate_user_course_idx',
        fields: ['userId', 'courseId'],
        unique: true,
      },
    ],
  }
)
