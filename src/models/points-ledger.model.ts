import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class PointsLedger extends Model {
  declare id: string
  declare userId: string
  declare courseId: string | null
  declare action: string
  declare points: number
  declare metadata: Record<string, unknown> | null
  declare earnedAt: Date
  declare createdAt: Date
}

PointsLedger.init(
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
    courseId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: { model: 'courses', key: 'id' },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    earnedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'pointsLedger',
    tableName: 'points_ledger',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { name: 'points_ledger_user_idx', fields: ['user_id'] },
      {
        name: 'points_ledger_user_earned_idx',
        fields: ['user_id', 'earned_at'],
      },
      {
        name: 'points_ledger_user_course_idx',
        fields: ['user_id', 'course_id'],
      },
    ],
  }
)
