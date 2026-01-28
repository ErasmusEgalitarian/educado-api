import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Course extends Model {
  declare id: string
  declare title: string
  declare description: string
  declare shortDescription: string
  declare imageUrl: string
  declare difficulty: 'beginner' | 'intermediate' | 'advanced'
  declare estimatedTime: string
  declare passingThreshold: number
  declare category: string
  declare rating: number
  declare tags: string[]
  declare createdAt: Date
  declare updatedAt: Date
}

Course.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    shortDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false,
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passingThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 75,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'course',
    tableName: 'courses',
    timestamps: true,
    indexes: [
      {
        name: 'course_category_idx',
        fields: ['category'],
      },
      {
        name: 'course_difficulty_idx',
        fields: ['difficulty'],
      },
    ],
  }
)
