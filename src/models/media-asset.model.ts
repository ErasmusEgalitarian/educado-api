import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class MediaAsset extends Model {
  declare id: string
  declare ownerId: string
  declare kind: 'image' | 'video'
  declare s3Key: string
  declare filename: string
  declare contentType: string
  declare size: number
  declare status: 'ACTIVE' | 'INACTIVE'
  declare title: string | null
  declare altText: string | null
  declare description: string | null
  declare createdAt: Date
  declare updatedAt: Date
}

MediaAsset.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    kind: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    altText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'mediaAsset',
    tableName: 'media_assets',
    timestamps: true,
    indexes: [
      {
        name: 'media_asset_s3_key_uq',
        fields: ['s3Key'],
        unique: true,
      },
      {
        name: 'media_asset_owner_idx',
        fields: ['ownerId'],
      },
      {
        name: 'media_asset_kind_idx',
        fields: ['kind'],
      },
    ],
  }
)
