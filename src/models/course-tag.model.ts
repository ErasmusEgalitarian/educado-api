import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class CourseTag extends Model {
  declare id: string
  declare courseId: string
  declare tagId: string
  declare createdAt: Date
  declare updatedAt: Date
}

CourseTag.init(
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
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tags',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'courseTag',
    tableName: 'course_tags',
    timestamps: true,
    indexes: [
      {
        name: 'course_tag_course_idx',
        fields: ['courseId'],
      },
      {
        name: 'course_tag_tag_idx',
        fields: ['tagId'],
      },
      {
        name: 'course_tag_unique_idx',
        fields: ['courseId', 'tagId'],
        unique: true,
      },
    ],
  }
)
