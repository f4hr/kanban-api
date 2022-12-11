import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { genObjectID } from '../../utils';
import { cardParams } from '.';

export function deleteCard(server: FastifyInstance) {
  const deleteCardBody = {
    description: 'Payload for deleting a card',
    type: 'object',
    required: ['boardId', 'listId'],
    properties: {
      boardId: { type: 'string' },
      listId: { type: 'string' },
    },
  } as const;

  server.delete<{ Params: FromSchema<typeof cardParams>; Body: FromSchema<typeof deleteCardBody> }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for deleting a card',
        tags: ['cards'],
        security: [{ BearerAuth: [] }],
        params: cardParams,
        body: deleteCardBody,
        response: {
          200: {
            description: 'Success Response',
            type: 'object',
            $ref: 'Card#',
          },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user;
      const { id } = request.params;
      const { boardId, listId } = request.body;

      if (boardId === '' || listId === '') {
        reply.badRequest('One of fields (boardId, listId) is empty');
        return;
      }

      try {
        // Check if user exists
        const user = await server.db.user.findOne({ id: userId });
        if (user == null) {
          reply.unauthorized();
          return;
        }

        const boardDetails = await server.db.boardDetails.findOne(
          { boardId: genObjectID(boardId) },
          { populate: ['listIds', 'lists'] },
        );
        if (boardDetails == null) {
          reply.notFound('Board not found');
          return;
        }

        const list = boardDetails.lists.find((l) => l._id.toHexString() === listId);
        if (list == null) {
          reply.notFound('List not found');
          return;
        }

        const card = boardDetails.cards.find((c) => c.id === id);
        if (card == null) {
          reply.notFound('Card not found');
          return;
        }

        boardDetails.cards = boardDetails.cards.filter((c) => c.id !== id);
        list.cardIds = list.cardIds.filter((c) => c.toHexString() !== id);

        await server.db.em.flush();

        reply.send(card);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to delete card');
      }
    },
  );
}
