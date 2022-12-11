import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { userParams } from '.';

export function updateUser(server: FastifyInstance) {
  const updateUserBody = {
    description: 'Payload for updating a user',
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
    },
  } as const;

  server.patch<{
    Body: FromSchema<typeof updateUserBody>;
    Params: FromSchema<typeof userParams>;
  }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for updating a user',
        tags: ['users'],
        security: [{ BearerAuth: [] }],
        body: updateUserBody,
        params: userParams,
        response: {
          200: {
            description: 'Success Response',
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', nullable: true },
              email: { type: 'string', format: 'email' },
              boardIds: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user;
      const { id } = request.params;
      const { name } = request.body;

      if (name === '') {
        reply.badRequest('One of fields (name) is empty');
        return;
      }

      try {
        // Check if user exists
        const user = await server.db.user.findOne({ id: userId }, { fields: ['name', 'email'] });
        if (user == null || userId !== id) {
          reply.unauthorized();
          return;
        }

        user.name = name;
        await server.db.em.persistAndFlush(user);

        reply.send(user);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to update user');
      }
    },
  );
}
