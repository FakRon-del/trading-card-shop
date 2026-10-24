import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import type { Stripe as StripeType } from 'stripe'
import prisma from '../plugins/prisma'


const JWT_SECRET = process.env.JWT_SECRET!

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not set in .env')
  return new Stripe(key)
}

function getUser(request: any) {
  const authHeader = request.headers.authorization
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export default async function paymentRoutes(fastify: FastifyInstance) {

  // POST - Create Stripe checkout session
  fastify.post<{
    Body: {
      items: { listingId: string; quantity: number }[]
      address: string
      contactNumber: string
    }
  }>('/payments/create-checkout', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const { items, address, contactNumber } = request.body

    // Validate items and build line items
    const lineItems = []
    const resolvedItems: { listing: any; quantity: number }[] = []
    let total = 0

    for (const item of items) {
      const listing = await prisma.listing.findUnique({
        where: { id: item.listingId },
        include: { card: true, seller: true }
      })

      if (!listing) return reply.status(404).send({ error: 'Listing not found' })
      if (listing.seller.userId === user.userId) {
        return reply.status(400).send({ error: 'You cannot purchase your own listing' })
      }
      if (item.quantity > listing.stock) {
        return reply.status(400).send({ error: 'Not enough stock' })
      }

      const priceInCents = Math.round(parseFloat(listing.price.toString()) * 100)
      total += parseFloat(listing.price.toString()) * item.quantity

      lineItems.push({
        price_data: {
          currency: 'php',
          product_data: {
            name: listing.card.name,
            description: `${listing.condition.replace(/_/g, ' ')} · ${listing.card.set}`,
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      })

      resolvedItems.push({ listing, quantity: item.quantity })
    }

    // Create Stripe checkout session
        const session = await getStripe().checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`,
      metadata: {
        userId: user.userId,
        address,
        contactNumber,
        items: JSON.stringify(items),
      },
    })

    return reply.send({ sessionId: session.id, url: session.url })
  })

  // POST - Stripe webhook (called by Stripe after payment)
  fastify.post('/payments/webhook', {
    config: { rawBody: true }
  }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

      let event: StripeType.Event

    try {
      event = getStripe().webhooks.constructEvent(
        (request as any).rawBody,
        sig,
        webhookSecret!
      )
    } catch (err: any) {
      return reply.status(400).send({ error: `Webhook error: ${err.message}` })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as StripeType.Checkout.Session
      const meta = session.metadata!

      const items: { listingId: string; quantity: number }[] = JSON.parse(meta.items)
      let total = 0
      const resolvedItems: { listing: any; quantity: number }[] = []

      for (const item of items) {
        const listing = await prisma.listing.findUnique({ where: { id: item.listingId } })
        if (!listing) continue
        total += parseFloat(listing.price.toString()) * item.quantity
        resolvedItems.push({ listing, quantity: item.quantity })
      }

      // Create order in database
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId: meta.userId,
            total,
            status: 'PAID',
            address: meta.address,
            contactNumber: meta.contactNumber,
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
      await prisma.notification.create({
        data: {
          userId: meta.userId,
          title: 'Payment Confirmed!',
          message: `Your payment for order #${order.id.slice(-8).toUpperCase()} was successful.`,
          type: 'ORDER'
        }
      })
    }

    return reply.send({ received: true })
  })

  // GET - Verify payment session
  fastify.get<{ Querystring: { session_id: string } }>(
    '/payments/verify', async (request, reply) => {
      const user = getUser(request)
      if (!user) return reply.status(401).send({ error: 'Unauthorized' })

      const session = await getStripe().checkout.sessions.retrieve(
        request.query.session_id,
        { expand: ['line_items'] }
      )

      return {
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
      }
    }
  )
}