import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Tag extends Model {
  declare id: string
  declare name: string
  declare slug: string
  declare description: string | null
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
}

Tag.init(
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'tag',
    tableName: 'tags',
    timestamps: true,
    indexes: [
      {
        name: 'tag_name_uq',
        fields: ['name'],
        unique: true,
      },
      {
        name: 'tag_slug_uq',
        fields: ['slug'],
        unique: true,
      },
      {
        name: 'tag_active_idx',
        fields: ['isActive'],
      },
    ],
  }
)
