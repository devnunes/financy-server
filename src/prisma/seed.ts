import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { env } from '@/env'
import { PrismaClient } from './generated/client'

const adapter = new PrismaBetterSqlite3({
  url: env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Upsert user
  const user = await prisma.user.findFirst({
    where: { id: '525f370c-e417-4560-93cc-5adb940fef78' },
  })
  if (!user) {
    await prisma.user.upsert({
      where: { email: 'seeduser@example.com' },
      update: {},
      create: {
        id: '525f370c-e417-4560-93cc-5adb940fef78',
        name: 'Seed User',
        email: 'seeduser@example.com',
        password: 'hashedpassword', // Use a hashed password in production
      },
    })
  }
  // Clean up existing data (delete transactions first due to FK)
  await prisma.transaction.deleteMany({})
  await prisma.category.deleteMany({})

  // Create categories
  await prisma.category.createMany({
    data: [
      {
        title: 'Alimentação',
        description: 'Gastos com alimentação',
        icon: 'utensils',
        color: 'blue',
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
      },
      {
        title: 'Transporte',
        description: 'Gastos com transporte',
        icon: 'car-front',
        color: 'purple',
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
      },
      {
        title: 'Mercado',
        description: 'Compras no mercado',
        icon: 'shopping-cart',
        color: 'orange',
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
      },
      {
        title: 'Investimento',
        description: 'Investimentos',
        icon: 'piggy-bank',
        color: 'green',
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
      },
      {
        title: 'Utilidades',
        description: 'Contas e utilidades',
        icon: 'tool-case',
        color: 'yellow',
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
      },
      {
        title: 'Salário',
        description: 'Recebimentos de salário',
        icon: 'briefcase-business',
        color: 'green',
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
      },
      {
        title: 'Entretenimento',
        description: 'Lazer e entretenimento',
        icon: 'ticket',
        color: 'pink',
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
      },
    ],
  })

  // Create transactions
  // Get category IDs by title
  const allCategories = await prisma.category.findMany({
    where: { userId: '525f370c-e417-4560-93cc-5adb940fef78' },
  })
  const getCategoryId = title => allCategories.find(c => c.title === title)?.id

  await prisma.transaction.createMany({
    data: [
      {
        amount: 8950,
        description: 'Jantar no Restaurante',
        type: 'expense',
        date: new Date('2025-11-30'),
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
        categoryId: getCategoryId('Alimentação'),
      },
      {
        amount: 10000,
        description: 'Posto de Gasolina',
        type: 'expense',
        date: new Date('2025-11-29'),
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
        categoryId: getCategoryId('Transporte'),
      },
      {
        amount: 15680,
        description: 'Compras no Mercado',
        type: 'expense',
        date: new Date('2025-11-28'),
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
        categoryId: getCategoryId('Mercado'),
      },
      {
        amount: 34025,
        description: 'Retorno de Investimento',
        type: 'income',
        date: new Date('2025-11-26'),
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
        categoryId: getCategoryId('Investimento'),
      },
      {
        amount: 170000,
        description: 'Aluguel',
        type: 'expense',
        date: new Date('2025-11-26'),
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
        categoryId: getCategoryId('Utilidades'),
      },
      {
        amount: 250000,
        description: 'Freelance',
        type: 'income',
        date: new Date('2025-11-24'),
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
        categoryId: getCategoryId('Salário'),
      },
      {
        amount: 15000,
        description: 'Compras Jantar',
        type: 'expense',
        date: new Date('2025-11-22'),
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
        categoryId: getCategoryId('Mercado'),
      },
      {
        amount: 8800,
        description: 'Cinema',
        type: 'expense',
        date: new Date('2025-12-18'),
        userId: '525f370c-e417-4560-93cc-5adb940fef78',
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
