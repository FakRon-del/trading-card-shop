import prisma from './prisma'

export async function createNotification({
  userId,
  title,
  message,
  type = 'INFO'
}: {
  userId: string
  title: string
  message: string
  type?: string
}) {
  return prisma.notification.create({
    data: { userId, title, message, type }
  })
}