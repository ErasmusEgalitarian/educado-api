import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class CourseProgress extends Model {
  declare id: string
  declare courseId: string
  declare deviceId: string
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
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment:
        'Temporary identifier until auth is implemented - will be replaced with userId',
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
        name: 'course_progress_device_idx',
        fields: ['deviceId'],
      },
      {
        name: 'course_progress_course_idx',
        fields: ['courseId'],
      },
      {
        name: 'course_progress_device_course_idx',
        fields: ['deviceId', 'courseId'],
        unique: true,
      },
    ],
  }
)
