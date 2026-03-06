import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export const EMAIL_VERIFICATION_STATUSES = [
  'PENDING',
  'VERIFIED',
  'EXPIRED',
  'LOCKED',
] as const

export type EmailVerificationStatus =
  (typeof EMAIL_VERIFICATION_STATUSES)[number]

export class EmailVerification extends Model {
  declare id: string
  declare userId: string
  declare codeHash: string
  declare expiresAt: Date
  declare attempts: number
  declare maxAttempts: number
  declare status: EmailVerificationStatus
  declare verifiedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
}

EmailVerification.init(
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
    codeHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    status: {
      type: DataTypes.ENUM(...EMAIL_VERIFICATION_STATUSES),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'emailVerification',
    tableName: 'email_verifications',
    timestamps: true,
    indexes: [
      {
        name: 'email_verifications_user_id_idx',
        fields: ['userId'],
      },
      {
        name: 'email_verifications_expires_at_idx',
        fields: ['expiresAt'],
      },
    ],
  }
)
