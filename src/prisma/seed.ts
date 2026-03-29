import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { env } from '@/env'
import { hashPassword } from '@/utils/hash'

import { PrismaClient } from './generated/client'

const adapter = new PrismaBetterSqlite3({
  url: env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await hashPassword('hashedpassword')
  
  // Clean up existing data (delete transactions first due to FK)
  await prisma.user.deleteMany({})
  await prisma.transaction.deleteMany({})
  await prisma.category.deleteMany({})

  // Upsert user
  const user = await prisma.user.create({
    data: {
      name: 'Seed User',
      email: 'seeduser@example.com',
      password: hashedPassword, // Use a hashed password in production
    },
  })
  

  // Create categories
  await prisma.category.createMany({
    data: [
      {
        title: 'Alimentação',
        description: 'Gastos com alimentação',
        icon: 'utensils',
        color: 'blue',
        userId: user.id,
      },
      {
        title: 'Transporte',
        description: 'Gastos com transporte',
        icon: 'car-front',
        color: 'purple',
        userId: user.id,
      },
      {
        title: 'Mercado',
        description: 'Compras no mercado',
        icon: 'shopping-cart',
        color: 'orange',
        userId: user.id,
      },
      {
        title: 'Investimento',
        description: 'Investimentos',
        icon: 'piggy-bank',
        color: 'green',
        userId: user.id,
      },
      {
        title: 'Utilidades',
        description: 'Contas e utilidades',
        icon: 'tool-case',
        color: 'yellow',
        userId: user.id,
      },
      {
        title: 'Salário',
        description: 'Recebimentos de salário',
        icon: 'briefcase-business',
        color: 'green',
        userId: user.id,
      },
      {
        title: 'Entretenimento',
        description: 'Lazer e entretenimento',
        icon: 'ticket',
        color: 'pink',
        userId: user.id,
      },
    ],
  })

  // Create transactions
  // Get category IDs by title
  const allCategories = await prisma.category.findMany({
    where: { userId: user.id },
  })
  const getCategoryId = title => allCategories.find(c => c.title === title)?.id

  await prisma.transaction.createMany({
    data: [
      {
        amount: 8950,
        description: 'Jantar no Restaurante',
        type: 'expense',
        date: new Date('2025-11-30'),
        userId: user.id,
        categoryId: getCategoryId('Alimentação'),
      },
      {
        amount: 10000,
        description: 'Posto de Gasolina',
        type: 'expense',
        date: new Date('2025-11-29'),
        userId: user.id,
        categoryId: getCategoryId('Transporte'),
      },
      {
        amount: 15680,
        description: 'Compras no Mercado',
        type: 'expense',
        date: new Date('2025-11-28'),
        userId: user.id,
        categoryId: getCategoryId('Mercado'),
      },
      {
        amount: 34025,
        description: 'Retorno de Investimento',
        type: 'income',
        date: new Date('2025-11-26'),
        userId: user.id,
        categoryId: getCategoryId('Investimento'),
      },
      {
        amount: 170000,
        description: 'Aluguel',
        type: 'expense',
        date: new Date('2025-11-26'),
        userId: user.id,
        categoryId: getCategoryId('Utilidades'),
      },
      {
        amount: 250000,
        description: 'Freelance',
        type: 'income',
        date: new Date('2025-11-24'),
        userId: user.id,
        categoryId: getCategoryId('Salário'),
      },
      {
        amount: 15000,
        description: 'Compras Jantar',
        type: 'expense',
        date: new Date('2025-11-22'),
        userId: user.id,
        categoryId: getCategoryId('Mercado'),
      },
      {
        amount: 8800,
        description: 'Cinema',
        type: 'expense',
        date: new Date('2025-12-18'),
        userId: user.id,
        categoryId: getCategoryId('Entretenimento'),
      },
    ],
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
