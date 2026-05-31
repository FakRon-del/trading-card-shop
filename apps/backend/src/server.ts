import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import dotenv from 'dotenv'
import cardRoutes from './routes/cards'

dotenv.config()

const server = Fastify({
  logger: true
})

// Plugins
server.register(cors, {
  origin: 'http://localhost:3000'
})
server.register(helmet)

// Routes
server.register(cardRoutes, { prefix: '/api' })

// Health check
server.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'Trading Card API is running' }
})

// Start server
const start = async () => {
  try {
    await server.listen({ port: 4000, host: '0.0.0.0' })
    console.log('🚀 Server running at http://localhost:4000')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()