import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class CourseReview extends Model {
  declare id: string
  declare userId: string
  declare courseId: string
  declare rating: number
  declare tags: string[]
  declare comment: string | null
  declare createdAt: Date
  declare updatedAt: Date
}

CourseReview.init(
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
      allowNull: false,
      references: { model: 'courses', key: 'id' },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'courseReview',
    tableName: 'course_reviews',
    timestamps: true,
    indexes: [
      {
        name: 'course_review_user_course_uq',
        fields: ['user_id', 'course_id'],
        unique: true,
      },
      {
        name: 'course_review_course_idx',
        fields: ['course_id'],
      },
    ],
  }
)
