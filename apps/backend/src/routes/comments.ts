import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET!

function getUser(request: any) {
  const authHeader = request.headers.authorization
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  try { return jwt.verify(token, JWT_SECRET) as { userId: string; role: string } }
  catch { return null }
}

export default async function commentRoutes(fastify: FastifyInstance) {
  // Get comments for a listing
  fastify.get<{ Params: { listingId: string } }>('/listings/:listingId/comments', async (request, reply) => {
    const comments = await prisma.comment.findMany({
      where: { listingId: request.params.listingId },
      orderBy: { createdAt: 'asc' }
    })
    const userIds = [...new Set(comments.map(c => c.userId))]
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    const userMap = Object.fromEntries(users.map(u => [u.id, u.name]))
    return comments.map(c => ({ ...c, userName: userMap[c.userId] || 'Unknown' }))
  })

  // Post a comment
  fastify.post<{ Params: { listingId: string }; Body: { content: string } }>(
    '/listings/:listingId/comments', async (request, reply) => {
      const user = getUser(request)
      if (!user) return reply.status(401).send({ error: 'Unauthorized' })
      const { content } = request.body
      if (!content?.trim()) return reply.status(400).send({ error: 'Content required' })
      const comment = await prisma.comment.create({
        data: { listingId: request.params.listingId, userId: user.userId, content: content.trim() }
      })
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } })
      return reply.status(201).send({ ...comment, userName: dbUser?.name || 'Unknown' })
    }
  )
}
