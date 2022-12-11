import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { genObjectID } from '../../utils';
import { Card } from '../../entities';

export function createCard(server: FastifyInstance) {
  const createCardBody = {
    description: 'Payload for creating a new card',
    type: 'object',
    required: ['name', 'boardId', 'listId'],
    properties: {
      name: { type: 'string' },
      boardId: { type: 'string' },
      listId: { type: 'string' },
    },
  } as const;

  server.post<{ Body: FromSchema<typeof createCardBody> }>(
    '/',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for creating a new card',
        tags: ['cards'],
        security: [{ BearerAuth: [] }],
        body: createCardBody,
        response: {
          201: {
            description: 'Success Response',
            $ref: 'Card#',
          },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user;
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

        const card = new Card(name, boardDetails.boardId, list._id);
        boardDetails.cards.push(card);
        list.cardIds.push(card._id);

        await server.db.em.flush();

        reply.send(card);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to create card');
      }
    },
  );
}
