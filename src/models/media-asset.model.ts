import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class MediaAsset extends Model {
  declare id: string
  declare ownerId: string
  declare kind: 'image' | 'video'
  declare mediaId: string
  declare streamUrl: string
  declare title: string
  declare altText: string
  declare description: string
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
    mediaId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    streamUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    altText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'mediaAsset',
    tableName: 'media_assets',
    timestamps: true,
    indexes: [
      {
        name: 'media_asset_media_id_uq',
        fields: ['mediaId'],
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
