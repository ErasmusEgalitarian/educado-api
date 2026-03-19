/**
 * Cria um usuario admin no banco de dados.
 *
 * Uso:
 *   npx ts-node src/scripts/seed-admin.ts <email> <senha> <primeiro_nome> <sobrenome>
 *
 * Exemplo:
 *   npx ts-node src/scripts/seed-admin.ts admin@educado.com MinhaS3nha! Lucas Antunes
 *
 * Em producao (compilado):
 *   node build/scripts/seed-admin.js admin@educado.com MinhaS3nha! Lucas Antunes
 */

import { config } from 'dotenv'
config()

import { testDatabaseConnection, syncDatabase } from '../config/database'
import { User } from '../models/user.model'
import { hashPassword } from '../infrastructure/security/password-hasher'

const main = async () => {
  const [email, password, firstName, lastName] = process.argv.slice(2)

  if (!email || !password || !firstName || !lastName) {
    console.error(
      'Uso: npx ts-node src/scripts/seed-admin.ts <email> <senha> <primeiro_nome> <sobrenome>'
    )
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('Senha deve ter pelo menos 8 caracteres')
    process.exit(1)
  }

  await testDatabaseConnection()
  await syncDatabase(false)

  const emailNormalized = email.toLowerCase().trim()

  const existing = await User.findOne({ where: { emailNormalized } })
  if (existing) {
    console.error(`Ja existe um usuario com o email: ${email}`)
    process.exit(1)
  }

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    emailNormalized,
    passwordHash: await hashPassword(password),
    status: 'APPROVED',
    role: 'ADMIN',
  })

  console.log(`Admin criado com sucesso!`)
  console.log(`  ID:    ${user.id}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Role:  ${user.role}`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Erro ao criar admin:', err)
  process.exit(1)
})
