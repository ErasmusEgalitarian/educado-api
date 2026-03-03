import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'
import { REGISTRATION_STATUSES, USER_ROLES } from '../domain/registration/enums'

export class User extends Model {
  declare id: string
  declare firstName: string
  declare lastName: string
  declare email: string
  declare emailNormalized: string
  declare passwordHash: string
  declare status: (typeof REGISTRATION_STATUSES)[number]
  declare role: (typeof USER_ROLES)[number]
  declare lastLoginAt: Date | null
  declare username: string | null
  declare createdAt: Date
  declare updatedAt: Date
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailNormalized: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...REGISTRATION_STATUSES),
      allowNull: false,
      defaultValue: 'DRAFT_PROFILE',
    },
    role: {
      type: DataTypes.ENUM(...USER_ROLES),
      allowNull: false,
      defaultValue: 'USER',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'user',
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        name: 'user_email_normalized_uq',
        fields: ['emailNormalized'],
        unique: true,
      },
      {
        name: 'users_username_idx',
        fields: ['username'],
      },
    ],
  }
)
