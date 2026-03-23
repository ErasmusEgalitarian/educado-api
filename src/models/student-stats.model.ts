import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class StudentStats extends Model {
  declare id: string
  declare userId: string
  declare totalPoints: number
  declare currentLevel: number
  declare currentStreak: number
  declare longestStreak: number
  declare lastActiveDate: string | null
  declare coursesCompleted: number
  declare sectionsCompleted: number
  declare createdAt: Date
  declare updatedAt: Date
}

StudentStats.init(
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
      references: { model: 'users', key: 'id' },
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    currentLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastActiveDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    coursesCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sectionsCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'studentStats',
    tableName: 'student_stats',
    timestamps: true,
    indexes: [
      {
        name: 'student_stats_user_uq',
        fields: ['user_id'],
        unique: true,
      },
    ],
  }
)
