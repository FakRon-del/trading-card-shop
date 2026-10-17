import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import prisma from '../plugins/prisma'
import { createNotification } from '../plugins/notify'

const JWT_SECRET = process.env.JWT_SECRET!

function getUser(request: any) {
  const authHeader = request.headers.authorization
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export default async function reviewRoutes(fastify: FastifyInstance) {

  // POST - Submit a review
  fastify.post<{
    Body: {
      sellerId: string
      orderId: string
      rating: number
      comment?: string
    }
  }>('/reviews', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const { sellerId, orderId, rating, comment } = request.body

    // Validate rating
    if (rating < 1 || rating > 5) {
      return reply.status(400).send({ error: 'Rating must be between 1 and 5' })
    }

    // Check order exists and is delivered
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { listing: true }
        }
      }
    })

    if (!order) return reply.status(404).send({ error: 'Order not found' })
    if (order.userId !== user.userId) return reply.status(403).send({ error: 'Not your order' })
    if (order.status !== 'DELIVERED') {
      return reply.status(400).send({ error: 'You can only review delivered orders' })
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({ where: { orderId } })
    if (existing) {
      return reply.status(400).send({ error: 'You have already reviewed this order' })
    }

    // Verify the order contains items from this seller
    const hasSellerItems = order.items.some(
      item => item.listing.sellerId === sellerId
    )
    if (!hasSellerItems) {
      return reply.status(400).send({ error: 'This order has no items from this seller' })
    }

    const review = await prisma.review.create({
      data: { sellerId, buyerId: user.userId, orderId, rating, comment }
    })

    // Notify seller
    await createNotification({
      userId: (await prisma.seller.findUnique({ where: { id: sellerId } }))!.userId,
      title: 'New Review!',
      message: `You received a ${rating}⭐ review.${comment ? ` "${comment}"` : ''}`,
      type: 'REVIEW'
    })

    return reply.status(201).send(review)
  })

  // GET - Reviews for a seller
  fastify.get<{ Params: { sellerId: string } }>(
    '/reviews/seller/:sellerId', async (request, reply) => {
      const reviews = await prisma.review.findMany({
        where: { sellerId: request.params.sellerId },
        orderBy: { createdAt: 'desc' }
      })

      const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

      return {
        reviews,
        average: Math.round(avg * 10) / 10,
        total: reviews.length
      }
    }
  )

  // GET - Check if buyer can review an order
  fastify.get<{ Params: { orderId: string } }>(
    '/reviews/check/:orderId', async (request, reply) => {
      const user = getUser(request)
      if (!user) return reply.status(401).send({ error: 'Unauthorized' })

      const existing = await prisma.review.findUnique({
        where: { orderId: request.params.orderId }
      })

      return { canReview: !existing }
    }
  )
}