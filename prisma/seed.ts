import { PrismaClient, Prisma } from '@prisma/client'
import Post from '../components/Post';

const prisma = new PrismaClient()

const boolArgs = [true, false]

const userData: Prisma.UserCreateInput[] =  Array.from({ length: 100 }, (_, k) => ({
  name: `user ${k + 1}`,
  email: `user${k + 1}@prisma.io`,
  posts: {
    create: Array.from({ length: 1000 }, (_, i) => ({
      title: `Post ${i + 1}`,
      content: `Content of post ${i + 1}`,
      published: boolArgs[Math.round(Math.random())]
    })),
  },
}))


const userBasicData: Prisma.UserCreateInput[] = [
  {
    name: 'Alice',
    email: 'alice@prisma.io',
    posts: {
      create: [
        {
          title: 'Join the Prisma Slack',
          content: 'https://slack.prisma.io',
          published: true,
        },
      ],
    },
  },
  {
    name: 'Nilu',
    email: 'nilu@prisma.io',
    posts: {
      create: [
        {
          title: 'Follow Prisma on Twitter',
          content: 'https://www.twitter.com/prisma',
          published: true,
        },
      ],
    },
  },
  {
    name: 'Mahmoud',
    email: 'mahmoud@prisma.io',
    posts: {
      create: [
        {
          title: 'Ask a question about Prisma on GitHub',
          content: 'https://www.github.com/prisma/prisma/discussions',
          published: true,
        },
        {
          title: 'Prisma on YouTube',
          content: 'https://pris.ly/youtube',
        },
      ],
    },
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
