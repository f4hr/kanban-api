import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { boardParams } from '.';

export function getBoard(server: FastifyInstance) {
  server.get<{ Params: FromSchema<typeof boardParams> }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for getting a board',
        tags: ['boards'],
        security: [{ BearerAuth: [] }],
        params: boardParams,
        response: {
          200: {
            description: 'Success Response',
            $ref: 'BoardDetails#',
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { userId } = request.user;

      try {
        // Check if user exists
        const user = await server.db.user.findOne({ id: userId });
        if (user == null) {
          reply.unauthorized();
          return;
        }

        const board = await server.db.board.findOne({ id });
        if (board == null) {
          reply.notFound();
          return;
        }

        // Check if board includes user
        await board.users.init();
        if (!board.users.contains(user)) {
          reply.unauthorized('Board does not include provided user');
          return;
        }

        const boardDetails = await server.db.boardDetails.findOne(
          { boardId: board._id },
          { populate: ['listIds', 'lists', 'cards'] },
        );
        if (!boardDetails) {
          reply.notFound();
          return;
        }

        const { lists, cards } = boardDetails;

        const listMap = lists
          ? lists.reduce(
              (acc, l) => ({
                ...acc,
                [l.id]: l,
              }),
              {},
            )
          : {};
        const cardMap = cards
          ? cards.reduce(
              (acc, c) => ({
                ...acc,
                [c.id]: c,
              }),
              {},
            )
          : {};

        const result = {
          id: boardDetails.id,
          boardId: boardDetails.boardId,
          listIds: boardDetails.listIds,
          name: board.name,
          lists: listMap,
          cards: cardMap,
        };

        reply.send(result);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to get board');
      }
    },
  );
}
