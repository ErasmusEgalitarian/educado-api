import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class User extends Model {
  declare id: string
  declare username: string
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
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'user',
    tableName: 'user',
    timestamps: true,
    indexes: [
      {
        name: 'user_username_idx',
        fields: ['username'],
      },
    ],
  }
)
