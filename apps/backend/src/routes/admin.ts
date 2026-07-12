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

function requireAdmin(request: any, reply: any) {
  const user = getUser(request)
  if (!user) { reply.status(401).send({ error: 'Unauthorized' }); return null }
  if (user.role !== 'ADMIN') { reply.status(403).send({ error: 'Admin only' }); return null }
  return user
}

export default async function adminRoutes(fastify: FastifyInstance) {

  // GET - Dashboard stats
  fastify.get('/admin/stats', async (request, reply) => {
    if (!requireAdmin(request, reply)) return

    const [users, sellers, orders, listings] = await Promise.all([
      prisma.user.count(),
      prisma.seller.count(),
      prisma.order.count(),
      prisma.listing.count(),
    ])

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { listing: { include: { card: true } } } }
      }
    })

    const revenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } }
    })

    return {
      stats: { users, sellers, orders, listings },
      revenue: revenue._sum.total ?? 0,
      recentOrders
    }
  })

  // GET - All users
  fastify.get('/admin/users', async (request, reply) => {
    if (!requireAdmin(request, reply)) return
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true,
        role: true, isBanned: true, createdAt: true,
        seller: { select: { shopName: true, isVerified: true } }
      }
    })
    return users
  })

  // PATCH - Ban/unban user
  fastify.patch<{ Params: { id: string }; Body: { isBanned: boolean } }>(
    '/admin/users/:id/ban', async (request, reply) => {
      if (!requireAdmin(request, reply)) return
      const user = await prisma.user.update({
        where: { id: request.params.id },
        data: { isBanned: request.body.isBanned }
      })
      return { success: true, isBanned: user.isBanned }
    }
  )

  // PATCH - Change user role
  fastify.patch<{ Params: { id: string }; Body: { role: string } }>(
    '/admin/users/:id/role', async (request, reply) => {
      if (!requireAdmin(request, reply)) return
      const user = await prisma.user.update({
        where: { id: request.params.id },
        data: { role: request.body.role as any }
      })
      return { success: true, role: user.role }
    }
  )

  // GET - All sellers
  fastify.get('/admin/sellers', async (request, reply) => {
    if (!requireAdmin(request, reply)) return
    const sellers = await prisma.seller.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, isBanned: true } },
        _count: { select: { listings: true } }
      }
    })
    return sellers
  })

  // PATCH - Verify/unverify seller
  fastify.patch<{ Params: { id: string }; Body: { isVerified: boolean } }>(
    '/admin/sellers/:id/verify', async (request, reply) => {
      if (!requireAdmin(request, reply)) return
      const seller = await prisma.seller.update({
        where: { id: request.params.id },
        data: { isVerified: request.body.isVerified }
      })
      return { success: true, isVerified: seller.isVerified }
    }
  )

  // GET - All orders
  fastify.get('/admin/orders', async (request, reply) => {
    if (!requireAdmin(request, reply)) return
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            listing: {
              include: {
                card: true,
                seller: { select: { shopName: true } }
              }
            }
          }
        }
      }
    })
    return orders
  })

  // GET - All listings
  fastify.get('/admin/listings', async (request, reply) => {
    if (!requireAdmin(request, reply)) return
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        card: true,
        seller: { select: { shopName: true } }
      }
    })
    return listings
  })

  // DELETE - Remove any listing
  fastify.delete<{ Params: { id: string } }>(
    '/admin/listings/:id', async (request, reply) => {
      if (!requireAdmin(request, reply)) return
      await prisma.listing.delete({ where: { id: request.params.id } })
      return { success: true }
    }
  )
}