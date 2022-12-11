import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { genObjectID } from '../../utils';
import { listParams } from '.';

export function updateList(server: FastifyInstance) {
  const updateListBody = {
    description: 'Payload for updating a list',
    type: 'object',
    required: ['boardId', 'name'],
    properties: {
      boardId: { type: 'string' },
      name: { type: 'string' },
    },
  } as const;

  server.patch<{
    Body: FromSchema<typeof updateListBody>;
    Params: FromSchema<typeof listParams>;
  }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for updating a list',
        tags: ['lists'],
        security: [{ BearerAuth: [] }],
        body: updateListBody,
        params: listParams,
        response: {
          200: {
            description: 'Success Response',
            type: 'null',
          },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user;
      const { id } = request.params;
      const { boardId, name } = request.body;

      if (name === '' || boardId === '') {
        reply.badRequest('One of fields (name, boardId) is empty');
        return;
      }

      try {
        // Check if user exists
        const user = await server.db.user.findOne({ id: userId });
        if (user == null) {
          reply.unauthorized();
          return;
        }

        const boardDetails = await server.db.boardDetails.findOne({
          boardId: genObjectID(boardId),
        });
        if (boardDetails == null) {
          reply.notFound('Board not found');
          return;
        }

        const list = boardDetails.lists.find((l) => l.id === id);
        if (list == null) {
          reply.notFound('List not found');
          return;
        }

        list.name = name;

        await server.db.em.flush();

        reply.send(list);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to update list');
      }
    },
  );
}
