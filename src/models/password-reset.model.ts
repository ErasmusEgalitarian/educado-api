import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export const PASSWORD_RESET_STATUSES = [
  'PENDING',
  'VERIFIED',
  'EXPIRED',
  'LOCKED',
] as const

export type PasswordResetStatus =
  (typeof PASSWORD_RESET_STATUSES)[number]

export class PasswordReset extends Model {
  declare id: string
  declare userId: string
  declare codeHash: string
  declare expiresAt: Date
  declare attempts: number
  declare maxAttempts: number
  declare status: PasswordResetStatus
  declare verifiedAt: Date | null
  declare createdAt: Date
  declare updatedAt: Date
}

PasswordReset.init(
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
      type: DataTypes.ENUM(...PASSWORD_RESET_STATUSES),
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
    modelName: 'passwordReset',
    tableName: 'password_resets',
    timestamps: true,
    indexes: [
      {
        name: 'password_resets_user_id_idx',
        fields: ['userId'],
      },
      {
        name: 'password_resets_expires_at_idx',
        fields: ['expiresAt'],
      },
    ],
  }
)
