import type { FastifyPluginAsync } from 'fastify';

const health: FastifyPluginAsync = async (server): Promise<void> => {
  server.get(
    '/',
    {
      schema: {
        description: 'This is an endpoint for application health check',
        tags: ['health'],
        response: {
          200: {
            description: 'Success Response',
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    (_req, reply) => {
      reply.send({ message: 'The Application is Up and Running' });
    },
  );
};

export default health;
