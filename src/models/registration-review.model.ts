import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class RegistrationReview extends Model {
  declare id: string
  declare userId: string
  declare reviewedBy: string
  declare decision: 'APPROVE' | 'REJECT'
  declare reason: string | null
  declare notes: string | null
  declare createdAt: Date
}

RegistrationReview.init(
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
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    decision: {
      type: DataTypes.ENUM('APPROVE', 'REJECT'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'registrationReview',
    tableName: 'registration_reviews',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        name: 'registration_reviews_user_id_idx',
        fields: ['userId'],
      },
      {
        name: 'registration_reviews_reviewed_by_idx',
        fields: ['reviewedBy'],
      },
    ],
  }
)
