import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Course extends Model {
  declare id: string
  declare ownerId: string
  declare title: string
  declare description: string
  declare shortDescription: string
  declare imageUrl: string
  declare difficulty: 'beginner' | 'intermediate' | 'advanced'
  declare estimatedTime: string
  declare passingThreshold: number
  declare category: string
  declare rating: number | null
  declare tags: string[]
  declare isActive: boolean
  declare publishedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
  declare deletedAt: Date | null
}

Course.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
      type: DataTypes.TEXT,
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'course',
    tableName: 'courses',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        name: 'course_owner_idx',
        fields: ['ownerId'],
      },
      {
        name: 'course_category_idx',
        fields: ['category'],
      },
      {
        name: 'course_difficulty_idx',
        fields: ['difficulty'],
      },
      {
        name: 'course_active_idx',
        fields: ['isActive'],
      },
    ],
  }
)
