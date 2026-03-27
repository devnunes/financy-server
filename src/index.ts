import 'reflect-metadata'
import { ApolloServer } from '@apollo/server'
import fastifyApollo from '@as-integrations/fastify'
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
import fastifyCookie from '@fastify/cookie'

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

app.register(fastifyCors, {
  origin: env.WEB_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'DELETE'],
})

await app.register(fastifyCookie, {
  secret: env.COOKIE_SECRET, 
});

app.register(fastifyApollo(server), {
  path: '/graphql',
  context: buildContext,
})
app.listen({ port: env.PORT }, () => {
  console.info(`Server is running on http://localhost:${env.PORT}/graphql`)
})
