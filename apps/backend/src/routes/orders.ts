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
  } catch {
    return null
  }
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

    // Validate all listings exist and have enough stock
    let total = 0
    const resolvedItems: { listing: any; quantity: number }[] = []

    for (const item of items) {
      const listing = await prisma.listing.findUnique({
        where: { id: item.listingId }
      })

      if (!listing) {
        return reply.status(404).send({ error: `Listing not found` })
      }
      if (listing.stock < item.quantity) {
        return reply.status(400).send({ error: `Not enough stock for one of your items` })
      }

      total += parseFloat(listing.price.toString()) * item.quantity
      resolvedItems.push({ listing, quantity: item.quantity })
    }

    // Create order + items + reduce stock in one transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.userId,
          total,
          status: 'PENDING',
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

      // Reduce stock for each listing
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

  // GET - My orders (buyer)
  fastify.get('/orders/my', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            listing: {
              include: { card: true, seller: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return orders
  })
}