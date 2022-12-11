import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { genObjectID } from '../../utils';
import { listParams } from '.';

export function deleteList(server: FastifyInstance) {
  const deleteListBody = {
    description: 'Payload for deleting a list',
    type: 'object',
    required: ['boardId'],
    properties: {
      boardId: { type: 'string' },
    },
  } as const;

  server.delete<{ Params: FromSchema<typeof listParams>; Body: FromSchema<typeof deleteListBody> }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for deleting a list',
        tags: ['lists'],
        security: [{ BearerAuth: [] }],
        params: listParams,
        body: deleteListBody,
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
      const { boardId } = request.body;

      if (boardId === '') {
        reply.badRequest('One of fields (boardId) is empty');
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

        boardDetails.listIds = boardDetails.listIds.filter((listId) => listId.toHexString() !== id);
        boardDetails.lists = boardDetails.lists.filter((l) => l.id !== id);
        boardDetails.cards = boardDetails.cards.filter((c) => c.listId.toHexString() !== id);

        await server.db.em.flush();

        reply.send(list);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to delete list');
      }
    },
  );
}
