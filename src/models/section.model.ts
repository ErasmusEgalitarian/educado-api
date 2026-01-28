import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Section extends Model {
  declare id: string
  declare courseId: string
  declare title: string
  declare videoUrl: string | null
  declare thumbnailUrl: string | null
  declare duration: number | null
  declare order: number
  declare createdAt: Date
  declare updatedAt: Date
}

Section.init(
  {
    id: {
      type: DataTypes.STRING,
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'section',
    tableName: 'sections',
    timestamps: true,
    indexes: [
      {
        name: 'section_course_idx',
        fields: ['courseId'],
      },
      {
        name: 'section_order_idx',
        fields: ['courseId', 'order'],
      },
    ],
  }
)
