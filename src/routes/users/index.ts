import type { FastifyPluginAsync } from 'fastify';

import { createUser } from './createUser';
import { getUser } from './getUser';
import { updateUser } from './updateUser';

export const userParams = {
  description: 'User ID',
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
} as const;

const users: FastifyPluginAsync = async (server): Promise<void> => {
  createUser(server);
  getUser(server);
  updateUser(server);
};

export const autoPrefix = '/v1/users';

export default users;
