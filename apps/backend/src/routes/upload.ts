import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

const JWT_SECRET = process.env.JWT_SECRET!

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function getUser(request: any) {
  const authHeader = request.headers.authorization
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export default async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post('/upload/card-image', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const data = await request.file()
    if (!data) return reply.status(400).send({ error: 'No file uploaded' })

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Only JPG, PNG, WebP images allowed' })
    }

    const result = await new Promise<any>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'pullverse' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      Readable.from(data.file).pipe(upload)
    })

    return reply.status(201).send({ imageUrl: result.secure_url })
  })
}
