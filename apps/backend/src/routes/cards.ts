import { FastifyInstance } from 'fastify'
import prisma from '../plugins/prisma'

export default async function cardRoutes(fastify: FastifyInstance) {

  // GET all cards
  fastify.get('/cards', async (request, reply) => {
    const cards = await prisma.card.findMany({
      include: { listings: { include: { seller: true } } }
    })
    return cards
  })

  // GET single card by ID
  fastify.get<{ Params: { id: string } }>('/cards/:id', async (request, reply) => {
    const { id } = request.params
    const card = await prisma.card.findUnique({
      where: { id },
      include: { listings: { include: { seller: true } } }
    })
    if (!card) {
      return reply.status(404).send({ error: 'Card not found' })
    }
    return card
  })

  // POST create a new card
  fastify.post<{
    Body: { name: string; set: string; number: string; rarity: string; imageUrl?: string }
  }>('/cards', async (request, reply) => {
    const { name, set, number, rarity, imageUrl } = request.body
    const card = await prisma.card.create({
      data: { name, set, number, rarity, imageUrl }
    })
    return reply.status(201).send(card)
  })

}