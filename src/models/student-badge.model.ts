import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class StudentBadge extends Model {
  declare id: string
  declare userId: string
  declare badgeId: string
  declare earnedAt: Date
  declare createdAt: Date
}

StudentBadge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    badgeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'badges', key: 'id' },
    },
    earnedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'studentBadge',
    tableName: 'student_badges',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        name: 'student_badge_user_badge_uq',
        fields: ['userId', 'badgeId'],
        unique: true,
      },
      {
        name: 'student_badge_user_idx',
        fields: ['userId'],
      },
    ],
  }
)
