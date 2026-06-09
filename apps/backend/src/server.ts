import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import dotenv from 'dotenv'
import cardRoutes from './routes/cards'
import authRoutes from './routes/auth'
import sellerRoutes from './routes/seller'
import orderRoutes from './routes/orders'

dotenv.config()

const server = Fastify({ logger: true })

server.register(cors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
})
server.register(helmet)

server.register(authRoutes, { prefix: '/api' })
server.register(cardRoutes, { prefix: '/api' })
server.register(sellerRoutes, { prefix: '/api' })
server.register(orderRoutes, { prefix: '/api' })

server.get('/health', async () => {
  return { status: 'ok', message: 'Trading Card API is running' }
})

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