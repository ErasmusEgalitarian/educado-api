import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class RegistrationProfile extends Model {
  declare id: string
  declare userId: string
  declare motivations: string
  declare academicBackground: string
  declare professionalExperience: string
  declare createdAt: Date
  declare updatedAt: Date
}

RegistrationProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    motivations: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    academicBackground: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    professionalExperience: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'registrationProfile',
    tableName: 'registration_profiles',
    timestamps: true,
    indexes: [
      {
        name: 'registration_profiles_user_id_uq',
        fields: ['userId'],
        unique: true,
      },
    ],
  }
)
