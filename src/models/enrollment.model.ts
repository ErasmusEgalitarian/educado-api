import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'DROPPED'] as const
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number]

export class Enrollment extends Model {
  declare id: string
  declare userId: string
  declare courseId: string
  declare enrolledAt: Date
  declare status: EnrollmentStatus
  declare completedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
}

Enrollment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    courseId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM(...ENROLLMENT_STATUSES),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'enrollment',
    tableName: 'enrollments',
    timestamps: true,
    indexes: [
      {
        name: 'enrollment_user_course_uq',
        fields: ['user_id', 'course_id'],
        unique: true,
      },
      {
        name: 'enrollment_user_idx',
        fields: ['user_id'],
      },
      {
        name: 'enrollment_course_idx',
        fields: ['course_id'],
      },
      {
        name: 'enrollment_status_idx',
        fields: ['status'],
      },
    ],
  }
)
