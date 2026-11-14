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

export default async function dealRoutes(fastify: FastifyInstance) {
  // Request a deal
  fastify.post<{ Body: { listingId: string } }>('/deals/request', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })
    const { listingId } = request.body
    const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { seller: true } })
    if (!listing) return reply.status(404).send({ error: 'Listing not found' })
    if (listing.seller.userId === user.userId) return reply.status(400).send({ error: 'Cannot deal with yourself' })
    // Check if deal already exists
    const existing = await prisma.dealRoom.findFirst({
      where: { listingId, buyerId: user.userId, status: { in: ['PENDING', 'ACCEPTED'] } }
    })
    if (existing) return reply.status(400).send({ error: 'Deal already requested', dealRoomId: existing.id })
    const deal = await prisma.dealRoom.create({
      data: { listingId, buyerId: user.userId, sellerId: listing.seller.userId }
    })
    return reply.status(201).send(deal)
  })

  // Get my deal rooms (buyer or seller)
  fastify.get('/deals', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })
    const deals = await prisma.dealRoom.findMany({
      where: { OR: [{ buyerId: user.userId }, { sellerId: user.userId }] },
      include: { messages: { orderBy: { createdAt: 'desc' as const }, take: 1 } },
      orderBy: { updatedAt: 'desc' }
    })
    const userIds = [...new Set(deals.flatMap(d => [d.buyerId, d.sellerId]))]
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    const userMap = Object.fromEntries(users.map(u => [u.id, u.name]))
    return deals.map(d => ({ ...d, buyerName: userMap[d.buyerId], sellerName: userMap[d.sellerId] }))
  })

  // Get pending deals for seller
  fastify.get('/deals/pending', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })
    return prisma.dealRoom.findMany({
      where: { sellerId: user.userId, status: 'PENDING' },
      include: { listing: { include: { card: true } } },
      orderBy: { createdAt: 'desc' }
    })
  })

  // Get single deal room
  fastify.get<{ Params: { id: string } }>('/deals/:id', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })
    const deal = await prisma.dealRoom.findUnique({
      where: { id: request.params.id },
      include: { listing: { include: { card: true, seller: true } }, messages: { orderBy: { createdAt: 'asc' } } }
    })
    if (!deal) return reply.status(404).send({ error: 'Not found' })
    if (deal.buyerId !== user.userId && deal.sellerId !== user.userId)
      return reply.status(403).send({ error: 'Forbidden' })
    const userIds = [...new Set(deal.messages.map(m => m.senderId))]
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    const userMap = Object.fromEntries(users.map(u => [u.id, u.name]))
    const buyer = await prisma.user.findUnique({ where: { id: deal.buyerId }, select: { id: true, name: true } })
    const seller = await prisma.user.findUnique({ where: { id: deal.sellerId }, select: { id: true, name: true } })
    return {
      ...deal,
      buyerName: buyer?.name,
      sellerName: seller?.name,
      messages: deal.messages.map(m => ({ ...m, senderName: userMap[m.senderId] || 'Unknown' }))
    }
  })

  // Accept or decline deal (seller only)
  fastify.patch<{ Params: { id: string }; Body: { status: 'ACCEPTED' | 'DECLINED' } }>(
    '/deals/:id/status', async (request, reply) => {
      const user = getUser(request)
      if (!user) return reply.status(401).send({ error: 'Unauthorized' })
      const deal = await prisma.dealRoom.findUnique({ where: { id: request.params.id } })
      if (!deal) return reply.status(404).send({ error: 'Not found' })
      if (deal.sellerId !== user.userId) return reply.status(403).send({ error: 'Forbidden' })
      return prisma.dealRoom.update({ where: { id: request.params.id }, data: { status: request.body.status } })
    }
  )

  // Send a message
  fastify.post<{ Params: { id: string }; Body: { content: string } }>(
    '/deals/:id/messages', async (request, reply) => {
      const user = getUser(request)
      if (!user) return reply.status(401).send({ error: 'Unauthorized' })
      const deal = await prisma.dealRoom.findUnique({ where: { id: request.params.id } })
      if (!deal) return reply.status(404).send({ error: 'Not found' })
      if (deal.buyerId !== user.userId && deal.sellerId !== user.userId)
        return reply.status(403).send({ error: 'Forbidden' })
      if (deal.status !== 'ACCEPTED') return reply.status(400).send({ error: 'Deal not active' })
      const message = await prisma.message.create({
        data: { dealRoomId: request.params.id, senderId: user.userId, content: request.body.content }
      })
      await prisma.dealRoom.update({ where: { id: request.params.id }, data: { updatedAt: new Date() } })
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } })
      return reply.status(201).send({ ...message, senderName: dbUser?.name })
    }
  )

  // Set meetup location
  fastify.patch<{ Params: { id: string }; Body: { meetupLat: number; meetupLng: number; meetupNote?: string } }>(
    '/deals/:id/meetup', async (request, reply) => {
      const user = getUser(request)
      if (!user) return reply.status(401).send({ error: 'Unauthorized' })
      const deal = await prisma.dealRoom.findUnique({ where: { id: request.params.id } })
      if (!deal) return reply.status(404).send({ error: 'Not found' })
      if (deal.buyerId !== user.userId && deal.sellerId !== user.userId)
        return reply.status(403).send({ error: 'Forbidden' })
      return prisma.dealRoom.update({
        where: { id: request.params.id },
        data: { meetupLat: request.body.meetupLat, meetupLng: request.body.meetupLng, meetupNote: request.body.meetupNote }
      })
    }
  )
}
