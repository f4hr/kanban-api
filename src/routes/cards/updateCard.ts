import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { genObjectID } from '../../utils';
import { cardParams } from '.';

export function updateCard(server: FastifyInstance) {
  const updateCardBody = {
    description: 'Payload for renaming a card',
    type: 'object',
    required: ['name', 'boardId', 'listId'],
    properties: {
      name: { type: 'string' },
      boardId: { type: 'string' },
      listId: { type: 'string' },
    },
  } as const;

  server.patch<{
    Body: FromSchema<typeof updateCardBody>;
    Params: FromSchema<typeof cardParams>;
  }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for updating a card',
        tags: ['cards'],
        security: [{ BearerAuth: [] }],
        body: updateCardBody,
        params: cardParams,
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
      const { name, boardId, listId } = request.body;

      if (name === '' || boardId === '' || listId === '') {
        reply.badRequest('One of fields (name, boardId, listId) is empty');
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

        const card = boardDetails.cards.find((c) => c.id === id);
        if (card == null) {
          reply.notFound('Card not found');
          return;
        }

        card.name = name;

        await server.db.em.flush();

        reply.send(card);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to update card');
      }
    },
  );
}
