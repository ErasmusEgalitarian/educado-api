import { Schema, model } from 'mongoose'
import { IUser } from '../types/user-types/user'

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

export const User = model<IUser>('User', userSchema, 'User')
