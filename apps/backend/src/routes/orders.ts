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

export default async function orderRoutes(fastify: FastifyInstance) {

  // POST - Place an order
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

    for (const orderItem of items) {
      if (orderItem.quantity < 1) {
        return reply.status(400).send({ error: 'Invalid quantity' })
      }

      const listing = await prisma.listing.findUnique({
        where: { id: orderItem.listingId },
        include: { seller: true }
      })

      if (!listing) {
        return reply.status(404).send({ error: 'Listing not found' })
      }

      // Block self-purchase
      if (listing.seller.userId === user.userId) {
        return reply.status(400).send({ error: 'You cannot purchase your own listing' })
      }

      if (orderItem.quantity > listing.stock) {
        return reply.status(400).send({
          error: `Only ${listing.stock} unit${listing.stock === 1 ? '' : 's'} available`
        })
      }

      total += parseFloat(listing.price.toString()) * orderItem.quantity
      resolvedItems.push({ listing, quantity: orderItem.quantity })
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

    // Notify buyer
    await createNotification({
      userId: user.userId,
      title: 'Order Confirmed!',
      message: `Your order #${order.id.slice(-8).toUpperCase()} has been placed successfully.`,
      type: 'ORDER'
    })

    // Notify each seller
    const sellerIds = new Set(resolvedItems.map(({ listing }) => listing.sellerId))
    for (const sellerId of sellerIds) {
      const seller = await prisma.seller.findUnique({ where: { id: sellerId } })
      if (seller) {
        await createNotification({
          userId: seller.userId,
          title: 'New Order Received!',
          message: `You have a new order #${order.id.slice(-8).toUpperCase()}. Check your dashboard.`,
          type: 'ORDER'
        })
      }
    }

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

    const orders = await prisma.order.findMany({
      where: {
        items: { some: { listing: { sellerId: seller.id } } }
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

    // Notify buyer about status change
    const statusMessages: Record<string, string> = {
      PAID:      'Your payment has been confirmed.',
      SHIPPED:   'Your order is on its way!',
      DELIVERED: 'Your order has been delivered. Enjoy your cards!',
      CANCELLED: 'Your order has been cancelled.',
    }

    if (statusMessages[status]) {
      await createNotification({
        userId: order.userId,
        title: `Order ${status}`,
        message: `Order #${order.id.slice(-8).toUpperCase()}: ${statusMessages[status]}`,
        type: 'ORDER'
      })
    }

    return order
  })
}