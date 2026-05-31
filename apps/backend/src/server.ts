import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';

dotenv.config();

const server = Fastify({
  logger: true
});

// Plugins
server.register(cors, {
  origin: 'http://localhost:3000' // Allow requests from Next.js
});
server.register(helmet);

// Health check route
server.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'Trading Card API is running' };
});

// Start server
const start = async () => {
  try {
    await server.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Server running at http://localhost:4000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();