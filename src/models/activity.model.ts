import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export type ActivityType =
  | 'video_pause'
  | 'true_false'
  | 'text_reading'
  | 'multiple_choice'

export class Activity extends Model {
  declare id: string
  declare sectionId: string
  declare type: ActivityType
  declare order: number
  declare pauseTimestamp: number | null
  declare textPages: string[] | null
  declare question: string | null
  declare imageUrl: string | null
  declare options: string[] | null
  declare correctAnswer: number | boolean | null
  declare icon: string | null
  declare createdAt: Date
  declare updatedAt: Date
}

Activity.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    sectionId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'sections',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(
        'video_pause',
        'true_false',
        'text_reading',
        'multiple_choice'
      ),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pauseTimestamp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    textPages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    correctAnswer: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'activity',
    tableName: 'activities',
    timestamps: true,
    indexes: [
      {
        name: 'activity_section_idx',
        fields: ['sectionId'],
      },
      {
        name: 'activity_order_idx',
        fields: ['sectionId', 'order'],
      },
    ],
  }
)
