import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { genObjectID } from '../../utils';
import { boardParams } from '.';

export function updateBoard(server: FastifyInstance) {
  const updateBoardBody = {
    description: 'Payload for updating a board',
    type: 'object',
    properties: {
      name: { type: 'string' },
      listIds: { type: 'array', items: { type: 'string' } },
      lists: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'cardIds'],
          properties: {
            id: { type: 'string' },
            cardIds: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  } as const;

  server.patch<{
    Body: FromSchema<typeof updateBoardBody>;
    Params: FromSchema<typeof boardParams>;
  }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for updating a board',
        tags: ['boards'],
        security: [{ BearerAuth: [] }],
        body: updateBoardBody,
        params: boardParams,
        response: {
          200: {
            description: 'Success Response',
            type: 'object',
            nullable: true,
            $ref: 'Board#',
          },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user;
      const { id } = request.params;
      const { name = '', listIds, lists } = request.body;

      try {
        // Check if user exists
        const user = await server.db.user.findOne({ id: userId });
        if (user == null) {
          reply.unauthorized();
          return;
        }

        const board = await server.db.board.findOne({ id }, { populate: ['users'] });
        if (board == null) {
          reply.notFound('Board not found');
          return;
        }

        if (name !== '') {
          board.name = name;

          await server.db.em.flush();

          reply.send(board);
          return;
        }

        const boardDetails = await server.db.boardDetails.findOne({ boardId: board._id });
        if (boardDetails == null) {
          reply.notFound('Board not found');
          return;
        }

        if (listIds) {
          boardDetails.listIds = listIds.map((l) => genObjectID(l));
        }

        if (lists) {
          lists.forEach((list) => {
            const currList = boardDetails.lists.find((l) => l.id === list.id);
            if (currList) {
              currList.cardIds = list.cardIds.map((cardId) => genObjectID(cardId));
              // Update parent list ID for cards
              list.cardIds.forEach((cardId) => {
                const currentCard = boardDetails.cards.find((c) => c.id === cardId);
                if (currentCard) {
                  currentCard.listId = genObjectID(list.id);
                }
              });
            }
          });
        }

        await server.db.em.flush();

        reply.status(200);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to update board');
      }
    },
  );
}
