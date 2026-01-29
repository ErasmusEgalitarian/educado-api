import { Request, Response } from 'express'
import { User } from '../../models'

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { username } = req.body

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' })
    }

    const trimmedUsername = username.trim()

    // Check if username is valid (alphanumeric and underscores only, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(trimmedUsername)) {
      return res.status(400).json({
        error:
          'Username must be 3-20 characters long and contain only letters, numbers, and underscores',
      })
    }

    // Find or create user
    let user = await User.findOne({
      where: { username: trimmedUsername },
    })

    if (!user) {
      user = await User.create({
        username: trimmedUsername,
      })
    }

    res.json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Error logging in user:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
}
