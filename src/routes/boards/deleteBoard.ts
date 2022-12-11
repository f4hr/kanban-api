import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { boardParams } from '.';

export function deleteBoard(server: FastifyInstance) {
  server.delete<{ Params: FromSchema<typeof boardParams> }>(
    '/:id',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for deleting a board',
        tags: ['boards'],
        security: [{ BearerAuth: [] }],
        params: boardParams,
        response: {
          200: {
            description: 'Success Response',
            $ref: 'Board#',
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
          reply.notFound('Board not found');
          return;
        }

        const boardDetails = await server.db.boardDetails.findOne({ boardId: board._id });
        if (boardDetails == null) {
          reply.notFound('Board not found');
          return;
        }

        // Remove board from user
        user.boards.remove(board);

        await server.db.em.removeAndFlush([board, boardDetails]);

        await board.users.init();

        reply.send(board);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to delete board');
      }
    },
  );
}
