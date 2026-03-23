import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Badge extends Model {
  declare id: string
  declare key: string
  declare name: string
  declare description: string
  declare iconUrl: string | null
  declare criteria: Record<string, unknown>
  declare createdAt: Date
}

Badge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    criteria: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'badge',
    tableName: 'badges',
    timestamps: true,
    updatedAt: false,
  }
)
