import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import dotenv from 'dotenv'
import cardRoutes from './routes/cards'
import authRoutes from './routes/auth'
import sellerRoutes from './routes/seller'
import orderRoutes from './routes/orders'
import uploadRoutes from './routes/upload'
import adminRoutes from './routes/admin'
import reviewRoutes from './routes/reviews'
import paymentRoutes from './routes/payments'
dotenv.config()

const server = Fastify({ logger: true })

server.register(cors, {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
})
server.register(helmet, { crossOriginResourcePolicy: false })
server.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB limit
server.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
  try {
    const json = JSON.parse(body.toString())
    ;(req as any).rawBody = body
    done(null, json)
  } catch (err: any) {
    done(err, undefined)
  }
})

// Routes
server.register(authRoutes, { prefix: '/api' })
server.register(cardRoutes, { prefix: '/api' })
server.register(sellerRoutes, { prefix: '/api' })
server.register(orderRoutes, { prefix: '/api' })
server.register(uploadRoutes, { prefix: '/api' })
server.register(adminRoutes, { prefix: '/api' })
server.register(reviewRoutes, { prefix: '/api' })
server.register(paymentRoutes, { prefix: '/api' })
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