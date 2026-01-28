import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Certificate extends Model {
  declare id: string
  declare courseId: string
  declare deviceId: string
  declare courseName: string
  declare completedAt: Date
  declare userName: string
  declare totalSections: number
  declare createdAt: Date
  declare updatedAt: Date
}

Certificate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment:
        'Temporary identifier until auth is implemented - will be replaced with userId',
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalSections: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'certificate',
    tableName: 'certificates',
    timestamps: true,
    indexes: [
      {
        name: 'certificate_device_idx',
        fields: ['deviceId'],
      },
      {
        name: 'certificate_course_idx',
        fields: ['courseId'],
      },
      {
        name: 'certificate_device_course_idx',
        fields: ['deviceId', 'courseId'],
        unique: true,
      },
    ],
  }
)
