import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { env } from '@/env'
import { hashPassword } from '@/utils/hash'

import { PrismaClient } from './generated/client'

const adapter = new PrismaBetterSqlite3({
  url: env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const SEED_USER = {
  name: 'Seed User',
  email: 'seeduser@example.com',
}

const SEED_CATEGORIES = [
  {
    title: 'Alimentação',
    description: 'Gastos com alimentação',
    icon: 'utensils',
    color: 'blue',
  },
  {
    title: 'Transporte',
    description: 'Gastos com transporte',
    icon: 'car-front',
    color: 'purple',
  },
  {
    title: 'Mercado',
    description: 'Compras no mercado',
    icon: 'shopping-cart',
    color: 'orange',
  },
  {
    title: 'Investimento',
    description: 'Investimentos',
    icon: 'piggy-bank',
    color: 'green',
  },
  {
    title: 'Utilidades',
    description: 'Contas e utilidades',
    icon: 'tool-case',
    color: 'yellow',
  },
  {
    title: 'Salário',
    description: 'Recebimentos de salário',
    icon: 'briefcase-business',
    color: 'green',
  },
  {
    title: 'Entretenimento',
    description: 'Lazer e entretenimento',
    icon: 'ticket',
    color: 'pink',
  },
] as const

const SEED_TRANSACTIONS = [
  {
    amount: 8950,
    description: 'Jantar no Restaurante',
    type: 'expense',
    date: new Date('2025-11-30'),
    categoryTitle: 'Alimentação',
  },
  {
    amount: 10000,
    description: 'Posto de Gasolina',
    type: 'expense',
    date: new Date('2025-11-29'),
    categoryTitle: 'Transporte',
  },
  {
    amount: 15680,
    description: 'Compras no Mercado',
    type: 'expense',
    date: new Date('2025-11-28'),
    categoryTitle: 'Mercado',
  },
  {
    amount: 34025,
    description: 'Retorno de Investimento',
    type: 'income',
    date: new Date('2025-11-26'),
    categoryTitle: 'Investimento',
  },
  {
    amount: 170000,
    description: 'Aluguel',
    type: 'expense',
    date: new Date('2025-11-26'),
    categoryTitle: 'Utilidades',
  },
  {
    amount: 250000,
    description: 'Freelance',
    type: 'income',
    date: new Date('2025-11-24'),
    categoryTitle: 'Salário',
  },
  {
    amount: 15000,
    description: 'Compras Jantar',
    type: 'expense',
    date: new Date('2025-11-22'),
    categoryTitle: 'Mercado',
  },
  {
    amount: 8800,
    description: 'Cinema',
    type: 'expense',
    date: new Date('2025-12-18'),
    categoryTitle: 'Entretenimento',
  },
] as const

async function main() {
  const hashedPassword = await hashPassword('hashedpassword')

  const user = await prisma.user.upsert({
    where: { email: SEED_USER.email },
    update: {
      name: SEED_USER.name,
      password: hashedPassword,
    },
    create: {
      name: SEED_USER.name,
      email: SEED_USER.email,
      password: hashedPassword,
    },
  })

  const categoryIdsByTitle = new Map<string, string>()

  for (const categoryData of SEED_CATEGORIES) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: user.id,
        title: categoryData.title,
      },
    })

    const category = existingCategory
      ? await prisma.category.update({
          where: { id: existingCategory.id },
          data: {
            ...categoryData,
            userId: user.id,
          },
        })
      : await prisma.category.create({
          data: {
            ...categoryData,
            userId: user.id,
          },
        })

    categoryIdsByTitle.set(category.title, category.id)
  }

  await prisma.transaction.deleteMany({
    where: { userId: user.id },
  })

  await prisma.transaction.createMany({
    data: SEED_TRANSACTIONS.map(transactionData => {
      const categoryId = categoryIdsByTitle.get(transactionData.categoryTitle)
      if (!categoryId) {
        throw new Error(
          `Category with title '${transactionData.categoryTitle}' not found`
        )
      }

      return {
        amount: transactionData.amount,
        description: transactionData.description,
        type: transactionData.type,
        date: transactionData.date,
        userId: user.id,
        categoryId,
      }
    }),
  })

  console.info('Seed completed successfully')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
