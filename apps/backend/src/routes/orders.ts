import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import prisma from '../plugins/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

function getUser(request: any) {
  const authHeader = request.headers.authorization
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export default async function orderRoutes(fastify: FastifyInstance) {

  // POST - Place an order (buyer)
  fastify.post<{
    Body: {
      items: { listingId: string; quantity: number }[]
      address: string
      contactNumber: string
    }
  }>('/orders', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Please login to place an order' })

    const { items, address, contactNumber } = request.body
    let total = 0
    const resolvedItems: { listing: any; quantity: number }[] = []

    for (const item of items) {
      const listing = await prisma.listing.findUnique({ where: { id: item.listingId } })
      if (!listing) return reply.status(404).send({ error: 'Listing not found' })
      if (item.quantity < 1) {
        return reply.status(400).send({ error: `Invalid quantity for ${listing.id}` })
      }
      if (item.quantity > listing.stock) {
        return reply.status(400).send({ 
          error: `Only ${listing.stock} unit${listing.stock === 1 ? '' : 's'} available` 
        })
      }
      total += parseFloat(listing.price.toString()) * item.quantity
      resolvedItems.push({ listing, quantity: item.quantity })
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.userId,
          total,
          status: 'PENDING',
          address,
          contactNumber,
          items: {
            create: resolvedItems.map(({ listing, quantity }) => ({
              listingId: listing.id,
              quantity,
              price: listing.price
            }))
          }
        },
        include: { items: true }
      })
      for (const { listing, quantity } of resolvedItems) {
        await tx.listing.update({
          where: { id: listing.id },
          data: { stock: { decrement: quantity } }
        })
      }
      return newOrder
    })

    return reply.status(201).send(order)
  })

  // GET - Buyer's own orders
  fastify.get('/orders/my', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        items: {
          include: { listing: { include: { card: true, seller: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return orders
  })

  // GET - Seller's incoming orders
  fastify.get('/orders/seller', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const seller = await prisma.seller.findUnique({ where: { userId: user.userId } })
    if (!seller) return reply.status(404).send({ error: 'Shop not found' })

    // Get all orders that contain this seller's listings
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            listing: { sellerId: seller.id }
          }
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          where: { listing: { sellerId: seller.id } },
          include: { listing: { include: { card: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return orders
  })

  // PATCH - Update order status (seller only)
  fastify.patch<{
    Params: { id: string }
    Body: { status: string }
  }>('/orders/:id/status', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const seller = await prisma.seller.findUnique({ where: { userId: user.userId } })
    if (!seller) return reply.status(403).send({ error: 'Not a seller' })

    const { status } = request.body
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({ error: 'Invalid status' })
    }

    const order = await prisma.order.update({
      where: { id: request.params.id },
      data: { status: status as any }
    })
    return order
  })
}