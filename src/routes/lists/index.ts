import type { FastifyPluginAsync } from 'fastify';

import { createList } from './createList';
import { updateList } from './updateList';
import { deleteList } from './deleteList';

export const listParams = {
  description: 'List ID',
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
} as const;

const lists: FastifyPluginAsync = async (server): Promise<void> => {
  createList(server);
  updateList(server);
  deleteList(server);
};

export const autoPrefix = '/v1/lists';

export default lists;
