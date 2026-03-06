import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Institution extends Model {
  declare id: string
  declare name: string
  declare domain: string
  declare secondaryDomain: string | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
}

Institution.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    secondaryDomain: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'institution',
    tableName: 'institutions',
    timestamps: true,
    indexes: [
      {
        name: 'institution_name_uq',
        fields: ['name'],
        unique: true,
      },
      {
        name: 'institution_domain_uq',
        fields: ['domain'],
        unique: true,
      },
      {
        name: 'institution_secondary_domain_uq',
        fields: ['secondaryDomain'],
        unique: true,
      },
      {
        name: 'institution_active_idx',
        fields: ['isActive'],
      },
    ],
  }
)
