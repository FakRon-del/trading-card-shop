import { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { v4 as uuidv4 } from 'uuid'

const JWT_SECRET = process.env.JWT_SECRET!

function getUser(request: any) {
  const authHeader = request.headers.authorization
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export default async function uploadRoutes(fastify: FastifyInstance) {

  // Serve static uploaded files
  fastify.get<{ Params: { filename: string } }>(
    '/uploads/:filename',
    async (request, reply) => {
      const filePath = path.join(process.cwd(), 'src', 'uploads', request.params.filename)
      if (!fs.existsSync(filePath)) {
        return reply.status(404).send({ error: 'File not found' })
      }
      const stream = fs.createReadStream(filePath)
      return reply.send(stream)
    }
  )

  // POST - Upload a card image
  fastify.post('/upload/card-image', async (request, reply) => {
    const user = getUser(request)
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const data = await request.file()
    if (!data) return reply.status(400).send({ error: 'No file uploaded' })

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Only JPG, PNG, WebP images allowed' })
    }

    // Generate unique filename
    const ext = path.extname(data.filename) || '.jpg'
    const filename = `${uuidv4()}${ext}`
    const uploadPath = path.join(process.cwd(), 'src', 'uploads', filename)

    // Save file
    await pipeline(data.file, fs.createWriteStream(uploadPath))

    const imageUrl = `http://localhost:4000/api/uploads/${filename}`
    return reply.status(201).send({ imageUrl, filename })
  })
}