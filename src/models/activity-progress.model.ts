import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class ActivityProgress extends Model {
  declare id: string
  declare sectionProgressId: string
  declare activityId: string
  declare userId: string
  declare answer: unknown
  declare isCorrect: boolean
  declare attempts: number
  declare bestScore: number
  declare createdAt: Date
  declare updatedAt: Date
}

ActivityProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sectionProgressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'section_progress',
        key: 'id',
      },
    },
    activityId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'activities',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    answer: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    bestScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'activityProgress',
    tableName: 'activity_progress',
    timestamps: true,
    indexes: [
      {
        name: 'activity_progress_user_activity_uq',
        fields: ['userId', 'activityId'],
        unique: true,
      },
      {
        name: 'activity_progress_section_progress_idx',
        fields: ['sectionProgressId'],
      },
    ],
  }
)
