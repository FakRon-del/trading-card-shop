import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import prisma from '../plugins/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get user from token
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

export default async function sellerRoutes(fastify: FastifyInstance) {

   // POST - Setup shop (first time)
  fastify.post<{
    Body: { shopName: string; description?: string }
  }>('/seller/setup', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })
    if (user.role !== 'SELLER') return reply.status(403).send({ error: 'Not a seller account' })

    // Check if seller already has a shop
    const existingShop = await prisma.seller.findUnique({
      where: { userId: user.userId }
    })
    if (existingShop) {
      // Already has a shop — just return it instead of erroring
      return reply.status(200).send(existingShop)
    }

    const { shopName, description } = request.body

    // Check shop name taken
    const nameTaken = await prisma.seller.findUnique({ where: { shopName } })
    if (nameTaken) return reply.status(400).send({ error: 'Shop name already taken — please choose another' })

    const seller = await prisma.seller.create({
      data: { userId: user.userId, shopName, description }
    })

    return reply.status(201).send(seller)
  })

  // GET - My shop info
  fastify.get('/seller/me', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const seller = await prisma.seller.findUnique({
      where: { userId: user.userId },
      include: {
        listings: {
          include: { card: true }
        }
      }
    })

    if (!seller) return reply.status(404).send({ error: 'Shop not found' })
    return seller
  })

  // POST - Create a listing
  fastify.post<{
    Body: {
      cardName: string
      set: string
      number: string
      rarity: string
      category?: string
      imageUrl?: string
      condition: string
      availability?: string
      price: number
      stock: number
      description?: string
    }
  }>('/seller/listings', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const seller = await prisma.seller.findUnique({ where: { userId: user.userId } })
    if (!seller) return reply.status(404).send({ error: 'Set up your shop first' })

    const { cardName, set, number, rarity, category, imageUrl, condition, availability, price, stock, description } = request.body

    // Find or create the card
    let card = await prisma.card.findFirst({
      where: { name: cardName, set, number }
    })

    if (!card) {
      card = await prisma.card.create({
        data: {
          name: cardName, set, number, rarity, imageUrl,
          category: (category as any) || 'SINGLE_CARD'
        }
      })
    }

    const listing = await prisma.listing.create({
      data: {
        cardId: card.id,
        sellerId: seller.id,
        condition: condition as any,
        availability: (availability as any) || 'ON_HAND',
        price,
        stock,
        description
      },
      include: { card: true }
    })

    return reply.status(201).send(listing)
  })

  // DELETE - Remove a listing
  fastify.delete<{
    Params: { id: string }
  }>('/seller/listings/:id', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const seller = await prisma.seller.findUnique({ where: { userId: user.userId } })
    if (!seller) return reply.status(404).send({ error: 'Shop not found' })

    const listing = await prisma.listing.findUnique({
      where: { id: request.params.id },
      include: { orderItems: true }
    })
    if (!listing) return reply.status(404).send({ error: 'Listing not found' })
    if (listing.sellerId !== seller.id) return reply.status(403).send({ error: 'Not your listing' })

    // Block deletion if listing has been ordered
    if (listing.orderItems.length > 0) {
      return reply.status(400).send({
        error: 'This card cannot be removed because it has been purchased by a buyer. You can set the stock to 0 instead.'
      })
    }

    await prisma.listing.delete({ where: { id: request.params.id } })
    return { success: true }
  })

  // GET - Public shop page by shopName
  fastify.get<{
    Params: { shopName: string }
  }>('/shops/:shopName', async (request, reply) => {
    const seller = await prisma.seller.findUnique({
      where: { shopName: request.params.shopName },
      include: {
        listings: {
          include: { card: true }
        }
      }
    })
    if (!seller) return reply.status(404).send({ error: 'Shop not found' })
    return seller
  })

    // PATCH - Upgrade buyer to seller
  fastify.patch('/seller/upgrade', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: { role: 'SELLER' },
      select: { id: true, email: true, name: true, role: true }
    })

    // Issue new token with updated role
    const jwt = require('jsonwebtoken')
    const newToken = jwt.sign(
      { userId: updated.id, email: updated.email, role: updated.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return { success: true, token: newToken, user: updated }
  })

   // PATCH - Downgrade seller back to buyer
  fastify.patch('/seller/downgrade', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const seller = await prisma.seller.findUnique({
      where: { userId: user.userId },
      include: {
        listings: {
          include: {
            orderItems: {
              include: { order: true }
            }
          }
        }
      }
    })

    // If no shop exists, just downgrade directly
    if (seller) {
      const activeOrders = seller.listings.flatMap(l => l.orderItems)
        .filter(item => ['PENDING', 'PAID', 'SHIPPED'].includes(item.order.status))

      if (activeOrders.length > 0) {
        return reply.status(400).send({
          error: `You have ${activeOrders.length} active order(s) that must be completed or cancelled before downgrading.`
        })
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: { role: 'BUYER' },
      select: { id: true, email: true, name: true, role: true }
    })

    // Issue new token with updated role
    const jwt = require('jsonwebtoken')
    const newToken = jwt.sign(
      { userId: updated.id, email: updated.email, role: updated.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return { success: true, token: newToken, user: updated }
  })
}