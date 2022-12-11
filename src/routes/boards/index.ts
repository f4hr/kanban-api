import type { FastifyPluginAsync } from 'fastify';

import { createBoard } from './createBoard';
import { getBoard } from './getBoard';
import { getBoards } from './getBoards';
import { updateBoard } from './updateBoard';
import { deleteBoard } from './deleteBoard';

export const boardParams = {
  description: 'Board ID',
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
} as const;

const boards: FastifyPluginAsync = async (server): Promise<void> => {
  createBoard(server);
  getBoard(server);
  getBoards(server);
  updateBoard(server);
  deleteBoard(server);
};

export const autoPrefix = '/v1/boards';

export default boards;
