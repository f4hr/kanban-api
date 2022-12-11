import { FromSchema } from 'json-schema-to-ts';

import type { FastifyInstance } from 'fastify';

import { genObjectID } from '../../utils';
import { List } from '../../entities';

export function createList(server: FastifyInstance) {
  const createListBody = {
    description: 'Payload for creating a new list',
    type: 'object',
    required: ['name', 'boardId'],
    properties: {
      name: { type: 'string' },
      boardId: { type: 'string' },
    },
  } as const;

  server.post<{ Body: FromSchema<typeof createListBody> }>(
    '/',
    {
      preValidation: [server.authenticate],
      schema: {
        description: 'This is an endpoint for creating a new list',
        tags: ['lists'],
        security: [{ BearerAuth: [] }],
        body: createListBody,
        response: {
          201: {
            description: 'Success Response',
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              boardId: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.user;
      const { name, boardId } = request.body;

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

        const boardDetails = await server.db.boardDetails.findOne(
          { boardId: genObjectID(boardId) },
          { populate: ['listIds', 'lists'] },
        );
        if (boardDetails == null) {
          reply.notFound('Board not found');
          return;
        }

        const list = new List(name, boardDetails.boardId);
        boardDetails.listIds.push(list._id as any);
        boardDetails.lists.push(list);

        await server.db.em.flush();

        reply.send(list);
      } catch (err) {
        console.log(err);

        reply.internalServerError('Failed to create list');
      }
    },
  );
}
