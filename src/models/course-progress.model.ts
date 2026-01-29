import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class CourseProgress extends Model {
  declare id: string
  declare courseId: string
  declare userId: string
  declare startedAt: Date
  declare lastAccessedAt: Date
  declare completedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
}

CourseProgress.init(
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
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'courseProgress',
    tableName: 'course_progress',
    timestamps: true,
    indexes: [
      {
        name: 'course_progress_user_idx',
        fields: ['userId'],
      },
      {
        name: 'course_progress_course_idx',
        fields: ['courseId'],
      },
      {
        name: 'course_progress_user_course_idx',
        fields: ['userId', 'courseId'],
        unique: true,
      },
    ],
  }
)
