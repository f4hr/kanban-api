import type { FastifyInstance } from 'fastify';

export function getBoards(server: FastifyInstance) {
  server.get(
    '/',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for getting all user boards',
        tags: ['boards'],
        security: [{ BearerAuth: [] }],
        response: {
          200: {
            description: 'Success Response',
            type: 'object',
            properties: {
              boards: {
                type: 'array',
                items: {
                  $ref: 'Board#',
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user;

      try {
        // Check if user exists
        const user = await server.db.user.findOne({ id: userId });
        if (user == null) {
          reply.unauthorized();
          return;
        }

        await user.boards.init({ populate: ['users', 'ownerId'] });

        const boards = user.boards.toArray();

        console.log(boards);

        reply.send({ boards });
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to get boards');
      }
    },
  );
}
