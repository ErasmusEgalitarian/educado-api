import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class SectionProgress extends Model {
  declare id: string
  declare courseProgressId: string
  declare sectionId: string
  declare completed: boolean
  declare score: number
  declare totalQuestions: number
  declare completedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
}

SectionProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseProgressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'course_progress',
        key: 'id',
      },
    },
    sectionId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'sections',
        key: 'id',
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'sectionProgress',
    tableName: 'section_progress',
    timestamps: true,
    indexes: [
      {
        name: 'section_progress_course_progress_idx',
        fields: ['courseProgressId'],
      },
      {
        name: 'section_progress_section_idx',
        fields: ['sectionId'],
      },
      {
        name: 'section_progress_unique_idx',
        fields: ['courseProgressId', 'sectionId'],
        unique: true,
      },
    ],
  }
)
