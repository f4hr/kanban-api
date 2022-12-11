import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { userParams } from '.';

export function getUser(server: FastifyInstance) {
  server.get<{ Params: FromSchema<typeof userParams> }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for getting a user',
        tags: ['users'],
        security: [{ BearerAuth: [] }],
        params: userParams,
        response: {
          200: {
            description: 'Success Response',
            type: 'object',
            $ref: 'User#',
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { userId } = request.user;

      if (id !== userId) {
        reply.unauthorized();
        return;
      }

      try {
        const user = await server.db.user.findOne({ id: userId });
        if (user == null) {
          reply.unauthorized();
          return;
        }

        reply.send(user);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to get user');
      }
    },
  );
}
