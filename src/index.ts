import 'reflect-metadata'
import { ApolloServer } from '@apollo/server'
import fastifyApollo from '@as-integrations/fastify'
import fastifyCookie from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import fastify from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { buildSchema } from 'type-graphql'
import { env } from '@/env'
import { buildContext, type GraphQLContext } from './graphql/context'
import { resolvers } from './resolvers'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler((error, _request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation Error',
    })
  }

  console.error(error)
  return reply.status(500).send({
    message: 'Internal server error',
  })
})

const schema = await buildSchema({
  resolvers,
  validate: false,
  emitSchemaFile: './schema.graphql',
})

const server = new ApolloServer<GraphQLContext>({
  schema,
  introspection: true,
})
await server.start()

const frontendOrigin = env.WEB_URL

app.register(fastifyCors, {
  origin: (origin, cb) => {
    // Only allow the configured frontend origin for credentialed requests.
    if (!origin) {
      cb(null, true)
      return
    }

    cb(null, origin === frontendOrigin)
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'DELETE'],
})

await app.register(fastifyCookie, {
  secret: env.COOKIE_SECRET,
})

app.register(fastifyApollo(server), {
  path: '/graphql',
  context: buildContext,
})
app.listen({ port: env.PORT }, () => {
  console.info(`Server is running on http://localhost:${env.PORT}/graphql`)
})
