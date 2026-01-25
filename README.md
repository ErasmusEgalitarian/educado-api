# educado-api

Backend API for the Educado application built with Express, TypeScript, and PostgreSQL.

## Tech Stack

- **Node.js** with Express
- **TypeScript**
- **PostgreSQL** database
- **Sequelize** ORM

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (local or hosted)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your PostgreSQL connection string:
```
POSTGRES_URI=postgresql://username:password@localhost:5432/educado_dev
PORT=5001
```

### Setting up PostgreSQL

#### Option 1: Local PostgreSQL
Install PostgreSQL locally and create a database:
```bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb educado_dev
```

#### Option 2: Hosted PostgreSQL (Neon, Supabase, etc.)
- Sign up for a PostgreSQL hosting service (e.g., [Neon](https://neon.tech/), [Supabase](https://supabase.com/))
- Create a new database
- Copy the connection string to your `.env` file

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── config/
│   └── database.ts         # Sequelize database configuration
├── models/
│   ├── index.ts           # Model exports and associations
│   └── user.model.ts      # User model
├── routes/
│   └── user/              # User routes
├── types/
│   └── user-types/        # TypeScript types
└── index.ts               # Application entry point
```

## Database

The application uses Sequelize ORM with PostgreSQL. On startup, it will:
1. Test the database connection
2. Sync all models (create tables if they don't exist)

**Note:** To reset the database, change `syncDatabase(false)` to `syncDatabase(true)` in `src/index.ts`. This will drop all tables and recreate them. Use with caution!

## Adding New Models

1. Create a new model file in `src/models/` (e.g., `post.model.ts`)
2. Define the model using Sequelize:
```typescript
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/database'

export class Post extends Model {
  declare id: string
  declare title: string
  declare content: string
  declare userId: string
  declare createdAt: Date
  declare updatedAt: Date
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'post',
    tableName: 'post',
    timestamps: true,
  }
)
```

3. Add associations in `src/models/index.ts`:
```typescript
import { User } from './user.model'
import { Post } from './post.model'

// Define associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' })
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export { User, Post }
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
