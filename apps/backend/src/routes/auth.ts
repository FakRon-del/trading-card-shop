import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../plugins/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

export default async function authRoutes(fastify: FastifyInstance) {

  // REGISTER
  fastify.post<{
    Body: { email: string; name: string; password: string; role?: 'BUYER' | 'SELLER' }
  }>('/auth/register', async (request, reply) => {
    const { email, name, password, role = 'BUYER' } = request.body

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.status(400).send({ error: 'Email already registered' })
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: { email, name, password: hashed, role }
    })

    // Sign token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return reply.status(201).send({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  })

  // LOGIN
  fastify.post<{
    Body: { email: string; password: string }
  }>('/auth/login', async (request, reply) => {
    const { email, password } = request.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return reply.send({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  })

  // GET current user (protected)
  fastify.get('/auth/me', async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader) return reply.status(401).send({ error: 'No token' })

    const token = authHeader.replace('Bearer ', '')
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true, seller: true }
      })
      return user
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }
  })
}