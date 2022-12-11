import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

export function createBoard(server: FastifyInstance) {
  const createBoardBody = {
    description: 'Payload for creating a new board',
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
    },
  } as const;

  server.post<{ Body: FromSchema<typeof createBoardBody> }>(
    '/',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for creating a new board',
        tags: ['boards'],
        security: [{ BearerAuth: [] }],
        body: createBoardBody,
        response: {
          201: {
            description: 'Success Response',
            $ref: 'Board#',
          },
        },
      },
    },
    async (request, reply) => {
      const { name } = request.body;
      const { userId } = request.user;

      if (name === '') {
        reply.badRequest('One of fields (name) is empty');
        return;
      }

      try {
        // Check if user exists
        const user = await server.db.user.findOne({ id: userId });
        if (user == null) {
          reply.unauthorized();
          return;
        }

        const board = server.db.board.create({
          name,
          ownerId: user._id,
        });
        await server.db.em.persistAndFlush(board);

        board.users.add(user);

        server.db.boardDetails.create({
          boardId: board._id,
          listIds: [],
          lists: [],
          cards: [],
        });

        user.boards.add(board);

        await server.db.em.flush();

        reply.status(201).send(board);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to create board');
      }
    },
  );
}
