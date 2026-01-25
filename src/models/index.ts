// Import all models
import { User } from './user.model'

// Define all associations here to avoid circular dependency issues
// Example for future associations:
// User.hasMany(Post, { foreignKey: 'userId', as: 'posts' })
// Post.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export { User }
